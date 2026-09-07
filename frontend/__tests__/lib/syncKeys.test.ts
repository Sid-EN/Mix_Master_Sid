/**
 * 同步鍵與 localStorage 鍵必須一致
 *
 * 兩者各自宣告：sync.ts 決定同步哪些鍵，各模組決定自己存在哪個鍵。
 * 若對不上，資料會照常存進 localStorage 卻永遠不會同步，
 * 而且完全沒有錯誤訊息——換一台裝置才會發現東西不見了。
 */
import { SYNCABLE_KEYS, storageKey } from '@/lib/sync'
import { INVENTORY_KEY } from '@/lib/inventory'
import { SHOPPING_LIST_KEY } from '@/lib/shoppingList'

describe('同步鍵', () => {
  it('購物清單的儲存鍵在同步白名單內', () => {
    expect(storageKey('shopping-list')).toBe(SHOPPING_LIST_KEY)
  })

  it('庫存的儲存鍵在同步白名單內', () => {
    expect(storageKey('inventory')).toBe(INVENTORY_KEY)
  })

  it('白名單涵蓋新增的兩項', () => {
    expect(SYNCABLE_KEYS).toContain('shopping-list')
    expect(SYNCABLE_KEYS).toContain('inventory')
  })

  it('所有鍵都以 mixmaster- 為前綴', () => {
    for (const key of SYNCABLE_KEYS) {
      expect(storageKey(key)).toMatch(/^mixmaster-/)
    }
  })
})
