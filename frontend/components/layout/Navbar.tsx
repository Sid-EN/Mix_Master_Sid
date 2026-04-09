'use client'

import { useState, useRef, useEffect } from 'react'
import SearchModal from '../SearchModal'
import FlavorPreference from '../FlavorPreference'
import XPBar from '../XPBar'
import LanguageSwitcher from '../LanguageSwitcher'
import { useTheme } from '../ThemeContext'

/* ── All nav items (used by mobile + mega menu) ─────────── */
const NAV_ITEMS = [
  { href: '/',         label: '首頁',       labelEn: 'HOME' },
  { href: '/engine',   label: '配方引擎',   labelEn: 'ENGINE',  icon: '🧪' },
  { href: '/my-bar',   label: '我的酒櫃',   labelEn: 'MY BAR',  icon: '🍸' },
  { href: '/favorites', label: '我的收藏', labelEn: 'FAVORITES', icon: '⭐' },
  { href: '/recipes',  label: '配方庫',     labelEn: 'RECIPES', icon: '📚' },
  { href: '/prep',     label: '備料工坊',   labelEn: 'PREP',    icon: '🫙' },
  { href: '/batch',    label: '批次換算',   labelEn: 'BATCH',   icon: '🧮' },
  { href: '/compare',  label: '配方比較',   labelEn: 'COMPARE', icon: '📊' },
  { href: '/tools',    label: '工具箱',     labelEn: 'TOOLS',   icon: '🛠️' },
  { href: '/academy',  label: '調酒學院',   labelEn: 'ACADEMY', icon: '🎓' },
  { href: '/quiz',     label: '知識測驗',   labelEn: 'QUIZ',    icon: '❓' },
]

/* ── Mega Menu column definitions ───────────────────────── */
const MEGA_COLUMNS = [
  {
    title: '調酒創作',
    titleEn: 'CREATE',
    color: 'text-neon-amber',
    items: [
      { href: '/engine',   icon: '🧪', label: '智慧配方引擎', desc: 'AI 驅動風味配對' },
      { href: '/recipes',  icon: '📚', label: '配方庫',       desc: '51+ 經典與創意酒譜' },
      { href: '/prep',     icon: '🫙', label: '備料工坊',     desc: '糖漿・苦精・浸泡酒' },
      { href: '/compare',  icon: '📊', label: '配方比較器',   desc: '雷達圖並排比較' },
      { href: '/random',   icon: '🎲', label: '隨機轉盤',     desc: '命運之輪選配方' },
      { href: '/mood',     icon: '🎵', label: '情境酒單',     desc: '依心情推薦調酒' },
    ],
  },
  {
    title: '個人空間',
    titleEn: 'MY SPACE',
    color: 'text-neon-cyan',
    items: [
      { href: '/dashboard',     icon: '📊', label: '個人儀表板', desc: '統計數據與學習進度' },
      { href: '/my-bar',        icon: '🍸', label: '我的酒櫃', desc: '材料庫存與配方推薦' },
      { href: '/favorites',     icon: '⭐', label: '我的收藏', desc: '收藏配方與品飲筆記' },
      { href: '/achievements',  icon: '🏅', label: '成就徽章', desc: '解鎖挑戰與里程碑' },
    ],
  },
  {
    title: '實用工具',
    titleEn: 'TOOLS',
    color: 'text-neon-purple',
    items: [
      { href: '/batch',          icon: '🧮', label: '批次換算', desc: '多人份量自動換算' },
      { href: '/tools/abv',      icon: '📐', label: 'ABV 計算', desc: '酒精濃度即時計算' },
      { href: '/tools/cost',     icon: '💰', label: '成本計算', desc: '每杯成本精算' },
      { href: '/tools/convert',  icon: '🌡️', label: '單位換算', desc: 'oz・ml・cl 互轉' },
    ],
  },
  {
    title: '知識學院',
    titleEn: 'ACADEMY',
    color: 'text-green-400',
    items: [
      { href: '/academy',              icon: '🎓', label: '調酒學院', desc: '系統化知識體系' },
      { href: '/academy/wine',         icon: '🍷', label: '葡萄酒百科', desc: '產區・品種・年份' },
      { href: '/academy/spirits',      icon: '🥃', label: '烈酒百科', desc: '蒸餾・陳年・風味' },
      { href: '/academy/techniques',   icon: '📐', label: '技法圖解', desc: '10 種調酒手法' },
      { href: '/academy/molecular',    icon: '🧪', label: '分子調酒', desc: '球化・煙燻・泡沫' },
      { href: '/academy/ice',          icon: '🧊', label: '冰塊百科', desc: '冰的藝術與科學' },
      { href: '/academy/glassware',    icon: '🥂', label: '杯型百科', desc: '16 種經典杯型' },
      { href: '/academy/hangover',     icon: '💊', label: '宿醉指南', desc: '科學預防與迷思' },
    ],
  },
  {
    title: '探索發現',
    titleEn: 'EXPLORE',
    color: 'text-rose-400',
    items: [
      { href: '/flavor-wheel',  icon: '🎡', label: '互動風味輪', desc: '視覺化探索風味' },
      { href: '/world-map',     icon: '🗺️', label: '產地地圖', desc: '世界產區風土探索' },
      { href: '/history',       icon: '📜', label: '歷史時間軸', desc: '數千年調酒文明' },
      { href: '/hall-of-fame',  icon: '🏆', label: '名人堂', desc: '15 位傳奇調酒師' },
      { href: '/quiz',          icon: '❓', label: '知識測驗', desc: '40 題挑戰你的實力' },
    ],
  },
]

/* ── Mega Menu Panel ────────────────────────────────────── */
function MegaMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div ref={ref}
         className="absolute top-full left-0 right-0 z-[60] border-b border-charcoal-700
                    bg-bg-primary shadow-2xl animate-fade-in"
         style={{ backgroundColor: 'var(--color-bg-secondary, #111118)' }}>
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-5 gap-6">
          {MEGA_COLUMNS.map(col => (
            <div key={col.titleEn}>
              <h3 className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-4 ${col.color}`}>
                {col.title}
                <span className="text-charcoal-600 ml-1.5">{col.titleEn}</span>
              </h3>
              <ul className="space-y-1">
                {col.items.map(item => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-start gap-3 px-3 py-2.5 -mx-3 rounded-lg
                                 hover:bg-bg-tertiary transition-all duration-200"
                    >
                      <span className="text-lg mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-text-warm group-hover:text-neon-amber transition-colors font-medium">
                          {item.label}
                        </p>
                        <p className="text-xs text-charcoal-500 group-hover:text-text-muted transition-colors truncate">
                          {item.desc}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-5 border-t border-charcoal-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/docs" target="_blank" rel="noopener noreferrer"
               className="font-mono text-[11px] text-charcoal-500 hover:text-neon-cyan transition-colors tracking-wider">
              📖 API Docs ↗
            </a>
            <a href="/health"
               className="font-mono text-[11px] text-charcoal-500 hover:text-green-400 transition-colors tracking-wider">
              💚 Status
            </a>
          </div>
          <p className="font-mono text-[10px] text-charcoal-600 tracking-widest">
            MIXMASTER v1.0 · PHASE 1.5
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Mobile Menu ────────────────────────────────────────── */
function MobileMenu({
  isOpen,
  onClose,
  onSearch,
  onPref,
}: {
  isOpen: boolean
  onClose: () => void
  onSearch: () => void
  onPref: () => void
}) {
  const { theme, toggleTheme } = useTheme()
  if (!isOpen) return null

  return (
    <div className="md:hidden border-b border-charcoal-800 animate-fade-in max-h-[80vh] overflow-y-auto"
         style={{ backgroundColor: 'var(--color-bg-secondary, #111118)' }}>
      {/* Search */}
      <button
        onClick={() => { onSearch(); onClose() }}
        className="w-full flex items-center gap-3 px-6 py-4 font-mono text-sm
                   text-text-secondary hover:text-neon-cyan hover:bg-bg-tertiary
                   transition-colors border-b border-charcoal-800 text-left"
      >
        <span>🔍</span> 搜尋配方…
      </button>

      {/* Grouped sections */}
      {MEGA_COLUMNS.map(col => (
        <div key={col.titleEn}>
          <p className={`px-6 pt-4 pb-1 font-mono text-[10px] tracking-[0.25em] uppercase ${col.color}`}>
            {col.title} <span className="text-charcoal-600">{col.titleEn}</span>
          </p>
          {col.items.map(item => (
            <a key={item.href} href={item.href}
               className="flex items-center gap-3 px-6 py-3 text-sm text-text-secondary
                          hover:text-neon-amber hover:bg-bg-tertiary transition-colors">
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              <span className="text-[10px] text-charcoal-600 tracking-wider">{item.desc}</span>
            </a>
          ))}
        </div>
      ))}

      {/* Utilities */}
      <div className="border-t border-charcoal-700 mt-2">
        <button onClick={() => { onPref(); onClose() }}
                className="w-full flex items-center gap-3 px-6 py-3.5 text-sm text-text-secondary
                           hover:text-neon-amber hover:bg-bg-tertiary transition-colors text-left">
          <span>🎯</span> 風味偏好設定
        </button>
        <button onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-6 py-3.5 text-sm text-text-secondary
                           hover:text-neon-amber hover:bg-bg-tertiary transition-colors text-left">
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
        </button>
        <a href="/docs" target="_blank" rel="noopener noreferrer"
           className="flex items-center gap-3 px-6 py-3.5 text-sm text-text-secondary
                      hover:text-neon-cyan hover:bg-bg-tertiary transition-colors">
          <span>📖</span> API 文件 ↗
        </a>
      </div>
    </div>
  )
}

/* ── Main Navbar ────────────────────────────────────────── */
export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [prefOpen, setPrefOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-charcoal-800"
           style={{ backgroundColor: 'var(--color-bg-secondary, #111118)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="text-2xl group-hover:animate-pulse">🍹</span>
            <span className="font-display text-lg text-neon-amber text-neon-glow-amber tracking-wider">
              MixMaster
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-charcoal-600 tracking-widest">
              v1.0
            </span>
          </a>

          {/* Desktop Nav — clean row with key links + mega trigger */}
          <div className="hidden md:flex items-center gap-0.5">
            {/* Primary quick links */}
            {[
              { href: '/engine',  icon: '🧪', en: 'ENGINE' },
              { href: '/recipes', icon: '📚', en: 'RECIPES' },
              { href: '/my-bar',  icon: '🍸', en: 'MY BAR' },
              { href: '/academy', icon: '🎓', en: 'ACADEMY' },
            ].map(link => (
              <a key={link.href} href={link.href}
                 className="px-3 py-2 font-mono text-[11px] tracking-[0.15em] text-charcoal-500
                            hover:text-neon-amber transition-colors duration-200 uppercase">
                <span className="mr-1">{link.icon}</span>{link.en}
              </a>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-charcoal-700 mx-1" />

            {/* Mega menu trigger */}
            <button
              onClick={() => setMegaOpen(v => !v)}
              className={`px-3 py-2 font-mono text-[11px] tracking-[0.15em] uppercase transition-all duration-200
                flex items-center gap-1.5 rounded-md
                ${megaOpen
                  ? 'text-neon-amber bg-neon-amber/10'
                  : 'text-charcoal-500 hover:text-neon-amber hover:bg-bg-tertiary'
                }`}
            >
              <span className="grid grid-cols-2 gap-[2px] w-3 h-3">
                <span className={`w-[5px] h-[5px] rounded-[1px] ${megaOpen ? 'bg-neon-amber' : 'bg-charcoal-500'}`} />
                <span className={`w-[5px] h-[5px] rounded-[1px] ${megaOpen ? 'bg-neon-amber' : 'bg-charcoal-500'}`} />
                <span className={`w-[5px] h-[5px] rounded-[1px] ${megaOpen ? 'bg-neon-amber' : 'bg-charcoal-500'}`} />
                <span className={`w-[5px] h-[5px] rounded-[1px] ${megaOpen ? 'bg-neon-amber' : 'bg-charcoal-500'}`} />
              </span>
              全部功能
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-charcoal-700 mx-1" />

            {/* Utility buttons */}
            <button
              onClick={() => setPrefOpen(true)}
              className="px-2 py-2 text-charcoal-500 hover:text-neon-amber transition-colors"
              title="風味偏好設定"
            >
              🎯
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="px-2 py-2 text-charcoal-500 hover:text-neon-cyan transition-colors"
              title="搜尋"
            >
              🔍
            </button>

            <XPBar />

            <button
              onClick={toggleTheme}
              className="px-2 py-2 text-charcoal-500 hover:text-neon-amber transition-colors"
              title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <LanguageSwitcher />

            <a href="/docs" target="_blank" rel="noopener noreferrer"
               className="ml-1 px-2.5 py-1 border border-charcoal-700 font-mono text-[10px]
                          text-charcoal-500 hover:border-neon-cyan hover:text-neon-cyan
                          transition-colors tracking-widest rounded-sm">
              API ↗
            </a>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden text-charcoal-500 hover:text-neon-amber p-2 text-lg">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Desktop Mega Menu */}
        <MegaMenu isOpen={megaOpen} onClose={() => setMegaOpen(false)} />

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onSearch={() => setSearchOpen(true)}
          onPref={() => setPrefOpen(true)}
        />
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <FlavorPreference isOpen={prefOpen} onClose={() => setPrefOpen(false)} />
    </>
  )
}
