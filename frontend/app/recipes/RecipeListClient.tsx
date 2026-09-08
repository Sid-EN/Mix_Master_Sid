'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useFavorites } from '../../components/FavoritesContext'

/* ── Constants ─────────────────────────────────────────────── */

const METHOD_ICON: Record<string, string> = { shake: '🧊', stir: '🥄', build: '🥃', roll: '🏺' }
const METHOD_ZH: Record<string, string>   = { shake: '搖盪法', stir: '攪拌法', build: '直調法', roll: '擲壺法' }
const GRADE_CLR: Record<string, string>    = { A: '#2ECC71', B: '#F1C40F', C: '#E67E22', D: '#E74C3C' }

const METHOD_OPTIONS = [
  { key: 'all',   labelZh: '全部',   labelEn: 'All' },
  { key: 'shake', labelZh: '搖盪',   labelEn: 'Shake' },
  { key: 'stir',  labelZh: '攪拌',   labelEn: 'Stir' },
  { key: 'build', labelZh: '直調',   labelEn: 'Build' },
  { key: 'roll',  labelZh: '擲壺',   labelEn: 'Roll' },
]

type RangeKey = 'all' | 'low' | 'mid' | 'high'

const PUNCH_OPTIONS: { key: RangeKey; labelZh: string; labelEn: string; min: number; max: number }[] = [
  { key: 'all',  labelZh: '全部',   labelEn: 'All',    min: 0, max: 1 },
  { key: 'low',  labelZh: '輕盈',   labelEn: 'Light',  min: 0, max: 0.3 },
  { key: 'mid',  labelZh: '中等',   labelEn: 'Medium', min: 0.3, max: 0.6 },
  { key: 'high', labelZh: '強烈',   labelEn: 'Strong', min: 0.6, max: 1.0 },
]

const SWEET_OPTIONS: { key: RangeKey; labelZh: string; labelEn: string; min: number; max: number }[] = [
  { key: 'all',  labelZh: '全部',   labelEn: 'All',   min: 0, max: 1 },
  { key: 'low',  labelZh: '不甜',   labelEn: 'Dry',   min: 0, max: 0.3 },
  { key: 'mid',  labelZh: '微甜',   labelEn: 'Semi',  min: 0.3, max: 0.6 },
  { key: 'high', labelZh: '偏甜',   labelEn: 'Sweet', min: 0.6, max: 1.0 },
]

const ACID_OPTIONS: { key: RangeKey; labelZh: string; labelEn: string; min: number; max: number }[] = [
  { key: 'all',  labelZh: '全部',   labelEn: 'All',  min: 0, max: 1 },
  { key: 'low',  labelZh: '低酸',   labelEn: 'Low',  min: 0, max: 0.3 },
  { key: 'mid',  labelZh: '中酸',   labelEn: 'Mid',  min: 0.3, max: 0.6 },
  { key: 'high', labelZh: '高酸',   labelEn: 'High', min: 0.6, max: 1.0 },
]

const SORT_OPTIONS = [
  { key: 'name-az',         label: '名稱 A-Z' },
  { key: 'difficulty-asc',  label: '難度 低→高' },
  { key: 'difficulty-desc', label: '難度 高→低' },
  { key: 'punch-asc',       label: '酒精感 低→高' },
  { key: 'punch-desc',      label: '酒精感 高→低' },
  { key: 'sweet-asc',       label: '甜度 低→高' },
]

const SPIRIT_KEYWORDS = ['gin', 'vodka', 'rum', 'tequila', 'whiskey', 'whisky', 'bourbon', 'rye', 'scotch', 'mezcal', 'brandy', 'cognac'] as const

function detectBaseSpirit(ingredients: { slug?: string }[]): string {
  if (!ingredients || ingredients.length === 0) return 'other'
  const firstSlug = (ingredients[0].slug || '').toLowerCase()
  if (firstSlug.includes('gin')) return 'gin'
  if (firstSlug.includes('vodka')) return 'vodka'
  if (firstSlug.includes('rum') || firstSlug.includes('rhum')) return 'rum'
  if (firstSlug.includes('tequila') || firstSlug.includes('mezcal')) return 'tequila'
  if (firstSlug.includes('whiskey') || firstSlug.includes('whisky') || firstSlug.includes('bourbon') || firstSlug.includes('rye') || firstSlug.includes('scotch')) return 'whiskey'
  if (firstSlug.includes('brandy') || firstSlug.includes('cognac')) return 'brandy'
  return 'other'
}

const SPIRIT_LABELS: Record<string, string> = {
  gin: 'Gin 琴酒',
  vodka: 'Vodka 伏特加',
  rum: 'Rum 蘭姆酒',
  tequila: 'Tequila 龍舌蘭',
  whiskey: 'Whiskey 威士忌',
  brandy: 'Brandy 白蘭地',
  other: 'Other 其他',
}

/* ── Sub-components ────────────────────────────────────────── */

function Stars({ count }: { count: number }) {
  const n = Math.min(Math.max(Math.round(count), 0), 5)
  return (
    <span className="text-neon-amber text-sm tracking-wider">
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        font-mono text-xs tracking-wider px-3 py-1.5 border transition-all duration-200 rounded-sm
        ${active
          ? 'border-neon-amber text-neon-amber bg-neon-amber/10 shadow-neon-amber'
          : 'border-charcoal-700 text-charcoal-500 hover:border-charcoal-500 hover:text-text-secondary'
        }
      `}
    >
      {children}
    </button>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-[11px] text-text-muted tracking-wider uppercase mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────── */

interface RecipeListClientProps {
  recipes: any[]
}

export default function RecipeListClient({ recipes }: RecipeListClientProps) {
  const { isFavorite, toggleFavorite } = useFavorites()

  // Search
  const [search, setSearch] = useState('')

  // Filter panel toggle
  const [panelOpen, setPanelOpen] = useState(false)

  // Filter state
  const [method, setMethod] = useState('all')
  const [diffMin, setDiffMin] = useState(1)
  const [diffMax, setDiffMax] = useState(5)
  const [punch, setPunch] = useState<RangeKey>('all')
  const [sweet, setSweet] = useState<RangeKey>('all')
  const [acid, setAcid] = useState<RangeKey>('all')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [baseSpirit, setBaseSpirit] = useState('all')

  // Sort state
  const [sortKey, setSortKey] = useState('name-az')

  // Derive available flavor tags & base spirits from data
  const { allFlavorTags, availableSpirits } = useMemo(() => {
    const tagSet = new Set<string>()
    const spiritSet = new Set<string>()
    for (const r of recipes) {
      const fp = r.flavorProfile
      if (fp?.primaryFlavors) {
        for (const t of fp.primaryFlavors) tagSet.add(t)
      }
      spiritSet.add(detectBaseSpirit(r.ingredients || []))
    }
    const sortedTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b))
    const spiritOrder = ['gin', 'vodka', 'rum', 'tequila', 'whiskey', 'brandy', 'other']
    const sortedSpirits = spiritOrder.filter(s => spiritSet.has(s))
    return { allFlavorTags: sortedTags, availableSpirits: sortedSpirits }
  }, [recipes])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (method !== 'all') count++
    if (diffMin > 1 || diffMax < 5) count++
    if (punch !== 'all') count++
    if (sweet !== 'all') count++
    if (acid !== 'all') count++
    if (selectedTags.size > 0) count++
    if (baseSpirit !== 'all') count++
    return count
  }, [method, diffMin, diffMax, punch, sweet, acid, selectedTags, baseSpirit])

  // Reset all filters
  const resetFilters = () => {
    setMethod('all')
    setDiffMin(1)
    setDiffMax(5)
    setPunch('all')
    setSweet('all')
    setAcid('all')
    setSelectedTags(new Set())
    setBaseSpirit('all')
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  // Helper to check range filter
  const inRange = (val: number | undefined, option: typeof PUNCH_OPTIONS[number]) =>
    option.key === 'all' || (val !== undefined && val >= option.min && val <= option.max)

  // Filter + sort
  const results = useMemo(() => {
    const punchOpt = PUNCH_OPTIONS.find(o => o.key === punch)!
    const sweetOpt = SWEET_OPTIONS.find(o => o.key === sweet)!
    const acidOpt  = ACID_OPTIONS.find(o => o.key === acid)!

    let list = recipes.filter((r: any) => {
      // Search by name
      if (search) {
        const q = search.toLowerCase()
        const nameZh = (r.nameZh || r.name_zh || r.name || '').toLowerCase()
        const nameEn = (r.nameEn || r.name_en || '').toLowerCase()
        if (!nameZh.includes(q) && !nameEn.includes(q)) return false
      }

      // Method
      if (method !== 'all' && r.method !== method) return false

      // Difficulty
      const diff = r.difficulty ?? 3
      if (diff < diffMin || diff > diffMax) return false

      // Punch
      const fp = r.flavorProfile || {}
      if (!inRange(fp.punch, punchOpt)) return false

      // Sweetness
      if (!inRange(fp.sweet, sweetOpt)) return false

      // Acidity
      if (!inRange(fp.acid, acidOpt)) return false

      // Flavor tags (ANY match)
      if (selectedTags.size > 0) {
        const primary: string[] = fp.primaryFlavors || []
        if (!primary.some(t => selectedTags.has(t))) return false
      }

      // Base spirit
      if (baseSpirit !== 'all') {
        if (detectBaseSpirit(r.ingredients || []) !== baseSpirit) return false
      }

      return true
    })

    // Sort
    list = [...list].sort((a: any, b: any) => {
      switch (sortKey) {
        case 'name-az': {
          const aName = (a.nameEn || a.name_en || a.nameZh || '').toLowerCase()
          const bName = (b.nameEn || b.name_en || b.nameZh || '').toLowerCase()
          return aName.localeCompare(bName)
        }
        case 'difficulty-asc':  return (a.difficulty ?? 3) - (b.difficulty ?? 3)
        case 'difficulty-desc': return (b.difficulty ?? 3) - (a.difficulty ?? 3)
        case 'punch-asc':       return (a.flavorProfile?.punch ?? 0) - (b.flavorProfile?.punch ?? 0)
        case 'punch-desc':      return (b.flavorProfile?.punch ?? 0) - (a.flavorProfile?.punch ?? 0)
        case 'sweet-asc':       return (a.flavorProfile?.sweet ?? 0) - (b.flavorProfile?.sweet ?? 0)
        default: return 0
      }
    })

    return list
  }, [recipes, search, method, diffMin, diffMax, punch, sweet, acid, selectedTags, baseSpirit, sortKey])

  return (
    <>
      {/*
        頁面的 h1 之後直接出現卡片的 h3，標題層級會斷層，
        以讀屏軟體瀏覽時無法建立正確的大綱。
        補一個僅供輔助技術讀取的 h2，視覺上完全不變。
      */}
      <h2 className="sr-only">配方列表</h2>

      {/* ── Search + Filter Toggle + Sort Row ────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500 text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋配方名稱 Search recipes..."
            className="input-neon pl-9 !py-2.5"
          />
        </div>

        {/* Advanced Filter Toggle */}
        <button
          type="button"
          onClick={() => setPanelOpen(v => !v)}
          className={`
            btn-neon-amber !px-4 !py-2.5 !text-xs relative whitespace-nowrap
            ${panelOpen ? 'bg-neon-amber/10' : ''}
          `}
        >
          <span className="mr-1.5">⚙</span>
          篩選 Filter
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-neon-amber text-bg-primary text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value)}
          aria-label="配方排序方式"
          className="input-neon !py-2.5 !w-auto !min-w-[160px] cursor-pointer"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ── Advanced Filter Panel ────────────────────────────── */}
      {panelOpen && (
        <div className="glass-card p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg text-gradient-amber">進階篩選 Advanced Filters</h3>
            <button
              type="button"
              onClick={resetFilters}
              className="btn-neon-cyan !px-3 !py-1.5 !text-[10px]"
            >
              清除所有篩選 Reset
            </button>
          </div>

          {/* Method */}
          <FilterSection label="手法 Method">
            {METHOD_OPTIONS.map(opt => (
              <Chip key={opt.key} active={method === opt.key} onClick={() => setMethod(opt.key)}>
                {opt.key !== 'all' && <span className="mr-1">{METHOD_ICON[opt.key]}</span>}
                {opt.labelZh} {opt.labelEn}
              </Chip>
            ))}
          </FilterSection>

          {/* Difficulty */}
          <FilterSection label="難度 Difficulty">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-text-muted">Min</span>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={`min-${n}`}
                  type="button"
                  onClick={() => { setDiffMin(n); if (n > diffMax) setDiffMax(n) }}
                  /*
                    原本按鈕內只有一個「☆」：讀屏軟體會連唸十個星號，
                    分不出哪些是最低、哪些是最高難度，也聽不出目前選到幾星。
                    點擊區也只有字元本身那麼寬，手機上很難按準。
                  */
                  aria-label={`最低難度 ${n} 星`}
                  aria-pressed={n <= diffMin}
                  className={`text-lg leading-none min-w-[24px] min-h-[24px] inline-flex items-center justify-center transition-all duration-200 ${n <= diffMin ? 'text-neon-amber' : 'text-charcoal-600 hover:text-charcoal-500'}`}
                >
                  <span aria-hidden="true">{n <= diffMin ? '★' : '☆'}</span>
                </button>
              ))}
              <span className="font-mono text-charcoal-600 mx-1">—</span>
              <span className="font-mono text-xs text-text-muted">Max</span>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={`max-${n}`}
                  type="button"
                  onClick={() => { setDiffMax(n); if (n < diffMin) setDiffMin(n) }}
                  aria-label={`最高難度 ${n} 星`}
                  aria-pressed={n <= diffMax}
                  className={`text-lg leading-none min-w-[24px] min-h-[24px] inline-flex items-center justify-center transition-all duration-200 ${n <= diffMax ? 'text-neon-amber' : 'text-charcoal-600 hover:text-charcoal-500'}`}
                >
                  <span aria-hidden="true">{n <= diffMax ? '★' : '☆'}</span>
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Punch */}
          <FilterSection label="酒精強度 Alcohol Punch">
            {PUNCH_OPTIONS.map(opt => (
              <Chip key={opt.key} active={punch === opt.key} onClick={() => setPunch(opt.key)}>
                {opt.labelZh} {opt.labelEn}
              </Chip>
            ))}
          </FilterSection>

          {/* Sweetness */}
          <FilterSection label="甜度範圍 Sweetness">
            {SWEET_OPTIONS.map(opt => (
              <Chip key={opt.key} active={sweet === opt.key} onClick={() => setSweet(opt.key)}>
                {opt.labelZh} {opt.labelEn}
              </Chip>
            ))}
          </FilterSection>

          {/* Acidity */}
          <FilterSection label="酸度範圍 Acidity">
            {ACID_OPTIONS.map(opt => (
              <Chip key={opt.key} active={acid === opt.key} onClick={() => setAcid(opt.key)}>
                {opt.labelZh} {opt.labelEn}
              </Chip>
            ))}
          </FilterSection>

          {/* Base Spirit */}
          {availableSpirits.length > 0 && (
            <FilterSection label="基酒類型 Base Spirit">
              <Chip active={baseSpirit === 'all'} onClick={() => setBaseSpirit('all')}>
                全部 All
              </Chip>
              {availableSpirits.map(s => (
                <Chip key={s} active={baseSpirit === s} onClick={() => setBaseSpirit(s)}>
                  {SPIRIT_LABELS[s] || s}
                </Chip>
              ))}
            </FilterSection>
          )}

          {/* Flavor Tags */}
          {allFlavorTags.length > 0 && (
            <FilterSection label="風味標籤 Flavor Tags">
              {allFlavorTags.map(tag => (
                <Chip key={tag} active={selectedTags.has(tag)} onClick={() => toggleTag(tag)}>
                  {tag}
                </Chip>
              ))}
            </FilterSection>
          )}
        </div>
      )}

      {/* ── Result Count ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <span className="font-mono text-xs text-charcoal-500">
          顯示 <span className="text-neon-amber">{results.length}</span> / {recipes.length} 款配方
        </span>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="font-mono text-[11px] text-charcoal-500 hover:text-neon-amber transition-colors"
          >
            ✕ 清除篩選
          </button>
        )}
      </div>

      {/* ── Recipe Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r: any) => {
          const slug = r.slug || r.id
          const nameZh = r.nameZh || r.name_zh || r.name
          const nameEn = r.nameEn || r.name_en || ''
          const desc = r.descriptionZh || r.description_zh || r.description || ''
          const recipeMethod = r.method || 'build'
          const grade = r.grade || r.balanceGrade || ''
          const score = r.balanceScore ?? r.balance_score ?? ''
          const difficulty = r.difficulty ?? 3
          const origin = r.origin || ''
          const tags = r.tags || []
          const ingredients = r.ingredients || []
          const glassImg = r.glassImage || r.glass_image || METHOD_ICON[recipeMethod] || '🍹'

          return (
            <div key={slug} className="glass-card p-6 hover:border-neon-amber transition-all duration-300 group relative">
              {/* Favorite toggle */}
              <button
                onClick={() => toggleFavorite(slug)}
                /* 只有字元寬的點擊區在手機上很難按準，改以 padding 撐到 24×24 以上 */
                className={`absolute top-1 right-1 p-2 text-lg leading-none z-10 transition-all duration-300 hover:scale-125 ${
                  isFavorite(slug)
                    ? 'text-neon-amber drop-shadow-[0_0_6px_rgba(245,166,35,0.6)]'
                    : 'text-charcoal-600 hover:text-neon-amber'
                }`}
                aria-label={isFavorite(slug) ? '取消收藏' : '收藏'}
              >
                {isFavorite(slug) ? '⭐' : '☆'}
              </button>
            <Link
              href={`/recipes/${slug}`}
              className="block"
            >
              {/* Header row: glass + method + balance */}
              <div className="flex items-start justify-between mb-4 pr-8">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {glassImg}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-1 border border-charcoal-700 text-charcoal-500 uppercase tracking-wider">
                    {METHOD_ICON[recipeMethod]} {METHOD_ZH[recipeMethod] || recipeMethod}
                  </span>
                  {grade && (
                    <span
                      className="font-mono text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1"
                      style={{ backgroundColor: GRADE_CLR[grade] || '#888', color: '#fff' }}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/40" />
                      {grade}{score ? ` ${score}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Names */}
              <h3 className="font-display text-2xl text-text-warm mb-1 group-hover:text-neon-amber transition-colors">
                {nameZh}
              </h3>
              <p className="font-mono text-xs text-charcoal-500 mb-3">{nameEn}</p>

              {/* Difficulty Stars */}
              <div className="flex items-center gap-3 mb-3">
                <Stars count={difficulty} />
                {origin && (
                  <span className="text-text-muted text-xs">{origin}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-4">
                {desc}
              </p>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.slice(0, 4).map((t: string) => (
                    <span key={t} className="font-mono text-[10px] px-2 py-0.5 border border-charcoal-700 text-charcoal-500 rounded-sm">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Ingredient count */}
              <div className="flex items-center justify-between pt-3 border-t border-charcoal-800">
                <span className="font-mono text-xs text-text-muted">
                  🧪 {ingredients.length} 種材料
                </span>
                <span className="font-mono text-[10px] text-charcoal-600 group-hover:text-neon-amber transition-colors">
                  查看詳情 →
                </span>
              </div>
            </Link>
            </div>
          )
        })}
      </div>

      {results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🍸</p>
          <p className="text-text-muted font-mono text-sm">
            {activeFilterCount > 0 || search ? '找不到符合條件的配方' : '此分類尚無配方'}
          </p>
          {(activeFilterCount > 0 || search) && (
            <button
              type="button"
              onClick={() => { resetFilters(); setSearch('') }}
              className="mt-4 font-mono text-xs text-neon-amber hover:underline"
            >
              清除所有篩選條件
            </button>
          )}
        </div>
      )}
    </>
  )
}
