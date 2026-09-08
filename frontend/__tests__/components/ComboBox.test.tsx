/**
 * 可用鍵盤操作的搜尋下拉
 *
 * 「配方比較」與「批次換算」原本各自把選項寫成 <li onClick>：
 * <li> 不可聚焦、沒有鍵盤處理器，輸入框也不處理方向鍵，
 * 因此只靠鍵盤或讀屏軟體的人在這兩頁完全無法選擇配方。
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import ComboBox from '@/components/ComboBox'

const OPTIONS = [
  { id: 'a', label: '尼格羅尼' },
  { id: 'b', label: '瑪格麗特' },
  { id: 'c', label: '古典雞尾酒' },
]

function Harness({ onChange = jest.fn() }: { onChange?: (id: string) => void }) {
  const [search, setSearch] = useState('')
  const [value, setValue] = useState<string | null>(null)
  const visible = OPTIONS.filter(o => o.label.includes(search))
  return (
    <ComboBox
      options={visible}
      value={value}
      onChange={id => { setValue(id); onChange(id) }}
      search={search}
      onSearchChange={setSearch}
      label="搜尋配方"
      renderOption={o => <span>{o.label}</span>}
    />
  )
}

const input = () => screen.getByRole('combobox')
const open = () => fireEvent.focus(input())

describe('ComboBox', () => {
  it('是有名稱的 combobox，並宣告展開狀態', () => {
    render(<Harness />)
    expect(input()).toHaveAccessibleName('搜尋配方')
    expect(input()).toHaveAttribute('aria-expanded', 'false')
    open()
    expect(input()).toHaveAttribute('aria-expanded', 'true')
  })

  it('選項是 listbox 裡的 option', () => {
    render(<Harness />)
    open()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('方向鍵移動時 aria-activedescendant 跟著走', () => {
    render(<Harness />)
    open()
    const first = input().getAttribute('aria-activedescendant')
    fireEvent.keyDown(input(), { key: 'ArrowDown' })
    expect(input().getAttribute('aria-activedescendant')).not.toBe(first)
    fireEvent.keyDown(input(), { key: 'ArrowUp' })
    expect(input().getAttribute('aria-activedescendant')).toBe(first)
  })

  it('只用鍵盤就能選取（先前完全做不到）', () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)
    open()
    fireEvent.keyDown(input(), { key: 'ArrowDown' })
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('方向鍵在頭尾之間循環', () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)
    open()
    fireEvent.keyDown(input(), { key: 'ArrowUp' })   // 0 → 最後一項
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('Home／End 直接跳到頭尾', () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)
    open()
    fireEvent.keyDown(input(), { key: 'End' })
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('c')
  })

  it('Escape 收起清單但不清掉輸入', () => {
    render(<Harness />)
    open()
    fireEvent.change(input(), { target: { value: '尼' } })
    fireEvent.keyDown(input(), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input()).toHaveValue('尼')
  })

  it('點選項也能選取，並清空搜尋字串', () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)
    open()
    fireEvent.change(input(), { target: { value: '瑪' } })
    fireEvent.click(screen.getByRole('option', { name: '瑪格麗特' }))
    expect(onChange).toHaveBeenCalledWith('b')
    expect(input()).toHaveValue('')
  })

  it('已選項目標記 aria-selected', () => {
    render(<Harness />)
    open()
    fireEvent.click(screen.getByRole('option', { name: '古典雞尾酒' }))
    open()
    expect(screen.getByRole('option', { name: '古典雞尾酒' }))
      .toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: '尼格羅尼' }))
      .toHaveAttribute('aria-selected', 'false')
  })

  it('沒有符合項目時顯示說明，Enter 不會選到東西', () => {
    const onChange = jest.fn()
    render(<Harness onChange={onChange} />)
    open()
    fireEvent.change(input(), { target: { value: '不存在的酒' } })
    expect(screen.getByText('找不到符合的項目')).toBeInTheDocument()
    fireEvent.keyDown(input(), { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })
})
