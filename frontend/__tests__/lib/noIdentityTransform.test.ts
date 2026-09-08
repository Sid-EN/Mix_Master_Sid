/**
 * 禁止恆等 transform。
 *
 * transform: translateY(0) / scale(1) 這類宣告視覺上完全等於沒寫，
 * 卻會讓該元素永久成為所有 position: fixed 後代的包含區塊：
 * 覆蓋層不再以視窗定位，而是被縮進這個元素的框裡，
 * 溢出視窗的部分使用者完全點不到。
 *
 * 實際發生過：.page-enter-active（包住每一頁）與 .scroll-revealed（首頁區塊）
 * 都寫了 translateY(0)，導致「風味偏好設定」從首頁開啟時，
 * 頁尾的重置／取消／儲存偏好整排落在視窗外，怎麼點都沒反應。
 *
 * 動畫過程中的 transform 沒問題（本來就需要），這裡只擋「靜止狀態」的恆等值。
 */
import { readFileSync } from 'fs'
import { join } from 'path'

/* 註解裡會提到 translateY(0)（例如說明為什麼不能寫），不該被當成違規 */
const css = readFileSync(join(__dirname, '../../styles/globals.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')

/** 去掉 @keyframes 區塊——動畫的中間影格本來就會有 transform */
function withoutKeyframes(source: string): string {
  let out = ''
  let i = 0
  while (i < source.length) {
    const at = source.indexOf('@keyframes', i)
    if (at === -1) { out += source.slice(i); break }
    out += source.slice(i, at)
    // 跳到這個 @keyframes 的結尾（配對大括號）
    let depth = 0, j = source.indexOf('{', at)
    for (; j < source.length; j++) {
      if (source[j] === '{') depth++
      else if (source[j] === '}' && --depth === 0) break
    }
    i = j + 1
  }
  return out
}

const IDENTITY = /transform\s*:\s*(translateY?\(\s*0(px|%)?\s*\)|translate\(\s*0(px|%)?\s*,\s*0(px|%)?\s*\)|scale\(\s*1\s*\)|none\s+\w)/gi

describe('globals.css', () => {
  it('靜止狀態不使用恆等 transform', () => {
    const offenders = withoutKeyframes(css).match(IDENTITY) ?? []
    expect(offenders).toEqual([])
  })

  it('守門測試本身有效（會抓到 translateY(0)）', () => {
    // 若 IDENTITY 寫壞了，上一項會永遠通過卻什麼都沒檢查
    expect('.x { transform: translateY(0); }'.match(IDENTITY)).not.toBeNull()
    expect('.x { transform: scale(1); }'.match(IDENTITY)).not.toBeNull()
    expect('.x { transform: translateY(12px); }'.match(IDENTITY)).toBeNull()
    expect(css).not.toContain('/*')  // 註解確實已剝除
  })
})
