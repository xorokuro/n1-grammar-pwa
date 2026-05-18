import { createDeflate } from 'zlib'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

function crc32(buf) {
  let crc = 0xffffffff
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcData = Buffer.concat([typeBytes, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData))
  return Buffer.concat([len, typeBytes, data, crc])
}

async function makePng(size, drawFn) {
  const pixels = new Uint8Array(size * size * 4)

  // Draw background: deep slate #0f172a
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      pixels[i] = 15; pixels[i+1] = 23; pixels[i+2] = 42; pixels[i+3] = 255
    }
  }

  drawFn(pixels, size)

  // Build raw image data (filter byte 0 per scanline)
  const rawRows = []
  for (let y = 0; y < size; y++) {
    rawRows.push(0) // filter type None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      rawRows.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3])
    }
  }
  const rawBuf = Buffer.from(rawRows)

  const compressed = await new Promise((resolve, reject) => {
    const chunks = []
    const d = createDeflate({ level: 6 })
    d.on('data', c => chunks.push(c))
    d.on('end', () => resolve(Buffer.concat(chunks)))
    d.on('error', reject)
    d.end(rawBuf)
  })

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function setPixel(pixels, size, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const i = (y * size + x) * 4
  pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a
}

function fillCircle(pixels, size, cx, cy, radius, r, g, b) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      if (dist <= radius) setPixel(pixels, size, x, y, r, g, b)
    }
  }
}

function fillRect(pixels, size, x1, y1, x2, y2, r, g, b) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++)
      setPixel(pixels, size, x, y, r, g, b)
}

// Draw "N1" text-ish icon using pixel art
function drawIcon(pixels, size) {
  const s = size / 192  // scale factor
  const pad = Math.round(24 * s)

  // Rounded rect background — violet #7c3aed
  const r = Math.round(32 * s)
  const w = size, h = size
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const inCornerTL = x < r && y < r && Math.sqrt((x-r)**2+(y-r)**2) > r
      const inCornerTR = x > w-r && y < r && Math.sqrt((x-(w-r))**2+(y-r)**2) > r
      const inCornerBL = x < r && y > h-r && Math.sqrt((x-r)**2+(y-(h-r))**2) > r
      const inCornerBR = x > w-r && y > h-r && Math.sqrt((x-(w-r))**2+(y-(h-r))**2) > r
      if (!inCornerTL && !inCornerTR && !inCornerBL && !inCornerBR) {
        setPixel(pixels, size, x, y, 124, 58, 237)
      }
    }
  }

  // Draw "N1" as thick pixel bars — white
  const th = Math.max(2, Math.round(16 * s))  // thickness
  const bh = Math.round(80 * s)   // bar height
  const bw = Math.round(20 * s)   // bar width
  const top = Math.round(56 * s)
  const left1 = Math.round(28 * s)
  const left2 = Math.round(72 * s)
  const left3 = Math.round(110 * s)

  // N - left vertical
  fillRect(pixels, size, left1, top, left1+th, top+bh, 255, 255, 255)
  // N - diagonal
  for (let i = 0; i <= bh; i++) {
    const x = Math.round(left1 + th + (bw - th) * i / bh)
    fillRect(pixels, size, x, top+i, x+th, top+i+th, 255, 255, 255)
  }
  // N - right vertical
  fillRect(pixels, size, left1+bw, top, left1+bw+th, top+bh, 255, 255, 255)

  // 1 - vertical bar
  fillRect(pixels, size, left3+Math.round(8*s), top, left3+Math.round(8*s)+th, top+bh, 255, 255, 255)
  // 1 - little top-left serif
  fillRect(pixels, size, left3, top, left3+Math.round(8*s)+th, top+th, 255, 255, 255)
  // 1 - base
  fillRect(pixels, size, left3-Math.round(4*s), top+bh-th, left3+Math.round(22*s), top+bh, 255, 255, 255)
}

async function main() {
  for (const size of [192, 512]) {
    const png = await makePng(size, drawIcon)
    const out = join(__dir, `../public/icon-${size}.png`)
    writeFileSync(out, png)
    console.log(`Generated icon-${size}.png`)
  }
}

main().catch(console.error)
