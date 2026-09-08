'use client'

import { useState, useEffect, useCallback, useRef, useId } from 'react'
import Portal from './Portal'
import { useScrollLock } from '../lib/useScrollLock'

/* ── Types ───────────────────────────────────────────────── */
export interface FlavorPref {
  sweet: number
  acid: number
  bitter: number
  punch: number
  tags: string[]
}

const STORAGE_KEY = 'mixmaster-flavor-pref'

const DEFAULT_PREF: FlavorPref = { sweet: 0.4, acid: 0.4, bitter: 0.4, punch: 0.4, tags: [] }

/* ── Dimension configs ───────────────────────────────────── */
interface DimOption { label: string; en: string; value: number }

const DIM_CONFIGS: {
  key: keyof Pick<FlavorPref, 'sweet' | 'acid' | 'bitter' | 'punch'>
  labelZh: string
  labelEn: string
  emoji: string
  options: DimOption[]
}[] = [
  {
    key: 'sweet', labelZh: '甜度偏好', labelEn: 'Sweetness', emoji: '🍯',
    options: [
      { label: '不甜', en: 'Dry', value: 0.1 },
      { label: '微甜', en: 'Lightly Sweet', value: 0.35 },
      { label: '中等', en: 'Medium', value: 0.6 },
      { label: '偏甜', en: 'Sweet', value: 0.85 },
    ],
  },
  {
    key: 'acid', labelZh: '酸度偏好', labelEn: 'Acidity', emoji: '🍋',
    options: [
      { label: '不酸', en: 'No Acid', value: 0.1 },
      { label: '微酸', en: 'Lightly Tart', value: 0.35 },
      { label: '中等', en: 'Medium', value: 0.6 },
      { label: '偏酸', en: 'Tart', value: 0.85 },
    ],
  },
  {
    key: 'bitter', labelZh: '苦度偏好', labelEn: 'Bitterness', emoji: '🫚',
    options: [
      { label: '不苦', en: 'No Bitter', value: 0.1 },
      { label: '微苦', en: 'Lightly Bitter', value: 0.35 },
      { label: '中等', en: 'Medium', value: 0.6 },
      { label: '偏苦', en: 'Bitter', value: 0.85 },
    ],
  },
  {
    key: 'punch', labelZh: '酒感偏好', labelEn: 'Alcohol Strength', emoji: '🔥',
    options: [
      { label: '輕盈', en: 'Light', value: 0.2 },
      { label: '中等', en: 'Medium', value: 0.45 },
      { label: '強烈', en: 'Strong', value: 0.7 },
      { label: '烈酒控', en: 'Spirit Forward', value: 0.95 },
    ],
  },
]

/* ── Flavor tags ─────────────────────────────────────────── */
const FLAVOR_TAGS: { label: string; en: string; keywords: string[] }[] = [
  { label: '果香',   en: 'Fruity',   keywords: ['fruity', 'fruit'] },
  { label: '草本',   en: 'Herbal',   keywords: ['herbal', 'herb'] },
  { label: '煙燻',   en: 'Smoky',    keywords: ['smoky', 'smoke'] },
  { label: '柑橘',   en: 'Citrus',   keywords: ['citrus', 'citrusy'] },
  { label: '花香',   en: 'Floral',   keywords: ['floral', 'flower'] },
  { label: '熱帶',   en: 'Tropical', keywords: ['tropical'] },
  { label: '香料',   en: 'Spicy',    keywords: ['spicy', 'spice'] },
  { label: '甜點',   en: 'Dessert',  keywords: ['dessert', 'sweet', 'vanilla', 'caramel', 'chocolate'] },
]

/* ── Presets ──────────────────────────────────────────────── */
const PRESETS: { label: string; en: string; emoji: string; pref: FlavorPref }[] = [
  {
    label: '清爽派', en: 'Fresh & Light', emoji: '🌊',
    pref: { sweet: 0.35, acid: 0.6, bitter: 0.1, punch: 0.2, tags: ['Citrus', 'Tropical', 'Fruity'] },
  },
  {
    label: '經典派', en: 'Classic Balance', emoji: '🎩',
    pref: { sweet: 0.4, acid: 0.4, bitter: 0.4, punch: 0.45, tags: ['Herbal', 'Citrus'] },
  },
  {
    label: '烈酒控', en: 'Spirit Forward', emoji: '🥃',
    pref: { sweet: 0.1, acid: 0.1, bitter: 0.6, punch: 0.95, tags: ['Smoky', 'Spicy'] },
  },
  {
    label: '甜點派', en: 'Sweet & Dessert', emoji: '🍰',
    pref: { sweet: 0.85, acid: 0.1, bitter: 0.1, punch: 0.2, tags: ['Dessert', 'Fruity', 'Tropical'] },
  },
]

/* ── Helpers ──────────────────────────────────────────────── */
export function loadPref(): FlavorPref | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FlavorPref) : null
  } catch { return null }
}

function savePref(p: FlavorPref) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

/* ── Scoring algorithm ───────────────────────────────────── */
export function scoreRecipe(recipe: any, pref: FlavorPref): number {
  const fp = recipe.flavorProfile
  if (!fp) return 0

  const dims: { recipeVal: number; prefVal: number }[] = [
    { recipeVal: fp.acid ?? fp.sour ?? 0.5, prefVal: pref.acid },
    { recipeVal: fp.sweet ?? 0.5, prefVal: pref.sweet },
    { recipeVal: fp.bitter ?? 0.5, prefVal: pref.bitter },
    { recipeVal: fp.punch ?? fp.alcohol ?? fp.spirit ?? 0.5, prefVal: pref.punch },
  ]

  // Dimension affinity: 1 - |distance|
  const dimScores = dims.map(d => 1 - Math.abs(d.recipeVal - d.prefVal))
  const dimAvg = dimScores.reduce((a, b) => a + b, 0) / dimScores.length

  // Tag bonus
  const primaryFlavors: string[] = fp.primaryFlavors || []
  const lowerPrimary = primaryFlavors.map((f: string) => f.toLowerCase())
  let tagMatches = 0
  for (const userTag of pref.tags) {
    const tagDef = FLAVOR_TAGS.find(t => t.en === userTag)
    if (!tagDef) continue
    const matched = tagDef.keywords.some(kw => lowerPrimary.some(pf => pf.includes(kw)))
    if (matched) tagMatches++
  }
  const tagBonus = pref.tags.length > 0 ? (tagMatches / pref.tags.length) * 0.3 : 0

  return Math.min(dimAvg * 0.7 + tagBonus + 0.15, 1)
}

export function getRecommendations(recipes: any[], pref: FlavorPref, count = 6): { recipe: any; score: number }[] {
  return recipes
    .map(r => ({ recipe: r, score: scoreRecipe(r, pref) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

/* ── Component ───────────────────────────────────────────── */
interface FlavorPreferenceProps {
  isOpen: boolean
  onClose: () => void
}

export default function FlavorPreference({ isOpen, onClose }: FlavorPreferenceProps) {
  const [pref, setPref] = useState<FlavorPref>(DEFAULT_PREF)
  const [note, setNote] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<Element | null>(null)
  const titleId = useId()

  useScrollLock(isOpen)

  /*
    每次開啟都重新讀取已儲存的偏好。

    先前只在元件首次掛載時讀一次，而關閉並不會卸載元件（isOpen 為 false
    時只是 return null，state 仍在），因此「取消」等於把未儲存的修改留在
    畫面上：下次打開看到的是沒存進去的設定，使用者以為已經生效。
  */
  useEffect(() => {
    if (!isOpen) return
    setPref(loadPref() ?? DEFAULT_PREF)
    setNote('')
    returnFocusRef.current = document.activeElement
  }, [isOpen])

  /*
    以 callback ref 移入焦點，而不是在 effect 裡讀 panelRef。
    Portal 首次渲染會先回傳 null（掛載後才拿得到 document），
    effect 執行的當下面板還不存在，panelRef.current 是 null，
    焦點於是永遠沒被移進來——鍵盤使用者得從頁首一路 Tab 過來。
    callback ref 則保證在節點真正接上時才觸發。
  */
  const attachPanel = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node
    node?.focus()
  }, [])

  /* 關閉時把焦點還給原本的觸發按鈕，否則焦點會掉回 <body> */
  const close = useCallback(() => {
    onClose()
    const el = returnFocusRef.current
    if (el instanceof HTMLElement) el.focus()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
        return
      }
      /*
        焦點鎖。對話框是 modal，Tab 不該跑到背後的頁面上，
        否則讀屏與鍵盤使用者會在看不見的內容裡迷路。
      */
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = [...panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )].filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  const setDim = useCallback((key: keyof FlavorPref, value: number) => {
    setPref(prev => ({ ...prev, [key]: value }))
    setNote('')
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setPref(prev => {
      const tags = prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      return { ...prev, tags }
    })
    setNote('')
  }, [])

  const applyPreset = useCallback((preset: FlavorPref) => {
    setPref(preset)
    setNote('')
  }, [])

  const handleSave = () => {
    savePref(pref)
    window.dispatchEvent(new Event('flavor-pref-changed'))
    close()
  }

  /*
    重置原本毫無回饋：偏好本來就是預設值時，畫面上沒有任何一處會變，
    使用者只能理解成「這顆按鈕壞了」。改為明確回報已還原。
  */
  const handleReset = () => {
    setPref(DEFAULT_PREF)
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('flavor-pref-changed'))
    setNote('已重置為預設偏好')
  }

  if (!isOpen) return null

  return (
    /* Portal：避免祖先的 transform 讓 fixed 失準，詳見 Portal.tsx */
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

        {/* Modal */}
        <div
          ref={attachPanel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-secondary border border-charcoal-700 shadow-glass animate-fade-in outline-none"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-bg-secondary border-b border-charcoal-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 id={titleId} className="font-display text-2xl text-gradient-amber">風味偏好設定</h2>
              <p className="font-mono text-xs text-charcoal-500 tracking-wider mt-1">Flavor Preference Settings</p>
            </div>
            <button type="button" onClick={close} aria-label="關閉風味偏好設定"
                    className="text-charcoal-500 hover:text-neon-amber transition-colors text-xl p-1">✕</button>
          </div>

          <div className="px-6 py-6 space-y-8">
            {/* ── Quick Presets ──────────────────────────── */}
            <div>
              <p className="font-mono text-xs text-neon-cyan tracking-[0.2em] uppercase mb-3">Quick Presets 快速預設</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESETS.map(p => (
                  <button
                    key={p.en}
                    type="button"
                    onClick={() => applyPreset(p.pref)}
                    className="glass-card p-3 text-center hover:border-neon-amber transition-all duration-300 group"
                  >
                    <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{p.emoji}</span>
                    <span className="text-text-warm text-sm block">{p.label}</span>
                    <span className="font-mono text-[10px] text-charcoal-500">{p.en}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Dimension Selectors ───────────────────── */}
            {DIM_CONFIGS.map(dim => {
              const currentVal = pref[dim.key] as number
              // Find closest option
              const closestIdx = dim.options.reduce(
                (best, opt, i) => (Math.abs(opt.value - currentVal) < Math.abs(dim.options[best].value - currentVal) ? i : best),
                0
              )

              return (
                <div key={dim.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg" aria-hidden="true">{dim.emoji}</span>
                    <span id={`${titleId}-${dim.key}`} className="text-text-warm text-sm font-medium">{dim.labelZh}</span>
                    <span className="font-mono text-xs text-charcoal-500">{dim.labelEn}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2" role="group" aria-labelledby={`${titleId}-${dim.key}`}>
                    {dim.options.map((opt, i) => (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={closestIdx === i}
                        onClick={() => setDim(dim.key, opt.value)}
                        className={`
                          py-2.5 px-2 text-center border transition-all duration-300 font-mono text-xs
                          ${closestIdx === i
                            ? 'border-neon-amber text-neon-amber bg-neon-amber/10 shadow-neon-amber'
                            : 'border-charcoal-700 text-charcoal-500 hover:border-charcoal-500 hover:text-text-secondary'
                          }
                        `}
                      >
                        <span className="block text-sm">{opt.label}</span>
                        <span className="block text-[10px] mt-0.5 opacity-70">{opt.en}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* ── Flavor Tags ──────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg" aria-hidden="true">🏷️</span>
                <span id={`${titleId}-tags`} className="text-text-warm text-sm font-medium">風味標籤</span>
                <span className="font-mono text-xs text-charcoal-500">Flavor Tags</span>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${titleId}-tags`}>
                {FLAVOR_TAGS.map(tag => {
                  const active = pref.tags.includes(tag.en)
                  return (
                    <button
                      key={tag.en}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleTag(tag.en)}
                      className={`
                        px-4 py-2 border transition-all duration-300 font-mono text-xs
                        ${active
                          ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-neon-cyan'
                          : 'border-charcoal-700 text-charcoal-500 hover:border-charcoal-500 hover:text-text-secondary'
                        }
                      `}
                    >
                      {tag.label} {tag.en}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-bg-secondary border-t border-charcoal-700 px-6 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <button
                type="button"
                onClick={handleReset}
                className="font-mono text-xs text-charcoal-500 hover:text-red-400 transition-colors tracking-wider"
              >
                重置 Reset
              </button>
              <p role="status" aria-live="polite" className="font-mono text-[11px] text-neon-cyan mt-1 h-4">
                {note}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={close} className="btn-neon-cyan text-xs px-4 py-2">
                取消 Cancel
              </button>
              <button type="button" onClick={handleSave} className="btn-neon-amber text-xs px-4 py-2">
                儲存偏好 Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
