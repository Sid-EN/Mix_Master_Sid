/**
 * 購物清單
 *
 * 在店裡對著清單採購時，同一瓶東西出現兩次、或已買到的項目
 * 又缺貨卻仍是劃掉狀態，都會直接造成買錯。這些是重點。
 */
import {
  SHOPPING_LIST_KEY,
  addItems,
  clearDone,
  loadList,
  removeItem,
  saveList,
  toPlainText,
  toggleItem,
  type ShoppingItem,
} from '@/lib/shoppingList'

const gin = { id: 'tanqueray-gin', name: '添加利琴酒', neededMl: 60, source: 'Negroni' }
const campari = { id: 'campari', name: '金巴利', neededMl: 30, source: 'Negroni' }

beforeEach(() => localStorage.clear())

describe('儲存', () => {
  it('存取後內容相同', () => {
    const list = addItems([], [gin])
    saveList(list)
    expect(loadList()).toEqual(list)
  })

  it('沒有資料時回傳空陣列', () => {
    expect(loadList()).toEqual([])
  })

  it('內容損毀時回傳空陣列而非拋錯', () => {
    localStorage.setItem(SHOPPING_LIST_KEY, 'not json')
    expect(loadList()).toEqual([])
  })

  it('過濾掉形狀不符的項目', () => {
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify([{ id: 'ok' }, 42, null]))
    expect(loadList()).toHaveLength(1)
  })
})

describe('addItems', () => {
  it('加入新項目', () => {
    const list = addItems([], [gin, campari])
    expect(list.map(i => i.id)).toEqual(['tanqueray-gin', 'campari'])
    expect(list[0].sources).toEqual(['Negroni'])
  })

  it('同一材料合併為一筆並累加需求量', () => {
    // 出現兩次只會造成困惑
    const list = addItems(addItems([], [gin]), [{ ...gin, neededMl: 30, source: 'Martini' }])
    expect(list).toHaveLength(1)
    expect(list[0].neededMl).toBe(90)
    expect(list[0].sources).toEqual(['Negroni', 'Martini'])
  })

  it('相同來源不重複記錄', () => {
    const list = addItems(addItems([], [gin]), [gin])
    expect(list[0].sources).toEqual(['Negroni'])
  })

  it('再次加入時取消已勾選狀態', () => {
    // 又有新需求，卻仍顯示劃掉會讓人以為已經買了
    const done = toggleItem(addItems([], [gin]), 'tanqueray-gin')
    expect(done[0].done).toBe(true)
    expect(addItems(done, [gin])[0].done).toBe(false)
  })

  it('需求量未知時不會污染已知的數字', () => {
    const list = addItems(addItems([], [gin]), [{ ...gin, neededMl: null }])
    expect(list[0].neededMl).toBe(60)
  })

  it('先未知後已知時採用已知值', () => {
    const list = addItems(addItems([], [{ ...gin, neededMl: null }]), [gin])
    expect(list[0].neededMl).toBe(60)
  })

  it('不修改傳入的清單', () => {
    const original = addItems([], [gin])
    const before = JSON.stringify(original)
    addItems(original, [campari])
    expect(JSON.stringify(original)).toBe(before)
  })
})

describe('操作', () => {
  const base = addItems([], [gin, campari])

  it('toggleItem 切換勾選', () => {
    expect(toggleItem(base, 'campari')[1].done).toBe(true)
  })

  it('removeItem 移除指定項目', () => {
    expect(removeItem(base, 'campari').map(i => i.id)).toEqual(['tanqueray-gin'])
  })

  it('clearDone 只清除已勾選的', () => {
    const list = toggleItem(base, 'campari')
    expect(clearDone(list).map(i => i.id)).toEqual(['tanqueray-gin'])
  })
})

describe('toPlainText', () => {
  it('可貼到訊息帶去店裡', () => {
    const text = toPlainText(toggleItem(addItems([], [gin, campari]), 'campari'))
    expect(text).toContain('[ ] 添加利琴酒（約 60 ml）')
    expect(text).toContain('[x] 金巴利（約 30 ml）')
  })

  it('需求量未知時不顯示括號', () => {
    const text = toPlainText(addItems([], [{ id: 'x', name: '薄荷', neededMl: null }]))
    expect(text).toContain('[ ] 薄荷')
    expect(text).not.toContain('（約')
  })

  it('空清單回傳空字串', () => {
    expect(toPlainText([] as ShoppingItem[])).toBe('')
  })
})
