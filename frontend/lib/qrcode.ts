/**
 * QR Code 產生器（Model 2，位元組模式）
 *
 * 分享連結若只能複製貼上，把手機拿給對面的人看時就沒有辦法——
 * 掃碼是這個情境下唯一順手的方式。
 *
 * 自行實作而非引入套件：功能上只需要「把一段網址畫成方塊」，
 * 為此多一個相依套件與其供應鏈風險並不划算。
 * 僅支援位元組模式與錯誤更正等級 M，足以涵蓋分享網址的長度。
 *
 * 參考 ISO/IEC 18004。
 */

/* ── Galois field GF(256)，生成多項式 0x11D ─────────────── */
const EXP = new Uint8Array(512)
const LOG = new Uint8Array(256)
{
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP[i] = x
    LOG[x] = i
    x <<= 1
    if (x & 0x100) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]
}

const mul = (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]])

/**
 * Reed–Solomon 生成多項式 ∏(x − α^i)。
 *
 * 係數由高次排到低次，因此「乘以 x」是往索引小的方向移，
 * 「乘以 α^i」才留在原位往下加。這兩步一旦寫反，
 * 產生的碼看起來完全正常，卻沒有任何解碼器讀得出來。
 */
function rsGenerator(degree: number): number[] {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j]                      // × x
      next[j + 1] ^= mul(poly[j], EXP[i])     // × α^i
    }
    poly = next
  }
  return poly
}

function rsEncode(data: number[], ecLength: number): number[] {
  const gen = rsGenerator(ecLength)
  const res = new Array(ecLength).fill(0)
  for (const byte of data) {
    const factor = byte ^ res[0]
    res.shift()
    res.push(0)
    for (let i = 0; i < ecLength; i++) res[i] ^= mul(gen[i + 1], factor)
  }
  return res
}

/* ── 版本參數（錯誤更正等級 M）───────────────────────────
   [版本, 資料位元組數, 每區塊 EC 位元組數, 群組1區塊數, 群組1資料位元組, 群組2區塊數, 群組2資料位元組] */
const VERSIONS: [number, number, number, number, number, number, number][] = [
  [1, 16, 10, 1, 16, 0, 0],
  [2, 28, 16, 1, 28, 0, 0],
  [3, 44, 26, 1, 44, 0, 0],
  [4, 64, 18, 2, 32, 0, 0],
  [5, 86, 24, 2, 43, 0, 0],
  [6, 108, 16, 4, 27, 0, 0],
  [7, 124, 18, 4, 31, 0, 0],
  [8, 154, 22, 2, 38, 2, 39],
  [9, 182, 22, 3, 36, 2, 37],
]

const ALIGNMENT: Record<number, number[]> = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46],
}

/** 版本 7 以上需要版本資訊區塊 */
const VERSION_INFO: Record<number, number> = {
  7: 0x07c94, 8: 0x085bc, 9: 0x09a99,
}

const FORMAT_INFO_M = [
  0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
]

/** 把字串以 UTF-8 編碼成位元組 */
function utf8Bytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text))
}

export class QrError extends Error {}

/**
 * 產生 QR Code 的黑白矩陣。
 *
 * @returns 二維陣列，true 代表黑點
 */
export interface Codewords {
  version: number
  size: number
  ecPerBlock: number
  /** 交錯排列後的資料與錯誤更正碼 */
  bytes: number[]
}

/**
 * 產生交錯排列後的碼字。
 *
 * 與佈點分開，是因為兩者的錯誤型態完全不同：碼字錯了整段內容都解不出來，
 * 佈點錯了則是圖形結構壞掉。分開後可以各自比對，出問題時才查得出是哪一半。
 */
export function buildCodewords(text: string): Codewords {
  const bytes = utf8Bytes(text)

  const spec = VERSIONS.find(v => bytes.length + 2 <= v[1])
  if (!spec) {
    // 分享網址遠短於此；超過表示呼叫端傳了非預期的內容
    throw new QrError('內容過長，超出支援的 QR Code 版本')
  }
  const [version, capacity, ecPerBlock, g1Blocks, g1Size, g2Blocks, g2Size] = spec

  /* ── 位元流：模式指示碼(4) + 長度(8) + 資料 + 終止符 ── */
  const bits: number[] = []
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1)
  }
  push(0b0100, 4)                 // 位元組模式
  push(bytes.length, 8)           // 版本 1–9 的長度指示碼為 8 位元
  for (const b of bytes) push(b, 8)
  for (let i = 0; i < 4 && bits.length < capacity * 8; i++) bits.push(0)
  while (bits.length % 8 !== 0) bits.push(0)

  const dataBytes: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    dataBytes.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0))
  }
  // 填充位元組交替使用，為規格所定義
  const PAD = [0xec, 0x11]
  for (let i = 0; dataBytes.length < capacity; i++) dataBytes.push(PAD[i % 2])

  /* ── 分區塊並計算錯誤更正碼 ── */
  const blocks: number[][] = []
  const ecBlocks: number[][] = []
  let offset = 0
  for (let i = 0; i < g1Blocks; i++) {
    const block = dataBytes.slice(offset, offset + g1Size)
    offset += g1Size
    blocks.push(block)
    ecBlocks.push(rsEncode(block, ecPerBlock))
  }
  for (let i = 0; i < g2Blocks; i++) {
    const block = dataBytes.slice(offset, offset + g2Size)
    offset += g2Size
    blocks.push(block)
    ecBlocks.push(rsEncode(block, ecPerBlock))
  }

  // 交錯排列
  const interleaved: number[] = []
  const maxData = Math.max(...blocks.map(b => b.length))
  for (let i = 0; i < maxData; i++) {
    for (const block of blocks) if (i < block.length) interleaved.push(block[i])
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) interleaved.push(block[i])
  }

  return { version, size: version * 4 + 17, ecPerBlock, bytes: interleaved }
}

/**
 * 產生 QR Code 的黑白矩陣。
 *
 * @returns 二維陣列，true 代表黑點
 */
export function encodeQr(text: string): boolean[][] {
  const { version, size, bytes: interleaved } = buildCodewords(text)

  /* ── 佈點 ── */
  const modules: (boolean | null)[][] = Array.from({ length: size }, () =>
    new Array(size).fill(null))

  const setFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r
        const cc = col + c
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue
        const onBorder = r === 0 || r === 6 || c === 0 || c === 6
        const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4
        modules[rr][cc] = (r >= 0 && r <= 6 && c >= 0 && c <= 6) && (onBorder || inCore)
      }
    }
  }
  setFinder(0, 0)
  setFinder(0, size - 7)
  setFinder(size - 7, 0)

  // 時序圖案
  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0
    modules[i][6] = i % 2 === 0
  }

  // 校正圖案。只略過與三個定位圖案重疊的角落；
  // 與時序列重疊的 (6, x) 依規格仍須畫出。
  const centres = ALIGNMENT[version]
  const last = centres[centres.length - 1]
  for (const r of centres) {
    for (const c of centres) {
      const overlapsFinder =
        (r === 6 && c === 6) || (r === 6 && c === last) || (r === last && c === 6)
      if (overlapsFinder) continue
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          modules[r + dr][c + dc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1
        }
      }
    }
  }

  modules[size - 8][8] = true            // 固定為黑的模組

  // 保留格式與版本資訊區
  const reserve = (r: number, c: number) => { if (modules[r][c] === null) modules[r][c] = false }
  for (let i = 0; i < 9; i++) { reserve(8, i); reserve(i, 8) }
  for (let i = 0; i < 8; i++) { reserve(8, size - 1 - i); reserve(size - 1 - i, 8) }
  if (version >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        reserve(i, size - 11 + j)
        reserve(size - 11 + j, i)
      }
    }
  }

  /* ── 資料填入（由右下角起的鋸齒路徑）── */
  const dataBits: number[] = []
  for (const byte of interleaved) for (let i = 7; i >= 0; i--) dataBits.push((byte >> i) & 1)

  const MASK = 0                        // 遮罩 0：(row + col) % 2 === 0
  let bitIndex = 0
  let upward = true
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--                // 跳過時序欄
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i
      for (let c = 0; c < 2; c++) {
        const cc = col - c
        if (modules[row][cc] !== null) continue
        const bit = bitIndex < dataBits.length ? dataBits[bitIndex++] : 0
        const masked = (row + cc) % 2 === 0 ? bit ^ 1 : bit
        modules[row][cc] = masked === 1
      }
    }
    upward = !upward
  }

  /* ── 格式資訊（等級 M + 遮罩 0）── */
  const format = FORMAT_INFO_M[MASK]
  for (let i = 0; i < 15; i++) {
    const bit = ((format >> i) & 1) === 1

    // 第一份沿左上角的第 8 欄由上往下（低位在上）
    if (i < 6) modules[i][8] = bit
    else if (i < 8) modules[i + 1][8] = bit
    else modules[size - 15 + i][8] = bit

    // 第二份沿第 8 列由右往左
    if (i < 8) modules[8][size - 1 - i] = bit
    else if (i === 8) modules[8][15 - i] = bit
    else modules[8][14 - i] = bit
  }

  if (version >= 7) {
    const info = VERSION_INFO[version]
    for (let i = 0; i < 18; i++) {
      const bit = ((info >> i) & 1) === 1
      modules[Math.floor(i / 3)][size - 11 + (i % 3)] = bit
      modules[size - 11 + (i % 3)][Math.floor(i / 3)] = bit
    }
  }

  return modules.map(row => row.map(cell => cell === true))
}

/**
 * 產生 SVG 字串。
 *
 * 用 SVG 而非 canvas：可直接縮放不失真，也方便嵌進頁面與列印。
 */
export function qrSvg(text: string, options: { size?: number; margin?: number } = {}): string {
  const { size: px = 240, margin = 4 } = options
  const matrix = encodeQr(text)
  const n = matrix.length
  const total = n + margin * 2

  const paths: string[] = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (matrix[r][c]) paths.push(`M${c + margin} ${r + margin}h1v1h-1z`)
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}"`,
    ` viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">`,
    `<rect width="${total}" height="${total}" fill="#ffffff"/>`,
    `<path d="${paths.join('')}" fill="#000000"/>`,
    '</svg>',
  ].join('')
}
