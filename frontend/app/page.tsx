import { serverUrl } from '../lib/api'
import HomeRecommendations from '../components/HomeRecommendations'
import PersonalRecommendations from '../components/PersonalRecommendations'
import CocktailOfTheDay from '../components/CocktailOfTheDay'
import SeasonalRecommendations from '../components/SeasonalRecommendations'
import { HomeHeroText, HomeCtaButtons, HomeSectionTitle } from '../components/HomeI18nSections'
import HeroParticles from '../components/HeroParticles'
import ScrollReveal from '../components/ScrollReveal'

async function getStats() {
  try {
    const [ingRes, recRes] = await Promise.all([
      fetch(serverUrl('/api/v1/ingredients?limit=1'), { cache: 'no-store' }),
      fetch(serverUrl('/api/v1/recipes?limit=1'), { cache: 'no-store' }),
    ])
    const ing = await ingRes.json()
    const rec = await recRes.json()
    return { ingredients: ing.total || 0, recipes: rec.total || 0 }
  } catch {
    return { ingredients: 117, recipes: 60 }
  }
}

/* ── Quick Access feature grid data ─────────────────────── */
const FEATURES = [
  { icon: '🧪', title: '智慧配方引擎', desc: 'AI 計算最佳酸甜比，動態調配 ABV，生成專屬簽名調酒', href: '/engine', accent: 'amber' },
  { icon: '📚', title: '配方庫', desc: '51+ 經典 IBA 配方與 AI 獨家創意配方，完整風味結構記錄', href: '/recipes', accent: 'cyan' },
  { icon: '🎓', title: '調酒學院', desc: '五級學習路徑，從新手到大師工匠，涵蓋器材手法與風土百科', href: '/academy', accent: 'purple' },
  { icon: '🗺️', title: '產地互動地圖', desc: '探索全球酒類產區，了解風土與經典在地調酒文化', href: '/world-map', accent: 'cyan' },
  { icon: '🎲', title: '隨機配方轉盤', desc: '不知道喝什麼？讓命運之輪為你選一杯驚喜調酒', href: '/random', accent: 'amber' },
  { icon: '💬', title: '術語辭典', desc: '調酒專業術語一站查詢，從 Jigger 到 Muddling 輕鬆搞懂', href: '/glossary', accent: 'purple' },
] as const

/* ── Explore More secondary features ────────────────────── */
const EXPLORE_ITEMS = [
  { icon: '🧊', title: '冰塊百科', desc: '不同冰型對稀釋度與溫度的影響', href: '/academy/techniques' },
  { icon: '🥂', title: '杯型百科', desc: '每種杯型的設計原理與適用調酒', href: '/academy/techniques' },
  { icon: '🎨', title: '裝飾藝術', desc: '從柑橘皮到可食花卉的裝飾技法', href: '/prep' },
  { icon: '🧪', title: '分子調酒', desc: '球化、泡沫、凝膠的前沿技術', href: '/academy' },
  { icon: '💊', title: '宿醉指南', desc: '科學解析與預防宿醉的實用建議', href: '/glossary' },
  { icon: '🏪', title: '經典酒吧', desc: '環遊世界造訪傳奇雞尾酒吧', href: '/famous-bars' },
  { icon: '🏆', title: '名人堂', desc: '調酒界傳奇人物與經典故事', href: '/hall-of-fame' },
  { icon: '📜', title: '歷史時間軸', desc: '從古埃及到現代的調酒演進史', href: '/history' },
  { icon: '🎡', title: '風味輪', desc: '視覺化探索 15 維風味空間', href: '/flavor-wheel' },
  { icon: '🧉', title: 'Mocktails', desc: '零酒精也能享受調酒樂趣', href: '/mocktails' },
  { icon: '🎵', title: '情境酒單', desc: '依場景心情推薦最搭調酒', href: '/mood' },
  { icon: '🔬', title: '稀釋模擬器', desc: '模擬冰塊融化對風味的即時影響', href: '/tools/abv' },
]

const ACCENT_CLASSES = {
  amber:  'group-hover:border-neon-amber group-hover:shadow-[0_0_20px_rgba(245,166,35,0.15)]',
  cyan:   'group-hover:border-neon-cyan group-hover:shadow-[0_0_20px_rgba(0,255,255,0.12)]',
  purple: 'group-hover:border-neon-purple group-hover:shadow-[0_0_20px_rgba(155,89,182,0.12)]',
} as const

export default async function HomePage() {
  const stats = await getStats()

  return (
    <main className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-28 pb-20 md:pt-36 md:pb-28 text-center overflow-hidden min-h-[85vh]">
        {/* Parallax background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary/40 to-bg-primary pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_20%_20%,rgba(245,166,35,0.06)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_80%_80%,rgba(0,255,255,0.04)_0%,transparent_60%)] pointer-events-none" />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-neon-amber/5 rounded-full blur-3xl pointer-events-none hero-glow-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-neon-cyan/3 rounded-full blur-3xl pointer-events-none hero-glow-pulse-alt" />

        {/* CSS-only floating particles */}
        <HeroParticles />

        {/* Hero content */}
        <div className="relative z-10">
          <HomeHeroText />

          {/* Decorative neon dividers */}
          <div className="flex items-center gap-3 mt-10 mb-12 justify-center">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-neon-amber/60" />
            <div className="h-px w-10 bg-neon-amber" />
            <span className="text-neon-amber text-2xl animate-pulse-slow">🍹</span>
            <div className="h-px w-10 bg-neon-amber" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-neon-amber/60" />
          </div>

          {/* CTA Buttons with glow */}
          <HomeCtaButtons />
        </div>

        {/* Stats bar integrated at hero bottom */}
        <div className="relative z-10 mt-16 w-full max-w-4xl mx-auto">
          <div className="border border-charcoal-800/60 bg-bg-secondary/30 backdrop-blur-md rounded-lg px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: `${stats.recipes}`, label: '配方', en: 'Recipes' },
              { num: `${stats.ingredients}`, label: '材料', en: 'Ingredients' },
              { num: '5', label: '學習等級', en: 'Levels' },
              { num: '15', label: '風味維度', en: 'Dimensions' },
            ].map((s) => (
              <div key={s.label}>
                <span className="font-display text-3xl md:text-4xl text-neon-amber text-neon-glow-amber">
                  {s.num}
                </span>
                <p className="text-text-secondary text-sm mt-1">{s.label}</p>
                <p className="font-mono text-[10px] text-charcoal-500 tracking-widest uppercase">{s.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Access Feature Grid ────────────────────────── */}
      <ScrollReveal>
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-3">
              Core Features
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-text-warm">
              核心功能
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <a
                key={f.href}
                href={f.href}
                className={`glass-card p-8 transition-all duration-300 group hover:scale-[1.02] ${ACCENT_CLASSES[f.accent]}`}
              >
                <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl text-neon-amber mb-3">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ── Cocktail of the Day ──────────────────────────────── */}
      <ScrollReveal>
        <CocktailOfTheDay />
      </ScrollReveal>

      {/* ── Seasonal Recommendations ─────────────────────────── */}
      <ScrollReveal>
        <SeasonalRecommendations />
      </ScrollReveal>

      {/* ── Recommendations ──────────────────────────────────── */}
      <ScrollReveal>
        <PersonalRecommendations />
        <HomeRecommendations />
      </ScrollReveal>

      {/* ── Explore More ─────────────────────────────────────── */}
      <ScrollReveal>
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-3">
              Discover
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-text-warm">
              探索更多
            </h2>
          </div>

          {/* Horizontal scroll on mobile, wrapping grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-x-visible scrollbar-thin">
            {EXPLORE_ITEMS.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="glass-card flex-shrink-0 w-56 md:w-auto p-5 hover:border-neon-amber/50 transition-all duration-300 group hover:scale-[1.02]"
              >
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="font-display text-base text-text-warm mb-1 group-hover:text-neon-amber transition-colors">
                  {item.title}
                </h3>
                <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-charcoal-700 bg-bg-secondary/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Top: Logo + Tagline */}
          <div className="text-center mb-12">
            <p className="text-3xl mb-3">🍹</p>
            <h2 className="font-display text-2xl text-neon-amber text-neon-glow-amber tracking-wider mb-2">
              MixMaster
            </h2>
            <p className="text-text-muted text-sm italic">
              「從認識一瓶酒，到掌握一杯酒的藝術」
            </p>
          </div>

          {/* Middle: Nav Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Column 1 */}
            <div>
              <h3 className="font-mono text-[10px] text-neon-amber tracking-[0.25em] uppercase mb-4">
                核心功能
              </h3>
              <ul className="space-y-2.5">
                {[
                  { href: '/engine', icon: '🧪', label: '智慧配方引擎' },
                  { href: '/recipes', icon: '📚', label: '配方庫' },
                  { href: '/my-bar', icon: '🍸', label: '我的酒櫃' },
                  { href: '/favorites', icon: '⭐', label: '我的收藏' },
                ].map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="text-text-muted text-sm hover:text-neon-amber transition-colors duration-200">
                      <span className="mr-1.5 text-xs">{l.icon}</span>{l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-mono text-[10px] text-neon-cyan tracking-[0.25em] uppercase mb-4">
                調酒工具
              </h3>
              <ul className="space-y-2.5">
                {[
                  { href: '/tools/abv', icon: '📐', label: 'ABV 計算器' },
                  { href: '/tools/cost', icon: '💰', label: '成本計算器' },
                  { href: '/tools/convert', icon: '🌡️', label: '單位換算器' },
                  { href: '/batch', icon: '🧮', label: '批次換算' },
                  { href: '/compare', icon: '📊', label: '配方比較器' },
                ].map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="text-text-muted text-sm hover:text-neon-cyan transition-colors duration-200">
                      <span className="mr-1.5 text-xs">{l.icon}</span>{l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-mono text-[10px] text-neon-purple tracking-[0.25em] uppercase mb-4">
                調酒學院
              </h3>
              <ul className="space-y-2.5">
                {[
                  { href: '/academy/wine', icon: '🍷', label: '葡萄酒百科' },
                  { href: '/academy/spirits', icon: '🥃', label: '烈酒百科' },
                  { href: '/academy/techniques', icon: '📐', label: '技法圖解' },
                  { href: '/quiz', icon: '❓', label: '知識測驗' },
                  { href: '/academy', icon: '🎓', label: '更多課程' },
                ].map(l => (
                  <li key={l.href}>
                    <a href={l.href} className="text-text-muted text-sm hover:text-neon-purple transition-colors duration-200">
                      <span className="mr-1.5 text-xs">{l.icon}</span>{l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-mono text-[10px] text-charcoal-400 tracking-[0.25em] uppercase mb-4">
                開發者
              </h4>
              <ul className="space-y-2.5">
                {[
                  { href: '/docs', icon: '📖', label: 'API 文件', external: true },
                  { href: '/health', icon: '💚', label: '服務狀態' },
                ].map(l => (
                  <li key={l.href}>
                    <a href={l.href}
                       {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                       className="text-text-muted text-sm hover:text-charcoal-300 transition-colors duration-200">
                      <span className="mr-1.5 text-xs">{l.icon}</span>{l.label}
                      {l.external && <span className="text-[10px] ml-1">↗</span>}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Stats */}
              <div className="mt-6 p-3 rounded bg-bg-tertiary/50 border border-charcoal-700/50">
                <p className="font-mono text-[10px] text-charcoal-500 tracking-widest uppercase mb-2">平台數據</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="font-mono text-lg text-neon-amber">{stats.recipes}</p>
                    <p className="text-[10px] text-charcoal-500">配方</p>
                  </div>
                  <div>
                    <p className="font-mono text-lg text-neon-cyan">{stats.ingredients}</p>
                    <p className="text-[10px] text-charcoal-500">材料</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-charcoal-700 to-transparent" />
            <span className="text-charcoal-600 text-xs">✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-charcoal-700 to-transparent" />
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[11px] text-charcoal-500 tracking-wider">
              © 2026 MixMaster · AI-Powered Cocktail Intelligence
            </p>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-charcoal-600 tracking-wider">
                Next.js 14 + FastAPI + Tailwind CSS
              </span>
              <span className="text-charcoal-700">|</span>
              <span className="font-mono text-[10px] text-charcoal-600 tracking-widest uppercase">
                v1.0.0-alpha · Phase 1.5
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
