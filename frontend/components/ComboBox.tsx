'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'

/**
 * 可用鍵盤操作的搜尋下拉。
 *
 * 「配方比較」與「批次換算」原本各有一份幾乎相同的實作，選項是
 * <li onClick>：<li> 不可聚焦、沒有鍵盤處理器，輸入框也不處理方向鍵，
 * 因此只靠鍵盤或讀屏軟體的人在這兩頁**完全無法選擇配方**——
 * 功能不是難用，是根本用不了。兩份都壞成一樣，所以抽成共用元件，
 * 順便讓下一個需要下拉的地方不會再壞第三次。
 *
 * 採用 ARIA 的 combobox 樣式：輸入框宣告 role="combobox" 與
 * aria-activedescendant，清單為 listbox、選項為 option。
 */
export interface ComboOption {
  id: string
}

interface ComboBoxProps<T extends ComboOption> {
  options: T[]
  value: string | null
  onChange: (id: string) => void
  search: string
  onSearchChange: (value: string) => void
  /** 無障礙名稱；沒有可見標籤時尤其重要 */
  label: string
  placeholder?: string
  emptyText?: string
  /** 空間不足時向上展開（批次換算的倍數區塊在下方） */
  openUpward?: boolean
  inputClassName?: string
  listClassName?: string
  optionClassName?: (option: T, isSelected: boolean, isActive: boolean) => string
  renderOption: (option: T, isSelected: boolean) => React.ReactNode
  /** 疊在輸入框上的已選項目標籤 */
  overlay?: React.ReactNode
}

export default function ComboBox<T extends ComboOption>({
  options,
  value,
  onChange,
  search,
  onSearchChange,
  label,
  placeholder,
  emptyText = '找不到符合的項目',
  openUpward = false,
  inputClassName = 'input-neon w-full text-sm',
  listClassName = '',
  optionClassName,
  renderOption,
  overlay,
}: ComboBoxProps<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  /* 選項換了就把游標移回第一項，否則會停在已不存在的索引上 */
  useEffect(() => setActive(0), [options.length, search])

  /* 點到元件外面就收起來 */
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  /* 用鍵盤移動時把選項捲進可視範圍 */
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const pick = useCallback((id: string) => {
    onChange(id)
    onSearchChange('')
    setOpen(false)
  }, [onChange, onSearchChange])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (open) { e.stopPropagation(); setOpen(false) }
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      if (options.length === 0) return
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive(i => (i + step + options.length) % options.length)
      return
    }
    if (e.key === 'Home' && open) { e.preventDefault(); setActive(0); return }
    if (e.key === 'End' && open) { e.preventDefault(); setActive(options.length - 1); return }
    if (e.key === 'Enter' && open && options[active]) {
      e.preventDefault()
      pick(options[active].id)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
        placeholder={placeholder}
        className={inputClassName}
        value={search}
        onFocus={() => setOpen(true)}
        onChange={e => { onSearchChange(e.target.value); setOpen(true) }}
        onKeyDown={onKeyDown}
      />

      {overlay}

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className={listClassName || `absolute z-[100] w-full ${openUpward ? 'bottom-full mb-1' : 'mt-1'}
                     max-h-64 overflow-y-auto border border-charcoal-700 bg-bg-secondary rounded shadow-card`}
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-charcoal-500 text-xs font-mono">{emptyText}</li>
          ) : options.map((o, i) => {
            const isSelected = o.id === value
            const isActive = i === active
            return (
              <li
                key={o.id}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                /* 先 preventDefault，否則輸入框會先失焦、清單在 click 之前就收掉 */
                onMouseDown={e => e.preventDefault()}
                onClick={() => pick(o.id)}
                onMouseEnter={() => setActive(i)}
                className={optionClassName?.(o, isSelected, isActive)
                  ?? `px-3 py-2 cursor-pointer transition-colors ${isActive ? 'bg-bg-tertiary' : ''}`}
              >
                {renderOption(o, isSelected)}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
