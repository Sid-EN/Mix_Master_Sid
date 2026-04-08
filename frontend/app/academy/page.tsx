import Link from 'next/link'

const modules = [
  {
    icon: '🛠️',
    title: '器材與手法',
    sub: 'Tools & Techniques',
    href: '/academy/tools',
    desc: 'Boston Shaker、Jigger、四大調製手法、裝飾美學——掌握吧台的核心裝備與手法。',
    count: 12,
  },
  {
    icon: '🍷',
    title: '葡萄酒百科',
    sub: 'Wine Encyclopedia',
    href: '/academy/wine',
    desc: '法國、義大利、西班牙到新世界，產地風土、釀造製程與品評技術全解析。',
    count: 9,
  },
  {
    icon: '🥃',
    title: '烈酒百科',
    sub: 'Spirits Encyclopedia',
    href: '/academy/spirits',
    desc: '威士忌 · 龍舌蘭 · 琴酒 · 蘭姆酒 · 白蘭地 · 伏特加——六大基酒深度探索。',
    count: 14,
  },
  {
    icon: '🍶',
    title: '清酒與梅酒百科',
    sub: 'Sake & Umeshu',
    href: '/academy/sake',
    desc: '並行複發酵的奧秘、精米步合與等級分類、溫度帶品飲法、梅酒釀製與調酒應用。',
    count: 10,
  },
  {
    icon: '⚗️',
    title: '蒸餾與木桶科學',
    sub: 'Distillation & Barrel',
    href: '/academy/distillation',
    desc: '壺式與柱式蒸餾器、三段切割原理、橡木桶風味化學、索雷拉與過桶陳年。',
    count: 12,
  },
  {
    icon: '👃',
    title: '品鑑藝術',
    sub: 'Art of Tasting',
    href: '/academy/tasting',
    desc: 'WSET SAT 品評法、盲品技巧、風味輪圖解——建立系統化的感官語言。',
    count: 8,
  },
  {
    icon: '🍽️',
    title: '侍酒與服務',
    sub: 'Sommelier & Service',
    href: '/academy/sommelier',
    desc: '開瓶技巧、醒酒時機、餐酒搭配原則、杯型選擇、WSET/CMS 認證路徑。',
    count: 11,
  },
  {
    icon: '🏛️',
    title: '保存與儲藏',
    sub: 'Preservation & Storage',
    href: '/academy/storage',
    desc: '溫度、濕度、光線控制、開瓶後保存倒計時、各品類陳年潛力與適飲窗口。',
    count: 9,
  },
  {
    icon: '📐',
    title: '調酒技法圖解',
    sub: 'Technique Tutorials',
    href: '/academy/techniques',
    desc: '搖盪、攪拌、直調到煙燻與澄清——十大技法步驟拆解，附專家提示與常見錯誤警示。',
    count: 10,
  },
  {
    icon: '🎓',
    title: '階梯式課程',
    sub: 'Progressive Curriculum',
    href: '/academy/curriculum',
    desc: 'Lv.1 Novice → Lv.5 Master，系統化五階段學習路徑與實作專題。',
    count: 5,
  },
]

const levels = [
  {
    lv: 1,
    name: '入門調酒師',
    en: 'Novice',
    weeks: '1–2 週',
    skills: ['冰塊科學', '量酒精確度', '第一杯 G&T'],
    unlock: '無需條件，立即開始',
  },
  {
    lv: 2,
    name: '見習學員',
    en: 'Apprentice',
    weeks: '3–4 週',
    skills: ['酸甜平衡', 'Sour 家族', 'Daiquiri 完美複刻'],
    unlock: '完成 Lv.1 所有課程',
  },
  {
    lv: 3,
    name: '熟練調酒師',
    en: 'Journeyman',
    weeks: '5–8 週',
    skills: ['攪拌法修煉', 'Vermouth 世界', 'Negroni 三位一體'],
    unlock: '通過 Lv.2 風味測驗',
  },
  {
    lv: 4,
    name: '創意設計師',
    en: 'Creator',
    weeks: '2–3 個月',
    skills: ['風味輪解構', '材料替代法', 'Signature Cocktail'],
    unlock: '提交 Lv.3 實作報告',
  },
  {
    lv: 5,
    name: '大師工匠',
    en: 'Master',
    weeks: '3–6 個月',
    skills: ['自製浸漬酒', '泡沫與煙燻', '完整酒單設計'],
    unlock: '完成創意提案審核',
  },
]

const benefits = [
  {
    icon: '🔬',
    title: '科學化調酒',
    en: 'Scientific Mixing',
    desc: '掌握溫度、稀釋率與乳化原理，讓每一杯都有數據可循、風味可控。',
  },
  {
    icon: '🎨',
    title: '風味自由',
    en: 'Flavor Freedom',
    desc: '理解風味輪、酸甜苦辣鹹的交互作用，創造屬於你的獨特配方。',
  },
  {
    icon: '🏆',
    title: '職人之路',
    en: 'Craftsman\'s Path',
    desc: '從業餘愛好到職業水準，建構完整的調酒知識體系與實作能力。',
  },
]

export default function AcademyPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-16 max-w-6xl mx-auto text-center">
        <a
          href="/"
          className="absolute left-6 top-6 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回首頁
        </a>

        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-4 animate-fade-in">
          Mixology Academy
        </p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-gradient-amber leading-tight mb-4 animate-fade-in">
          調酒學院
        </h1>
        <p className="font-display text-xl md:text-2xl text-text-warm mb-3 animate-fade-in">
          Mixology Academy
        </p>
        <p className="text-text-secondary max-w-2xl mx-auto text-base md:text-lg animate-fade-in">
          系統化的調酒知識體系——從認識你的第一支搖酒器，到設計一整份酒單。
          <br />
          <span className="text-text-muted text-sm">
            從新手到大師工匠的完整學習路徑，每一步都有科學支撐。
          </span>
        </p>

        <div className="mt-8 flex justify-center gap-4 animate-fade-in">
          <Link href="/academy/curriculum" className="btn-neon-amber">
            開始學習
          </Link>
          <Link href="/academy/tools" className="btn-neon-cyan">
            瀏覽器材
          </Link>
        </div>
      </section>

      {/* ── Module Grid 2×2 ──────────────────────────── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="divider-amber mb-10" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-8">
          知識模組 <span className="font-mono text-sm text-charcoal-500 ml-3">Modules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="glass-card p-8 group hover:border-neon-amber transition-all duration-300 block"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {m.icon}
                </span>
                <span className="font-mono text-xs text-charcoal-500 border border-charcoal-700 px-2.5 py-1 rounded-sm">
                  {m.count} 篇
                </span>
              </div>
              <h3 className="font-display text-2xl text-text-warm mb-1 group-hover:text-neon-amber transition-colors">
                {m.title}
              </h3>
              <p className="font-mono text-xs text-neon-amber mb-4 tracking-wider">{m.sub}</p>
              <p className="text-text-secondary text-sm leading-relaxed">{m.desc}</p>
              <div className="mt-5 font-mono text-xs text-charcoal-500 group-hover:text-neon-amber transition-colors">
                探索 →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Learning Path Timeline ───────────────────── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="divider-amber mb-10" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-3">
          學習路徑 <span className="font-mono text-sm text-charcoal-500 ml-3">Learning Path</span>
        </h2>
        <p className="text-text-secondary text-sm mb-10">
          五個階段，從零基礎到專業職人，按部就班打造你的調酒能力。
        </p>

        <div className="relative pl-8 md:pl-12">
          {/* Vertical connecting line */}
          <div className="absolute left-3 md:left-5 top-0 bottom-0 w-px bg-charcoal-700" />

          <div className="space-y-8">
            {levels.map((l, i) => (
              <div key={l.lv} className="relative animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                {/* Timeline dot */}
                <div className="absolute -left-8 md:-left-12 top-4 w-6 h-6 md:w-10 md:h-10 border-2 border-neon-amber bg-bg-primary flex items-center justify-center z-10">
                  <span className="font-mono text-neon-amber text-[10px] md:text-xs font-bold">
                    {l.lv}
                  </span>
                </div>

                <div className="glass-card p-6 md:p-8 ml-2">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="border border-neon-amber px-3 py-1">
                      <span className="font-mono text-neon-amber font-bold text-sm">Lv.{l.lv}</span>
                    </div>
                    <h3 className="font-display text-xl text-text-warm">{l.name}</h3>
                    <span className="font-mono text-xs text-charcoal-500">{l.en}</span>
                    <span className="font-mono text-xs text-text-muted ml-auto">{l.weeks}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {l.skills.map((s) => (
                      <span
                        key={s}
                        className="font-mono text-xs bg-bg-tertiary border border-charcoal-700 text-text-secondary px-2.5 py-1 rounded-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <p className="text-text-muted text-xs font-mono">
                    🔓 解鎖條件：{l.unlock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Learn Section ────────────────────────── */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="divider-amber mb-10" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-3">
          為什麼學調酒？ <span className="font-mono text-sm text-charcoal-500 ml-3">Why Learn</span>
        </h2>
        <p className="text-text-secondary text-sm mb-10">
          這不只是搖酒，是一門融合科學、藝術與文化的技藝。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="glass-card p-8 text-center hover:border-neon-amber transition-colors duration-300"
            >
              <span className="text-4xl mb-4 block">{b.icon}</span>
              <h3 className="font-display text-xl text-text-warm mb-1">{b.title}</h3>
              <p className="font-mono text-xs text-neon-amber mb-4 tracking-wider">{b.en}</p>
              <p className="text-text-secondary text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
