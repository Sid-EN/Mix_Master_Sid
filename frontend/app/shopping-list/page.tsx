'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  addItems,
  clearDone,
  loadList,
  removeItem,
  saveList,
  toPlainText,
  toggleItem,
  type ShoppingItem,
} from '@/lib/shoppingList'

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)

  // 資料存於 localStorage，必須在 effect 中讀取，否則首次渲染會與伺服器不一致
  useEffect(() => {
    setItems(loadList())
    setHydrated(true)
  }, [])

  const update = useCallback((next: ShoppingItem[]) => {
    setItems(next)
    saveList(next)
  }, [])

  const pending = useMemo(() => items.filter(i => !i.done), [items])
  const done = useMemo(() => items.filter(i => i.done), [items])

  const addCustom = () => {
    const name = draft.trim()
    if (!name) return
    update(addItems(items, [{ id: `custom:${name}`, name, neededMl: null }]))
    setDraft('')
  }

  const copyAll = async () => {
    const text = toPlainText(items)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 非安全來源（例如以 IP 連進來）時瀏覽器會拒絕存取剪貼簿。
      // 先前只是靜默失敗，按鈕看起來完全沒反應；
      // 改為把清單直接秀出來讓使用者自行複製。
      window.prompt('複製購物清單：', text)
    }
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <Link href="/" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors">
        ← 返回首頁
      </Link>

      <header className="mt-8 mb-8">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">Shopping List</p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">購物清單</h1>
        <p className="text-text-secondary">
          從配方頁或派對規劃加入缺少的材料，帶著這份清單去採購。
        </p>
        <div className="divider-amber mt-6" />
      </header>

      {/* 手動加入 */}
      <div className="flex gap-2 mb-8">
        <label htmlFor="new-item" className="sr-only">新增項目</label>
        <input
          id="new-item"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addCustom() }}
          placeholder="手動加入項目，例如：檸檬 3 顆"
          className="input-neon flex-1 px-4 py-2.5 text-sm"
        />
        <button
          onClick={addCustom}
          disabled={!draft.trim()}
          className="px-5 py-2.5 font-mono text-xs border border-neon-amber/60 text-neon-amber
                     rounded hover:bg-neon-amber/10 transition-colors disabled:opacity-40
                     disabled:cursor-not-allowed"
        >
          加入
        </button>
      </div>

      {!hydrated && <p className="text-text-muted font-mono text-sm">載入中…</p>}

      {hydrated && items.length === 0 && (
        <div className="text-center py-16 border border-dashed border-charcoal-700 rounded">
          <p className="text-4xl mb-4" aria-hidden="true">🛒</p>
          <p className="text-text-muted mb-6">清單是空的</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/recipes" className="px-4 py-2 font-mono text-xs border border-charcoal-700
                       text-text-muted rounded hover:border-neon-amber hover:text-neon-amber transition-colors">
              從配方庫挑選
            </Link>
            <Link href="/party" className="px-4 py-2 font-mono text-xs border border-charcoal-700
                       text-text-muted rounded hover:border-neon-cyan hover:text-neon-cyan transition-colors">
              規劃派對用量
            </Link>
          </div>
        </div>
      )}

      {hydrated && items.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs text-charcoal-500">
              待買 <span className="text-neon-amber">{pending.length}</span>
              {done.length > 0 && <> · 已買 {done.length}</>}
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="px-3 py-1.5 font-mono text-[11px] border border-charcoal-700 text-text-muted
                           rounded hover:border-neon-cyan hover:text-neon-cyan transition-colors"
              >
                {copied ? '已複製' : '複製清單'}
              </button>
              {done.length > 0 && (
                <button
                  onClick={() => update(clearDone(items))}
                  className="px-3 py-1.5 font-mono text-[11px] border border-charcoal-700 text-text-muted
                             rounded hover:border-neon-amber hover:text-neon-amber transition-colors"
                >
                  清除已買
                </button>
              )}
            </div>
          </div>

          <ul className="space-y-2">
            {[...pending, ...done].map(item => (
              <li
                key={item.id}
                className={`flex items-start gap-3 p-3 bg-bg-tertiary border rounded-sm transition-colors ${
                  item.done ? 'border-charcoal-800 opacity-50' : 'border-charcoal-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => update(toggleItem(items, item.id))}
                  className="mt-1 accent-neon-amber"
                  aria-label={`標記「${item.name}」為已買`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-text-warm ${item.done ? 'line-through' : ''}`}>
                    {item.name}
                    {item.neededMl !== null && (
                      <span className="ml-2 font-mono text-xs text-charcoal-500">
                        約 {Math.ceil(item.neededMl)} ml
                      </span>
                    )}
                  </p>
                  {item.sources.length > 0 && (
                    <p className="font-mono text-[11px] text-charcoal-500 mt-0.5">
                      來自：{item.sources.join('、')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => update(removeItem(items, item.id))}
                  className="text-charcoal-600 hover:text-red-400 transition-colors px-1"
                  aria-label={`移除「${item.name}」`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
