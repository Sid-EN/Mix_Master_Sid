/**
 * 學習進度測試
 *
 * 經驗值與等級是使用者長期累積的成果，重複計算或遺失都會破壞信任。
 */
import { act, render, screen, waitFor } from '@testing-library/react'
import { ProgressProvider, useProgress } from '@/components/ProgressContext'

const KEY = 'mixmaster-progress'

function Probe() {
  const {
    addRecipeView, markRecipeTried, addAcademySection, addQuizComplete,
    totalXP, level, recipesViewedCount, recipesTriedCount,
  } = useProgress()
  return (
    <div>
      <span data-testid="xp">{totalXP}</span>
      <span data-testid="level">{level}</span>
      <span data-testid="viewed">{recipesViewedCount}</span>
      <span data-testid="tried">{recipesTriedCount}</span>
      <button onClick={() => addRecipeView('negroni')}>view</button>
      <button onClick={() => addRecipeView('daiquiri')}>view2</button>
      <button onClick={() => markRecipeTried('negroni')}>tried</button>
      <button onClick={() => addAcademySection('ice')}>section</button>
      <button onClick={addQuizComplete}>quiz</button>
    </div>
  )
}

const renderProbe = () => render(<ProgressProvider><Probe /></ProgressProvider>)
const click = (label: string) => act(() => { screen.getByText(label).click() })

beforeEach(() => localStorage.clear())

describe('初始狀態', () => {
  it('從零開始', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    expect(screen.getByTestId('level')).toHaveTextContent('1')
  })
})

describe('累積經驗值', () => {
  it('瀏覽配方會增加經驗值', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    click('view')
    expect(Number(screen.getByTestId('xp').textContent)).toBeGreaterThan(0)
  })

  it('重複瀏覽同一配方不重複計分', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    click('view')
    const first = Number(screen.getByTestId('xp').textContent)
    click('view')
    expect(Number(screen.getByTestId('xp').textContent)).toBe(first)
    expect(screen.getByTestId('viewed')).toHaveTextContent('1')
  })

  it('瀏覽不同配方各自計分', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    click('view')
    click('view2')
    expect(screen.getByTestId('viewed')).toHaveTextContent('2')
  })

  it('標記已嘗試會計入', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    click('tried')
    expect(screen.getByTestId('tried')).toHaveTextContent('1')
  })

  it('完成測驗會增加經驗值', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    click('quiz')
    expect(Number(screen.getByTestId('xp').textContent)).toBeGreaterThan(0)
  })

  it('累積足夠經驗值後升級', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    for (let i = 0; i < 30; i++) click('quiz')
    expect(Number(screen.getByTestId('level').textContent)).toBeGreaterThan(1)
  })
})

describe('持久化', () => {
  it('寫入本機', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    click('view')
    expect(localStorage.getItem(KEY)).toBeTruthy()
  })

  it('重新掛載後保留進度', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
    click('view')
    const xp = screen.getByTestId('xp').textContent
    screen.getByTestId('xp').remove()

    renderProbe()
    await waitFor(() => {
      const els = screen.getAllByTestId('xp')
      expect(els[els.length - 1]).toHaveTextContent(xp!)
    })
  })

  it('儲存內容毀損時從零開始而非當機', async () => {
    localStorage.setItem(KEY, '{ not json')
    expect(() => renderProbe()).not.toThrow()
    await waitFor(() => expect(screen.getByTestId('xp')).toHaveTextContent('0'))
  })
})
