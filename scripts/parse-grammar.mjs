import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const sourceDir = join(__dir, '../notes')
const outputPath = join(__dir, '../src/data/grammar.json')

const files = readdirSync(sourceDir).filter(f => f.endsWith('.md'))

const allPoints = []

for (const file of files) {
  const raw = readFileSync(join(sourceDir, file), 'utf-8')
  parseFile(raw, allPoints)
}

// Deduplicate by id (keep first occurrence)
const seen = new Set()
const unique = allPoints.filter(p => {
  if (seen.has(p.id)) return false
  seen.add(p.id)
  return true
})
unique.sort((a, b) => a.id - b.id)

writeFileSync(outputPath, JSON.stringify(unique, null, 2), 'utf-8')
console.log(`Parsed ${unique.length} grammar points → src/data/grammar.json`)

function parseFile(content, out) {
  // Header formats:
  //   ### #01 ～pattern        (batch 1)
  //   ## 16. ～pattern         (most batches, dot after number)
  //   ## [29] ～pattern        (batch 29-42, ASCII brackets)
  //   ## 【43】～pattern       (batch 43+, full-width brackets)
  const sectionRe = /(?:^|\n)(#{2,3})\s+(?:#(\d+)|(\d+)\.|\[(\d+)\]|【(\d+)】)\s*(.+?)(?=\n)([\s\S]*?)(?=\n#{2,3}\s+(?:#\d+|\d+\.|\[\d+\]|【\d+】)|$)/g

  let match
  while ((match = sectionRe.exec(content)) !== null) {
    const id = parseInt(match[2] || match[3] || match[4] || match[5], 10)
    const pattern = match[6].trim()
    const body = match[7]

    if (!id || !pattern || id < 1 || id > 200) continue

    // For ## N. format (group 3), category headers like "文語的接続・複合助詞"
    // are interleaved with grammar points in Batch 1. Grammar points always
    // start with ～. Category headers don't.
    const isDecimalFormat = !!match[3] // matched ## N. format
    if (isDecimalFormat && !pattern.includes('～') && !pattern.includes('〜')) continue

    // Skip any other obvious non-grammar headers
    if (/^(文法|N1|批次|Batch|範囲|深度)/.test(pattern)) continue

    const point = {
      id,
      pattern: cleanPattern(pattern),
      englishConcept: extractEnglishConcept(body),
      coreDefinitionZh: extractCoreDefinition(body),
      vibe: extractVibe(body),
      rawContent: body.trim(),
    }

    out.push(point)
  }
}

function cleanPattern(s) {
  return s
    .replace(/^[🔴🟢🟣🔵⚪️\s]+/, '')
    .replace(/（[^）]{0,20}）$/, '')
    .replace(/\([^)]{0,20}\)$/, '')
    .trim()
}

function extractEnglishConcept(body) {
  // Captures everything after "English Concept" label to end of that line
  const re = /\*\*English Concept[：:]?\*\*[：:]?\s*(.+)/
  const m = body.match(re)
  if (!m) return ''
  // Strip surrounding markdown: *"text"* → text
  return m[1]
    .replace(/ \/ .+$/, '')             // take first variant only
    .replace(/\*/g, '')                 // strip all asterisks
    .replace(/[「」"]/g, '')            // strip all quote chars
    .replace(/\s+/g, ' ')
    .trim()
}

function extractCoreDefinition(body) {
  // Bold format: **教科書定義：** ...
  const re = /\*\*教科書定義[：:]\*\*\s*(.+?)(?=\n\n|\n\*\*|\n-\s*\*\*)/s
  const m = body.match(re)
  if (m) return m[1].replace(/\n/g, ' ').trim()
  // Bullet format: - **教科書定義**：...
  const re2 = /[-*]\s+\*\*教科書定義\*\*[：:]\s*(.+?)(?=\n[-*]\s+\*\*|\n\n)/s
  const m2 = body.match(re2)
  if (m2) return m2[1].replace(/\n/g, ' ').trim()
  return ''
}

function extractVibe(body) {
  const re = /\*\*母語者語感[^*]*\*\*[：:]\s*([\s\S]+?)(?=\n\n\*\*|\n\n你可以|\n\n#### |\n\n### |\n\*\*English)/
  const m = body.match(re)
  if (m) return m[1].replace(/\n/g, ' ').trim()
  const re2 = /[-*]\s+\*\*母語者語感[^*]*\*\*[：:]\s*([\s\S]+?)(?=\n\n|\n[-*]\s+\*\*|\n\n  你)/
  const m2 = body.match(re2)
  if (m2) return m2[1].replace(/\n/g, ' ').trim()
  return ''
}
