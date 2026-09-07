/**
 * QR Code 編碼器
 *
 * 這類程式最危險的失敗方式是「看起來完全正常但掃不出來」：
 * 圖形結構對、黑白分佈也像模像樣，只有解碼器知道它是壞的。
 * 開發過程中 Reed-Solomon 生成多項式的兩步寫反，就正是這種情況。
 *
 * 因此對照的基準來自另一個獨立實作（Python qrcode 套件），
 * 且每筆基準都先以 OpenCV 的解碼器實際掃描確認過，
 * 見 scripts/gen_qr_reference.py 與 tests/fixtures/qr_reference.json。
 */
import reference from '../../../tests/fixtures/qr_reference.json'
import { QrError, buildCodewords, encodeQr, qrSvg } from '@/lib/qrcode'

const asRows = (m: boolean[][]) => m.map(r => r.map(c => (c ? '1' : '0')).join(''))

describe('與參考實作的一致性', () => {
  for (const c of reference.cases) {
    it(`${JSON.stringify(c.text.slice(0, 40))} 產生相同的矩陣`, () => {
      const matrix = encodeQr(c.text)
      expect(matrix).toHaveLength(c.size)
      expect(asRows(matrix)).toEqual(c.rows)
    })
  }

  it('中文以 UTF-8 編碼', () => {
    const cjk = reference.cases.find(c => /[一-鿿]/.test(c.text))!
    expect(asRows(encodeQr(cjk.text))).toEqual(cjk.rows)
  })
})

describe('結構', () => {
  const matrix = encodeQr('https://example.com/share/abc')
  const size = matrix.length

  it('尺寸符合版本公式 4v+17', () => {
    expect((size - 17) % 4).toBe(0)
  })

  it('三個角落有定位圖案', () => {
    for (const [r0, c0] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
      expect(matrix[r0][c0]).toBe(true)             // 外框左上
      expect(matrix[r0 + 1][c0 + 1]).toBe(false)    // 白邊
      expect(matrix[r0 + 3][c0 + 3]).toBe(true)     // 中心
    }
  })

  it('時序圖案黑白相間', () => {
    for (let i = 8; i < size - 8; i++) {
      expect(matrix[6][i]).toBe(i % 2 === 0)
      expect(matrix[i][6]).toBe(i % 2 === 0)
    }
  })

  it('固定黑點存在', () => {
    expect(matrix[size - 8][8]).toBe(true)
  })
})

describe('buildCodewords', () => {
  it('依內容長度選擇最小的版本', () => {
    expect(buildCodewords('hi').version).toBe(1)
    expect(buildCodewords('x'.repeat(100)).version).toBeGreaterThan(3)
  })

  it('碼字總數符合該版本的容量', () => {
    const cw = buildCodewords('MixMaster')
    expect(cw.bytes).toHaveLength(26)              // 版本 1：16 資料 + 10 EC
  })

  it('內容過長時明確拒絕，而非產生壞掉的碼', () => {
    expect(() => buildCodewords('x'.repeat(500))).toThrow(QrError)
  })
})

describe('qrSvg', () => {
  const svg = qrSvg('https://example.com', { size: 200 })

  it('產生可直接嵌入的 SVG', () => {
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg.endsWith('</svg>')).toBe(true)
    expect(svg).toContain('width="200"')
  })

  it('留有靜區，否則掃描器抓不到邊界', () => {
    const viewBox = /viewBox="0 0 (\d+) \1"/.exec(svg)!
    const total = Number(viewBox[1])
    expect(total).toBe(encodeQr('https://example.com').length + 8)
  })

  it('底色為白，避免深色主題下對比反轉', () => {
    expect(svg).toContain('fill="#ffffff"')
  })
})
