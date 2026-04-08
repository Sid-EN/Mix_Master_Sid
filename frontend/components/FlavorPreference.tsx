'use client'

import { useState, useEffect, useCallback } from 'react'

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

  useEffect(() => {
    const saved = loadPref()
    if (saved) setPref(saved)
  }, [])

  const setDim = useCallback((key: keyof FlavorPref, value: number) => {
    setPref(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setPref(prev => {
      const tags = prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
      return { ...prev, tags }
    })
  }, [])

  const applyPreset = useCallback((preset: FlavorPref) => {
    setPref(preset)
  }, [])

  const handleSave = () => {
    savePref(pref)
    window.dispatchEvent(new Event('flavor-pref-changed'))
    onClose()
  }

  const handleReset = () => {
    setPref(DEFAULT_PREF)
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event('flavor-pref-changed'))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-secondary border border-charcoal-700 shadow-glass animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-secondary border-b border-charcoal-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-gradient-amber">風味偏好設定</h2>
            <p className="font-mono text-xs text-charcoal-500 tracking-wider mt-1">Flavor Preference Settings</p>
          </div>
          <button onClick={onClose} className="text-charcoal-500 hover:text-neon-amber transition-colors text-xl p-1">✕</button>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* ── Quick Presets ──────────────────────────── */}
          <div>
            <p className="font-mono text-xs text-neon-cyan tracking-[0.2em] uppercase mb-3">Quick Presets 快速預設</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESETS.map(p => (
                <button
                  key={p.en}
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
                  <span className="text-lg">{dim.emoji}</span>
                  <span className="text-text-warm text-sm font-medium">{dim.labelZh}</span>
                  <span className="font-mono text-xs text-charcoal-500">{dim.labelEn}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {dim.options.map((opt, i) => (
                    <button
                      key={opt.value}
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
              <span className="text-lg">🏷️</span>
              <span className="text-text-warm text-sm font-medium">風味標籤</span>
              <span className="font-mono text-xs text-charcoal-500">Flavor Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {FLAVOR_TAGS.map(tag => {
                const active = pref.tags.includes(tag.en)
                return (
                  <button
                    key={tag.en}
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
        <div className="sticky bottom-0 bg-bg-secondary border-t border-charcoal-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="font-mono text-xs text-charcoal-500 hover:text-red-400 transition-colors tracking-wider"
          >
            重置 Reset
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-neon-cyan text-xs px-4 py-2">
              取消 Cancel
            </button>
            <button onClick={handleSave} className="btn-neon-amber text-xs px-4 py-2">
              儲存偏好 Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
