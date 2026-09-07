/**
 * 配方頁的成本與採購區塊
 *
 * 重點：庫存資料不足時不要湊出一個看起來很便宜的假成本，
 * 以及「缺的材料」要真的只算使用者沒有的那些。
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RecipeCostBar from '@/components/RecipeCostBar'
import { INVENTORY_KEY } from '@/lib/inventory'
import { SHOPPING_LIST_KEY, loadList } from '@/lib/shoppingList'

const INGREDIENTS = [
  { slug: 'bacardi-rum', name: '白蘭姆酒', amount: 2, unit: 'oz' },
  { slug: 'fresh-lime-juice', name: '新鮮萊姆汁', amount: 0.75, unit: 'oz' },
  { slug: 'simple-syrup', name: '簡易糖漿', amount: 0.75, unit: 'oz' },
]

function setup(inventory = {}, owned: string[] = []) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
  localStorage.setItem('mixmaster-my-bar', JSON.stringify(owned))
  return render(<RecipeCostBar recipeName="經典黛綺麗" ingredients={INGREDIENTS} />)
}

beforeEach(() => localStorage.clear())

describe('RecipeCostBar', () => {
  it('沒有庫存資料時成本顯示為未知', async () => {
    setup()
    await waitFor(() => expect(screen.getByText('單杯成本')).toBeInTheDocument())
    // 顯示 $0 會讓人以為這杯不用錢
    expect(screen.queryByText(/\$0/)).not.toBeInTheDocument()
  })

  it('資料齊全時算出單杯成本', async () => {
    setup({
      'bacardi-rum': { bottleMl: 700, price: 700 },
      'fresh-lime-juice': { bottleMl: 1000, price: 200 },
      'simple-syrup': { bottleMl: 500, price: 50 },
    })
    await waitFor(() => expect(screen.getByText(/\$65\./)).toBeInTheDocument())
  })

  it('部分材料缺價格時說明未計入', async () => {
    setup({ 'bacardi-rum': { bottleMl: 700, price: 700 } })
    await waitFor(() =>
      expect(screen.getByText(/有 2 項材料尚未填寫容量與售價/)).toBeInTheDocument())
  })

  it('顯示以現有庫存還能調幾杯', async () => {
    setup({
      'bacardi-rum': { bottleMl: 700, price: 700 },
      'fresh-lime-juice': { bottleMl: 1000, price: 200 },
      'simple-syrup': { bottleMl: 500, price: 50 },
    })
    await waitFor(() => expect(screen.getByText('11 杯')).toBeInTheDocument())
  })

  it('只把使用者沒有的材料算作缺少', async () => {
    setup({}, ['bacardi-rum'])
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /把缺的 2 項加入購物清單/ })).toBeInTheDocument())
  })

  it('全部都有時提供整份加入', async () => {
    setup({}, INGREDIENTS.map(i => i.slug))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '全部加入購物清單' })).toBeInTheDocument())
  })

  it('加入購物清單時帶上需求量與來源', async () => {
    setup({}, ['bacardi-rum'])
    const btn = await screen.findByRole('button', { name: /把缺的 2 項加入購物清單/ })
    fireEvent.click(btn)

    const list = loadList()
    expect(list.map(i => i.id)).toEqual(['fresh-lime-juice', 'simple-syrup'])
    expect(list[0].neededMl).toBeCloseTo(0.75 * 29.5735, 3)
    expect(list[0].sources).toEqual(['經典黛綺麗'])
  })

  it('加入後給出回饋', async () => {
    setup({}, ['bacardi-rum'])
    fireEvent.click(await screen.findByRole('button', { name: /把缺的/ }))
    expect(screen.getByRole('button', { name: '已加入清單' })).toBeInTheDocument()
  })

  it('沿用既有清單而非覆蓋', async () => {
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify([
      { id: 'campari', name: '金巴利', neededMl: 30, sources: [], done: false, addedAt: '' },
    ]))
    setup({}, ['bacardi-rum'])
    fireEvent.click(await screen.findByRole('button', { name: /把缺的/ }))
    expect(loadList().map(i => i.id)).toContain('campari')
  })
})
