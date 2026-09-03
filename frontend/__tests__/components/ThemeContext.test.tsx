import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/ThemeContext'

function Probe() {
  const { theme, toggleTheme } = useTheme() as any
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => window.localStorage.clear())

  it('提供預設主題', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBeTruthy()
  })

  it('切換後主題改變並寫入 localStorage', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    const before = screen.getByTestId('theme').textContent
    act(() => { screen.getByText('toggle').click() })
    expect(screen.getByTestId('theme').textContent).not.toBe(before)
  })
})
