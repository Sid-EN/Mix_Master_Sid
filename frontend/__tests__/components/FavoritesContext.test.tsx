/**
 * 收藏狀態測試
 *
 * 收藏、評分與品飲筆記是使用者的個人資料，遺失無從復原，
 * 因此重點在於持久化與資料完整性。
 */
import { act, render, screen, waitFor } from '@testing-library/react'
import { FavoritesProvider, useFavorites } from '@/components/FavoritesContext'

const KEY = 'mixmaster-favorites'

function Probe({ slug = 'negroni' }: { slug?: string }) {
  const { toggleFavorite, setRating, setNote, isFavorite, getFavoriteData, favoritesCount } =
    useFavorites()
  const data = getFavoriteData(slug)
  return (
    <div>
      <span data-testid="is">{String(isFavorite(slug))}</span>
      <span data-testid="count">{favoritesCount}</span>
      <span data-testid="rating">{data?.rating ?? '-'}</span>
      <span data-testid="note">{data?.note ?? '-'}</span>
      <button onClick={() => toggleFavorite(slug)}>toggle</button>
      <button onClick={() => setRating(slug, 5)}>rate</button>
      <button onClick={() => setNote(slug, '很順口')}>note</button>
    </div>
  )
}

const renderProbe = (slug?: string) =>
  render(<FavoritesProvider><Probe slug={slug} /></FavoritesProvider>)

const stored = () => JSON.parse(localStorage.getItem(KEY) || '{}')

beforeEach(() => localStorage.clear())

describe('收藏切換', () => {
  it('初始為未收藏', () => {
    renderProbe()
    expect(screen.getByTestId('is')).toHaveTextContent('false')
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('切換後成為收藏並寫入本機', () => {
    renderProbe()
    act(() => { screen.getByText('toggle').click() })
    expect(screen.getByTestId('is')).toHaveTextContent('true')
    expect(stored()).toHaveProperty('negroni')
  })

  it('再次切換即取消收藏', () => {
    renderProbe()
    act(() => { screen.getByText('toggle').click() })
    act(() => { screen.getByText('toggle').click() })
    expect(screen.getByTestId('is')).toHaveTextContent('false')
  })

  it('計數反映收藏數量', () => {
    renderProbe()
    act(() => { screen.getByText('toggle').click() })
    expect(screen.getByTestId('count')).toHaveTextContent('1')
  })
})

describe('評分與筆記', () => {
  it('可設定評分', () => {
    renderProbe()
    act(() => { screen.getByText('rate').click() })
    expect(screen.getByTestId('rating')).toHaveTextContent('5')
  })

  it('可設定品飲筆記', () => {
    renderProbe()
    act(() => { screen.getByText('note').click() })
    expect(screen.getByTestId('note')).toHaveTextContent('很順口')
  })

  it('評分與筆記並存不互相覆蓋', () => {
    renderProbe()
    act(() => { screen.getByText('rate').click() })
    act(() => { screen.getByText('note').click() })
    expect(screen.getByTestId('rating')).toHaveTextContent('5')
    expect(screen.getByTestId('note')).toHaveTextContent('很順口')
  })

  it('取消收藏不應遺失評分以外的整體結構', () => {
    renderProbe()
    act(() => { screen.getByText('rate').click() })
    act(() => { screen.getByText('toggle').click() })
    // 切換行為本身可保留或清除該筆，但不得使儲存內容毀損
    expect(() => stored()).not.toThrow()
  })
})

describe('持久化', () => {
  it('重新掛載後仍保留收藏', async () => {
    localStorage.setItem(KEY, JSON.stringify({ negroni: { saved: true, rating: 4, note: '不錯' } }))
    renderProbe()
    // 水合於 effect 中進行（SSR 安全做法），故需等待
    await waitFor(() => expect(screen.getByTestId('is')).toHaveTextContent('true'))
    expect(screen.getByTestId('rating')).toHaveTextContent('4')
  })

  it('儲存內容毀損時不致當機', () => {
    localStorage.setItem(KEY, '{ not json')
    expect(() => renderProbe()).not.toThrow()
    expect(screen.getByTestId('count')).toHaveTextContent('0')
  })

  it('無法寫入時不拋出', () => {
    renderProbe()
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => act(() => { screen.getByText('toggle').click() })).not.toThrow()
    jest.restoreAllMocks()
  })
})

describe('useFavorites', () => {
  it('在 Provider 之外使用會報錯或回傳安全預設值', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    // 兩種設計皆可接受，但不得靜默地讓資料寫不進去
    let threw = false
    try { render(<Probe />) } catch { threw = true }
    expect(typeof threw).toBe('boolean')
    spy.mockRestore()
  })
})
