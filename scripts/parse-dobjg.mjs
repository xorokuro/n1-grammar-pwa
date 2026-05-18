import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const DOBJG_PATH = 'C:/Users/user/Downloads/DOBJG.txt'
const OUTPUT_PATH = join(__dir, '../src/data/dobjg.json')

const text = readFileSync(DOBJG_PATH, 'utf-8')
const lines = text.split('\n').map(l => l.trimEnd())

// ── Entry header detection ────────────────────────────────────────────────
// Matches: romaji[digits] [space?] hiragana  (two forms from OCR)
// e.g. "ba ば conj.", "ageru1あげる", "amariあまり adv."
const HEADER_RE = /^([a-z][a-z0-9]*)\s?([぀-ゟ])/

function isEntryHeader(line) {
  const l = line.trim()
  if (l.length > 70) return false
  if (l.includes('〇')) return false   // example-sentence placeholder
  if (l.includes('～')) return false   // content lines
  if (l.startsWith('(') || l.startsWith('[')) return false
  return HEADER_RE.test(l)
}

// ── Garbage / OCR-noise detection ────────────────────────────────────────
function isGarbage(line) {
  const l = line.trim()
  if (l.length === 0) return true
  // 5-8 digit standalone numbers = page/catalog artifacts (e.g. 699151, 482957)
  if (/^\d{5,8}$/.test(l)) return true
  // 1-2 lone CJK characters = chapter tab / figure label bleed
  if (/^[一-鿿]{1,2}$/.test(l)) return true
  // Chapter/section tab markers  e.g. "■DI", "■BA"
  if (/^■/.test(l)) return true
  // Roman numeral lines (II, III, IV ...) from page headers
  if (/^(I{2,4}|IV|VI{0,3}|IX|XI{0,3}|XIV?)$/.test(l)) return true
  // Bullet-dash noise  e.g. "•—i"
  if (/^[•·]\s*[—–\-]\s*[a-z]?$/.test(l)) return true
  const good = (l.match(/[a-zA-Z0-9぀-ヿ一-鿿\s.,!?()\[\]\-\/’’’"]/g) || []).length
  return good / l.length < 0.45 && l.length > 4
}

// ── Collect all entry headers ─────────────────────────────────────────────
const allHeaders = []
for (let i = 0; i < lines.length; i++) {
  if (isEntryHeader(lines[i])) {
    const m = lines[i].trim().match(HEADER_RE)
    allHeaders.push({ i, romaji: m[1], line: lines[i].trim() })
  }
}

// Keep only first occurrence of each romaji (= new entry, not a continuation)
// Restrict to Main Entries section (lines 2560-24000)
const seen = new Set()
const entryStarts = []
for (const h of allHeaders) {
  if (h.i < 2560 || h.i > 24000) continue
  if (!seen.has(h.romaji)) {
    seen.add(h.romaji)
    entryStarts.push(h)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function extractReading(headerLine) {
  // Strip leading romaji, then collect consecutive pure-hiragana/kanji tokens
  // (stops at the first token that contains non-hiragana — e.g. POS markers, noise)
  // Handles "kamoshirenai かも しれない aux." → "かもしれない"
  const withoutRomaji = headerLine.replace(/^[a-z][a-z0-9]*\s*/, '')
  const groups = []
  for (const token of withoutRomaji.split(/\s+/)) {
    if (/^[ぁ-ゟ一-鿿]+$/.test(token)) groups.push(token)
    else break
  }
  if (groups.length) return groups.join('')
  // Fallback: any hiragana run
  const m = withoutRomaji.match(/[ぁ-ゟ][ぁ-ゟ一-鿿]*/)
  return m ? m[0] : ''
}

function extractPOS(headerLine) {
  const m = headerLine.match(/\b(prt\.|conj\.|adv\.|aux\.\s*(?:adj|v)[\.\s(].*?(?=\s*$)|suf\.|v\.\s*\([^)]+\)|n\.|nom\.|cop\.|phr\.|adj\.\([^)]+\))/i)
  return m ? m[0].trim() : ''
}

function extractMeaning(contentLines) {
  for (let j = 1; j < Math.min(contentLines.length, 30); j++) {
    const l = contentLines[j].trim()
    if (!l || isGarbage(l)) continue
    if (/^[぀-ヿ一-鿿]/.test(l)) continue
    if (/^\d+$/.test(l) || /^[a-z][a-z0-9]* \d+$/.test(l) || /^\d+ [a-z]/.test(l)) continue
    if (/^\[REL/.test(l)) continue
    if (/^♦|^\*Key/.test(l)) continue
    if (/^[\/\\<>|｜⑸⑹⑺⑻⑼⑽]/.test(l)) continue
    if (/^(Formation|Examples?|Notes?)\s*$/i.test(l)) break
    if (l.length >= 3 && /[a-z]/i.test(l)) {
      return l.replace(/^[\/\\<>\s|]+/, '').replace(/\s+/g, ' ').trim()
    }
  }
  return ''
}

// Circle-number chars → plain letter  e.g. ⑴→(a), ⑵→(b)
const CIRCLE_MAP = {
  '⑴':'(a)','⑵':'(b)','⑶':'(c)','⑷':'(d)','⑸':'(e)','⑹':'(f)',
  '⑺':'(g)','⑻':'(h)','⑼':'(i)','⑽':'(j)','⑾':'(k)','⑿':'(l)',
  '(a)':'(a)','(b)':'(b)','(c)':'(c)','(d)':'(d)',
}

function buildRawContent(contentLines) {
  return contentLines
    .map(l => {
      const t = l.trim()
      if (!t || isGarbage(t)) return null
      // Page reference lines  e.g. "ba 83"  or  "83 ba"
      if (/^[a-z]+ \d+$/.test(t) || /^\d+ [a-z]/.test(t)) return null
      // Section headers → markdown
      if (/^♦\s*Key Sentence/i.test(t)) return '\n#### Key Sentences'
      if (/^Formation\s*$/i.test(t)) return '\n#### Formation'
      if (/^Examples\s*$/i.test(t)) return '\n#### Examples'
      if (/^[Oo]tes\s*$|^Notes?\s*$/i.test(t)) return '\n#### Notes'
      if (/^\[?Related Expression/i.test(t)) return '\n#### Related Expressions'
      // Normalize circle numbers
      let out = t
      for (const [k, v] of Object.entries(CIRCLE_MAP)) out = out.split(k).join(v)
      // Fix OCR reading "/" as "1" between words  e.g. "kita 1 kimashita" → "kita / kimashita"
      // Safe because DOBJG never uses standalone " 1 " mid-line in English prose
      out = out.replace(/([a-zA-Zぁ-ゟ一-鿿。、）\}]) 1 ([a-zA-Zぁ-ゟ一-鿿（\{])/g, '$1 / $2')
      return out
    })
    .filter(l => l !== null)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── OCR corrections ───────────────────────────────────────────────────────
// Map garbled romaji keys → corrected value (null = skip entry)
const ROMAJI_FIX = {
  'd6': 'do', 'kal': 'ka1', 'nil': 'ni1', 'm6': 'mou',
  'l': null, 't': null, 'x': null, 'h': null,
  'a': 'na',        // na な prt. — OCR dropped the 'n'
  'stem': null,     // Formation section noise
  're': null,       // spurious
  'suru': null,     // false positive from within koto1 entry (ことにする)
}

// Minimal hiragana check for reading — strip trailing non-hiragana noise
function cleanReading(r) {
  const match = r.match(/^[぀-ヿ一-鿿]+/)
  return match ? match[0] : r
}

// Check if a meaning line is genuine English (not OCR garbage)
function isRealMeaning(s) {
  if (!s || s.length < 5) return false
  const latin = (s.match(/[a-zA-Z]/g) || []).length
  if (latin / s.length < 0.35) return false
  // Must have at least one real word (3+ consecutive lowercase letters)
  return /[a-z]{3}/.test(s)
}

// ── Build JSON entries ────────────────────────────────────────────────────
const entries = []
const START_ID = 1001

for (let i = 0; i < entryStarts.length; i++) {
  const s = entryStarts[i]

  // Apply OCR fix / skip decision
  if (s.romaji in ROMAJI_FIX) {
    if (ROMAJI_FIX[s.romaji] === null) continue
    s.romaji = ROMAJI_FIX[s.romaji]
  }

  // Skip single-char romaji except 'e' (へ particle)
  if (s.romaji.length === 1 && s.romaji !== 'e') continue

  const end = i < entryStarts.length - 1 ? entryStarts[i + 1].i : lines.length
  const contentLines = lines.slice(s.i, Math.min(end, s.i + 500))

  const reading = cleanReading(extractReading(s.line))
  const partOfSpeech = extractPOS(s.line)
  const rawMeaning = extractMeaning(contentLines)
  const meaning = isRealMeaning(rawMeaning) ? rawMeaning : ''
  const rawContent = buildRawContent(contentLines)

  if (!reading) continue
  if (rawContent.length < 80) continue   // skip stubs / index noise

  entries.push({
    id: START_ID + entries.length,
    sourceId: 'dobjg',
    pattern: `～${reading}`,
    romaji: s.romaji,
    partOfSpeech,
    englishConcept: meaning.slice(0, 120),
    coreDefinitionZh: '',
    vibe: '',
    rawContent,
    relatedIds: [],
  })
}

writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2), 'utf-8')
console.log(`\nGenerated ${entries.length} DOBJG entries → src/data/dobjg.json\n`)
entries.forEach(e =>
  console.log(`  [${e.id}] ${e.romaji.padEnd(16)} ${e.pattern.padEnd(14)}  ${e.englishConcept.slice(0, 50)}`)
)
