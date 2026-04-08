import { serverUrl } from '../lib/api'
import HomeRecommendations from '../components/HomeRecommendations'

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

export default async function HomePage() {
  const stats = await getStats()

  return (
    <main className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-neon-amber/5 rounded-full blur-3xl pointer-events-none" />

        <p className="font-mono text-neon-amber text-xs tracking-[0.35em] uppercase mb-6 opacity-60 animate-fade-in">
          ⟡ Cyberpunk Speakeasy ⟡
        </p>

        <h1 className="font-display text-7xl md:text-9xl font-bold text-gradient-amber text-neon-glow-amber animate-fade-in leading-tight">
          MixMaster
        </h1>

        <p className="font-display italic text-text-secondary text-xl md:text-2xl mt-6 animate-fade-in">
          「從認識一瓶酒，到掌握一杯酒的藝術」
        </p>
        <p className="text-text-muted text-sm mt-2 font-mono tracking-wider animate-fade-in">
          AI-Powered Cocktail Intelligence Platform
        </p>

        {/* Decorative neon dividers */}
        <div className="flex items-center gap-3 mt-10 mb-12">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-neon-amber/60" />
          <div className="h-px w-10 bg-neon-amber" />
          <span className="text-neon-amber text-2xl animate-pulse-slow">🍹</span>
          <div className="h-px w-10 bg-neon-amber" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-neon-amber/60" />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <a href="/engine" className="btn-neon-amber">
            <span className="mr-2">🧪</span>智慧配方引擎
          </a>
          <a href="/academy" className="btn-neon-cyan">
            <span className="mr-2">🎓</span>調酒學院
          </a>
          <a
            href="/recipes"
            className="border border-charcoal-600 text-text-secondary px-6 py-3 text-sm tracking-widest uppercase
                       hover:border-neon-amber hover:text-neon-amber transition-all duration-300
                       inline-flex items-center justify-center gap-2"
          >
            <span>📚</span>配方庫
          </a>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────── */}
      <section className="border-y border-charcoal-800 bg-bg-secondary/50">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: `${stats.recipes}`, label: '配方', en: 'Recipes' },
            { num: `${stats.ingredients}`, label: '材料', en: 'Ingredients' },
            { num: '5',   label: '學習等級', en: 'Levels' },
            { num: '15',  label: '風味維度', en: 'Dimensions' },
          ].map((s) => (
            <div key={s.label}>
              <span className="font-display text-4xl md:text-5xl text-neon-amber text-neon-glow-amber">
                {s.num}
              </span>
              <p className="text-text-secondary text-sm mt-1">{s.label}</p>
              <p className="font-mono text-[10px] text-charcoal-500 tracking-widest uppercase">{s.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Cards ────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-3">Core Modules</p>
          <h2 className="font-display text-3xl md:text-4xl text-text-warm">平台核心功能</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 hover:border-neon-amber transition-colors duration-300 group">
            <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">🧪</div>
            <h3 className="font-display text-xl text-neon-amber mb-3">智慧風味引擎</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              輸入手邊材料，AI 計算最佳酸甜比，動態調配 ABV，生成你的專屬簽名調酒。
            </p>
            <div className="divider-amber mb-4" />
            <p className="font-mono text-[11px] text-charcoal-500 tracking-wide">
              Sigmoid ABV · 15-dim Flavor Model
            </p>
          </div>

          <div className="glass-card p-8 hover:border-neon-amber transition-colors duration-300 group">
            <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">🎓</div>
            <h3 className="font-display text-xl text-neon-amber mb-3">調酒學院</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              器材手法、葡萄酒風土、烈酒百科。五級學習路徑，從新手到大師工匠。
            </p>
            <div className="divider-amber mb-4" />
            <p className="font-mono text-[11px] text-charcoal-500 tracking-wide">
              Lv.1 Novice → Lv.5 Master Craftsman
            </p>
          </div>

          <div className="glass-card p-8 hover:border-neon-amber transition-colors duration-300 group">
            <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300">📚</div>
            <h3 className="font-display text-xl text-neon-amber mb-3">配方資料庫</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              收錄經典 IBA 配方與 AI 引擎獨家創意配方，完整記錄風味結構與調製手法。
            </p>
            <div className="divider-amber mb-4" />
            <p className="font-mono text-[11px] text-charcoal-500 tracking-wide">
              Classic × Generated × Signature
            </p>
          </div>
        </div>
      </section>

      {/* ── Recommendations ──────────────────────────────────── */}
      <HomeRecommendations />

      {/* ── Today's Classic ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="font-mono text-xs text-neon-amber tracking-[0.3em] uppercase mb-3">Featured Cocktail</p>
          <h2 className="font-display text-3xl md:text-4xl text-text-warm">今日經典</h2>
        </div>

        <div className="glass-card border-neon-amber-glow max-w-2xl mx-auto p-8 md:p-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="text-5xl">🍸</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-3 py-1 border border-charcoal-600 text-charcoal-500 uppercase tracking-wider">
                🧊 搖盪法
              </span>
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-sm text-white"
                    style={{ backgroundColor: '#2ECC71' }}>
                A 92
              </span>
            </div>
          </div>

          <h3 className="font-display text-3xl md:text-4xl text-text-warm mb-1">經典黛乞利</h3>
          <p className="font-mono text-sm text-charcoal-500 mb-4">Classic Daiquiri</p>

          <div className="divider-amber mb-5" />

          <p className="text-text-secondary leading-relaxed mb-6">
            最簡潔有力的三元組合——白蘭姆酒、新鮮萊姆汁、糖漿。
            看似簡單的結構下，酸甜平衡的拿捏正是調酒師功力的終極試煉。
            海明威在哈瓦那小酒館 La Floridita 舉杯的傳奇，從這杯開始。
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {['白蘭姆酒', '萊姆汁', '簡易糖漿'].map((ing) => (
              <span key={ing} className="font-mono text-xs px-3 py-1 bg-bg-tertiary border border-charcoal-700 text-text-secondary">
                {ing}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-text-muted text-xs">🇨🇺 古巴 · 1900s</span>
            <a href="/recipes/classic-daiquiri"
               className="font-mono text-xs text-neon-amber hover:text-neon-cyan transition-colors tracking-wider">
              查看完整配方 →
            </a>
          </div>
        </div>
      </section>

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
              <h4 className="font-mono text-[10px] text-neon-amber tracking-[0.25em] uppercase mb-4">
                核心功能
              </h4>
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
              <h4 className="font-mono text-[10px] text-neon-cyan tracking-[0.25em] uppercase mb-4">
                調酒工具
              </h4>
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
              <h4 className="font-mono text-[10px] text-neon-purple tracking-[0.25em] uppercase mb-4">
                調酒學院
              </h4>
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
