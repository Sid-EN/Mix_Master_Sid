import Link from 'next/link'
import SpiritTabs from './SpiritTabs'
import { serverUrl } from '../../../lib/api'
import AcademyTracker from '../../../components/AcademyTracker'

/* ── Types (matching spirits_knowledge.json) ─────────────── */

interface Style {
  name?: string
  nameZh?: string
  description?: string
}

interface Spirit {
  id?: string
  nameEn?: string
  nameZh?: string
  origin?: string
  description?: string
  abvRange?: string
  productionProcess?: string[]
  styles?: Style[]
  classicCocktails?: string[]
  buyingGuide?: string
  funFacts?: string[]
}

interface DistillationMethod {
  name?: string
  nameZh?: string
  description?: string
  characteristics?: string[]
  usedFor?: string[]
}

interface DistillationConcept {
  term?: string
  termZh?: string
  description?: string
}

interface BarrelType {
  name?: string
  nameZh?: string
  description?: string
  flavorNotes?: string[]
}

interface AgingFactor {
  factor?: string
  factorZh?: string
  description?: string
}

interface FinishingTechnique {
  technique?: string
  techniqueZh?: string
  description?: string
}

interface CocktailFamily {
  name?: string
  nameZh?: string
  formula?: string
  ratio?: string
  description?: string
  examples?: string[]
}

interface SpiritsData {
  spirits?: Spirit[]
  distillation?: {
    methods?: DistillationMethod[]
    concepts?: DistillationConcept[]
  }
  aging?: {
    barrelTypes?: BarrelType[]
    agingFactors?: AgingFactor[]
    finishingTechniques?: FinishingTechnique[]
  }
  cocktailFamilies?: CocktailFamily[]
  spiritProduction?: any
}

/* ── Spirit icon map ────────────────────────────────────── */

const SPIRIT_ICONS: Record<string, string> = {
  whisky: '🥃',
  gin: '🫒',
  rum: '🏴‍☠️',
  'tequila-mezcal': '🌵',
  'brandy-cognac': '🍇',
  vodka: '🧊',
  absinthe: '🟢',
  cachaca: '🇧🇷',
}

/* ── Helpers ─────────────────────────────────────────────── */

function Empty({ message }: { message?: string }) {
  return (
    <div className="glass-card p-8 text-center">
      <p className="text-text-muted text-sm">
        {message ?? '此章節尚無資料。No data available for this section.'}
      </p>
    </div>
  )
}

function Tag({ children, color = 'default' }: { children: React.ReactNode; color?: string }) {
  const cls = color === 'cyan'
    ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
    : color === 'purple'
    ? 'bg-neon-purple/10 text-neon-purple border-neon-purple/20'
    : color === 'amber'
    ? 'bg-neon-amber/10 text-neon-amber border-neon-amber/20'
    : 'bg-charcoal-700/50 text-text-muted border-charcoal-700'
  return (
    <span className={`px-2.5 py-1 text-xs font-mono rounded-sm border ${cls}`}>
      {children}
    </span>
  )
}

/* ── Distillation Section ────────────────────────────────── */

function DistillationSection({ methods, concepts }: {
  methods?: DistillationMethod[]
  concepts?: DistillationConcept[]
}) {
  return (
    <div className="space-y-10">
      <div className="glass-card p-6">
        <p className="text-text-secondary leading-relaxed">
          蒸餾是將發酵液中的酒精與風味化合物分離、濃縮的過程。不同蒸餾方法會深刻影響烈酒的最終風格。
        </p>
      </div>

      {/* Methods */}
      {methods && methods.length > 0 && (
        <>
          <h2 className="font-display text-xl text-text-warm flex items-center gap-2">
            <span className="text-neon-amber">⚗️</span> 蒸餾方法
            <span className="font-mono text-xs text-charcoal-500">Distillation Methods</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {methods.map((m, i) => (
              <div key={i} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center font-mono text-neon-amber text-sm font-bold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text-warm font-display text-lg mb-1">
                      {m.nameZh ?? m.name}
                      {m.name && <span className="font-mono text-xs text-charcoal-500 ml-2">{m.name}</span>}
                    </h3>
                    {m.description && <p className="text-text-secondary text-sm leading-relaxed mb-3">{m.description}</p>}
                    {m.characteristics && m.characteristics.length > 0 && (
                      <div className="mb-3">
                        <p className="text-neon-cyan font-mono text-[10px] tracking-wider uppercase mb-1.5">特性</p>
                        <div className="flex flex-wrap gap-1.5">{m.characteristics.map((c, ci) => <Tag key={ci}>{c}</Tag>)}</div>
                      </div>
                    )}
                    {m.usedFor && m.usedFor.length > 0 && (
                      <div>
                        <p className="text-neon-purple font-mono text-[10px] tracking-wider uppercase mb-1.5">應用</p>
                        <div className="flex flex-wrap gap-1.5">{m.usedFor.map((u, ui) => <Tag key={ui} color="purple">{u}</Tag>)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Concepts */}
      {concepts && concepts.length > 0 && (
        <>
          <h2 className="font-display text-xl text-text-warm flex items-center gap-2 mt-6">
            <span className="text-neon-cyan">📖</span> 蒸餾術語
            <span className="font-mono text-xs text-charcoal-500">Key Concepts</span>
          </h2>
          <div className="space-y-4">
            {concepts.map((c, i) => (
              <div key={i} className="glass-card p-5">
                <h3 className="text-neon-amber font-mono text-sm font-bold mb-1">
                  {c.termZh} <span className="text-charcoal-500 font-normal">{c.term}</span>
                </h3>
                {c.description && <p className="text-text-secondary text-sm leading-relaxed">{c.description}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Single Spirit Detail Section ────────────────────────── */

function SpiritDetailSection({ spirit }: { spirit: Spirit }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero card */}
      <div className="glass-card p-8 border-neon-amber/20">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{SPIRIT_ICONS[spirit.id ?? ''] ?? '🍸'}</span>
          <div className="flex-1">
            <h2 className="font-display text-2xl md:text-3xl text-gradient-amber mb-2">
              {spirit.nameZh}
              {spirit.nameEn && <span className="font-mono text-sm text-charcoal-500 ml-3">{spirit.nameEn}</span>}
            </h2>
            {spirit.origin && (
              <p className="text-neon-cyan font-mono text-xs mb-2">📍 {spirit.origin}</p>
            )}
            {spirit.abvRange && (
              <p className="font-mono text-xs text-charcoal-500 mb-3">ABV: {spirit.abvRange}</p>
            )}
            {spirit.description && (
              <p className="text-text-secondary leading-relaxed">{spirit.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Production Process */}
      {spirit.productionProcess && spirit.productionProcess.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-text-warm mb-4 flex items-center gap-2">
            <span className="text-neon-amber">⚗️</span> 製程工藝
            <span className="font-mono text-xs text-charcoal-500">Production Process</span>
          </h3>
          <div className="space-y-3">
            {spirit.productionProcess.map((step, i) => (
              <div key={i} className="glass-card p-5 hover:border-neon-cyan/30 transition-colors duration-300">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center font-mono text-neon-cyan text-xs font-bold">{i + 1}</span>
                  <p className="text-text-secondary text-sm leading-relaxed pt-1">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Styles */}
      {spirit.styles && spirit.styles.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-text-warm mb-4 flex items-center gap-2">
            <span className="text-neon-purple">🏷️</span> 風格分類
            <span className="font-mono text-xs text-charcoal-500">Styles & Varieties</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spirit.styles.map((st, i) => (
              <div key={i} className="glass-card p-5 hover:border-neon-purple/30 transition-colors duration-300">
                <h4 className="text-text-warm font-medium mb-2">
                  {st.nameZh ?? st.name}
                  {st.name && <span className="font-mono text-xs text-charcoal-500 ml-2">{st.name}</span>}
                </h4>
                {st.description && <p className="text-text-secondary text-sm leading-relaxed">{st.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classic Cocktails */}
      {spirit.classicCocktails && spirit.classicCocktails.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-text-warm mb-4 flex items-center gap-2">
            <span>🍹</span> 經典調酒
            <span className="font-mono text-xs text-charcoal-500">Classic Cocktails</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {spirit.classicCocktails.map((c, i) => <Tag key={i} color="amber">{c}</Tag>)}
          </div>
        </div>
      )}

      {/* Buying Guide */}
      {spirit.buyingGuide && (
        <div className="glass-card p-6 border border-neon-cyan/20">
          <h3 className="font-display text-lg text-neon-cyan mb-3 flex items-center gap-2">
            <span>🛒</span> 選購指南
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">{spirit.buyingGuide}</p>
        </div>
      )}

      {/* Fun Facts */}
      {spirit.funFacts && spirit.funFacts.length > 0 && (
        <div className="glass-card p-6 border border-neon-purple/20">
          <h3 className="font-display text-lg text-neon-purple mb-3 flex items-center gap-2">
            <span>💡</span> 趣味冷知識
          </h3>
          <ul className="space-y-2">
            {spirit.funFacts.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                <span className="text-neon-purple shrink-0">•</span>
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ── Aging & Barrel Section ──────────────────────────────── */

function AgingSection({ aging }: { aging: SpiritsData['aging'] }) {
  if (!aging) return <Empty />
  const { barrelTypes, agingFactors, finishingTechniques } = aging
  return (
    <div className="space-y-10">
      {/* Barrel Types */}
      {barrelTypes && barrelTypes.length > 0 && (
        <>
          <h2 className="font-display text-xl text-text-warm flex items-center gap-2">
            <span>🪵</span> 橡木桶種類
            <span className="font-mono text-xs text-charcoal-500">Barrel Types</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {barrelTypes.map((b, i) => (
              <div key={i} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
                <h3 className="text-text-warm font-display text-lg mb-1">
                  {b.nameZh}
                  {b.name && <span className="font-mono text-[10px] text-charcoal-500 ml-2 block mt-0.5">{b.name}</span>}
                </h3>
                {b.description && <p className="text-text-secondary text-sm leading-relaxed mb-3">{b.description}</p>}
                {b.flavorNotes && b.flavorNotes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {b.flavorNotes.map((n, ni) => <Tag key={ni} color="amber">{n}</Tag>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Aging Factors */}
      {agingFactors && agingFactors.length > 0 && (
        <>
          <h2 className="font-display text-xl text-text-warm flex items-center gap-2 mt-4">
            <span>🌡️</span> 陳年要素
            <span className="font-mono text-xs text-charcoal-500">Aging Factors</span>
          </h2>
          <div className="space-y-4">
            {agingFactors.map((f, i) => (
              <div key={i} className="glass-card p-5">
                <h3 className="text-neon-amber font-mono text-sm font-bold mb-1">
                  {f.factorZh} <span className="text-charcoal-500 font-normal">{f.factor}</span>
                </h3>
                {f.description && <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Finishing Techniques */}
      {finishingTechniques && finishingTechniques.length > 0 && (
        <>
          <h2 className="font-display text-xl text-text-warm flex items-center gap-2 mt-4">
            <span>✨</span> 過桶技術
            <span className="font-mono text-xs text-charcoal-500">Finishing Techniques</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finishingTechniques.map((t, i) => (
              <div key={i} className="glass-card p-5 hover:border-neon-cyan/30 transition-colors">
                <h3 className="text-text-warm font-medium mb-1">
                  {t.techniqueZh}
                  {t.technique && <span className="font-mono text-xs text-charcoal-500 ml-2">{t.technique}</span>}
                </h3>
                {t.description && <p className="text-text-secondary text-sm leading-relaxed">{t.description}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Cocktail Families Section ───────────────────────────── */

function CocktailFamiliesSection({ families }: { families?: CocktailFamily[] }) {
  if (!families || families.length === 0) return <Empty />
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <p className="text-text-secondary leading-relaxed">
          經典調酒可歸納為數大家族，每個家族共享相似的結構與比例邏輯。掌握家族公式，就能無限延伸創意。
        </p>
      </div>
      {families.map((f, i) => (
        <div key={i} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-display text-xl text-text-warm">
              {f.nameZh}
              {f.name && <span className="font-mono text-xs text-charcoal-500 ml-2">{f.name}</span>}
            </h3>
          </div>
          {f.formula && (
            <p className="font-mono text-xs text-neon-amber mb-1">公式：{f.formula}</p>
          )}
          {f.ratio && (
            <p className="font-mono text-xs text-neon-cyan mb-3">比例：{f.ratio}</p>
          )}
          {f.description && <p className="text-text-secondary text-sm leading-relaxed mb-4">{f.description}</p>}
          {f.examples && f.examples.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {f.examples.map((e, ei) => <Tag key={ei} color="amber">{e}</Tag>)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Page (Server Component) ────────────────────────────── */

export default async function SpiritsPage() {
  let data: SpiritsData = {}

  try {
    const res = await fetch(serverUrl('/api/v1/knowledge/spirits'), {
      cache: 'no-store',
    })
    if (res.ok) {
      data = await res.json()
    }
  } catch {
    // API unavailable — render with empty data
  }

  const spirits = data.spirits ?? []
  const distillation = data.distillation
  const aging = data.aging
  const cocktailFamilies = data.cocktailFamilies

  /* Build tab definitions dynamically */
  const tabs = [
    { key: 'distillation', zh: '蒸餾科學', en: 'Distillation', icon: '⚗️' },
    ...spirits.map((s) => ({
      key: s.id ?? s.nameEn ?? 'unknown',
      zh: s.nameZh ?? s.nameEn ?? '未知',
      en: s.nameEn ?? '',
      icon: SPIRIT_ICONS[s.id ?? ''] ?? '🍸',
    })),
    { key: 'aging', zh: '陳年與橡木桶', en: 'Aging & Barrels', icon: '🪵' },
    { key: 'families', zh: '調酒家族', en: 'Cocktail Families', icon: '🍹' },
  ]

  /* Build panels */
  const panels: Record<string, React.ReactNode> = {
    distillation: <DistillationSection methods={distillation?.methods} concepts={distillation?.concepts} />,
    aging: <AgingSection aging={aging} />,
    families: <CocktailFamiliesSection families={cocktailFamilies} />,
  }

  for (const s of spirits) {
    const key = s.id ?? s.nameEn ?? 'unknown'
    panels[key] = <SpiritDetailSection spirit={s} />
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="spirits" />
      {/* Header */}
      <section className="px-6 pt-20 pb-8 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回學院
        </Link>
        <div className="mt-8">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            Spirit Encyclopedia
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
            烈酒百科
          </h1>
          <p className="text-text-secondary max-w-3xl">
            從穀物到杯中——{spirits.length} 大烈酒深度解析、蒸餾科學、橡木桶陳年與調酒家族公式。
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="font-mono text-xs text-neon-amber">{spirits.length} 種烈酒</span>
            <span className="text-charcoal-600">·</span>
            <span className="font-mono text-xs text-neon-cyan">{distillation?.methods?.length ?? 0} 種蒸餾法</span>
            <span className="text-charcoal-600">·</span>
            <span className="font-mono text-xs text-neon-purple">{aging?.barrelTypes?.length ?? 0} 種桶型</span>
            <span className="text-charcoal-600">·</span>
            <span className="font-mono text-xs text-text-muted">{cocktailFamilies?.length ?? 0} 大調酒家族</span>
          </div>
        </div>
      </section>

      <div className="divider-amber mx-6 max-w-6xl lg:mx-auto mb-6" />

      {/* Tabs + Content */}
      {tabs.length > 0 ? (
        <SpiritTabs tabs={tabs} panels={panels} defaultTab="distillation" />
      ) : (
        <section className="px-6 pb-24 max-w-6xl mx-auto">
          <Empty message="無法載入資料。請確認 API 伺服器是否運行中。" />
        </section>
      )}
    </main>
  )
}
