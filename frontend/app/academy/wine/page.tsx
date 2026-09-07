import Link from 'next/link'
import WineTabs from './WineTabs'
import { serverUrl } from '../../../lib/api'
import AcademyTracker from '../../../components/AcademyTracker'

/* ── Types ──────────────────────────────────────────────── */
interface WineData {
  winemaking?: { titleZh?: string; titleEn?: string; introduction?: string; steps?: any[] }
  grapeVarieties?: any[] | { red?: any[]; white?: any[] }
  regions?: any[]
  barrels?: { oakTypes?: any[]; toastLevels?: any[]; barrelSizes?: any[]; agingConcepts?: any[] }
  tasting?: { steps?: any[]; commonFlaws?: any[]; servingTemperatures?: any[] }
  foodPairing?: { principles?: any[]; classicPairings?: any[] }
  vintageGuide?: any[] | { titleZh?: string; titleEn?: string; explanationZh?: string; topVintages?: any[] }
  spiritProduction?: { distillationMethods?: any[]; spiritCategories?: any[] }
  advancedWinemaking?: any[]
}

/* ── Tab definitions ─────────────────────────────────────── */
const TABS = [
  { key: 'winemaking',   zh: '釀造工藝',     en: 'Winemaking',   icon: '🍇' },
  { key: 'grapes',       zh: '葡萄品種',     en: 'Grape Varieties', icon: '🌿' },
  { key: 'regions',      zh: '產區百科',     en: 'Wine Regions',  icon: '🗺️' },
  { key: 'barrels',      zh: '橡木桶科學',   en: 'Barrel Science', icon: '🪵' },
  { key: 'tasting',      zh: '品飲指南',     en: 'Tasting Guide', icon: '🥂' },
  { key: 'pairing',      zh: '餐酒搭配',     en: 'Food Pairing',  icon: '🍽️' },
  { key: 'vintage',      zh: '年份指南',     en: 'Vintage Guide', icon: '📅' },
  { key: 'advanced',     zh: '進階釀造技法', en: 'Advanced',      icon: '⚗️' },
]

/* ── Helper: render any key/value detail item ───────────── */
function Detail({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <p className="text-text-secondary text-sm">
      <span className="text-neon-amber font-mono text-xs mr-1.5">{label}</span>
      {value}
    </p>
  )
}

/* ── Section renderers ──────────────────────────────────── */

function WinemakingSection({ data }: { data: WineData['winemaking'] }) {
  if (!data) return <Empty />
  const intro = data.introduction || data.titleZh || ''
  return (
    <div className="space-y-8">
      {intro && (
        <div className="glass-card p-6">
          <p className="text-text-secondary leading-relaxed whitespace-pre-line">{intro}</p>
        </div>
      )}
      {data.steps && data.steps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.steps.map((step: any, i: number) => (
            <div key={i} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-amber/10 border border-neon-amber/30 flex items-center justify-center font-mono text-neon-amber text-sm font-bold">
                  {step.order ?? i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-warm font-medium mb-1">
                    {step.nameZh ?? step.name ?? step.title ?? `步驟 ${i + 1}`}
                    {step.nameEn && <span className="font-mono text-xs text-charcoal-500 ml-2">{step.nameEn}</span>}
                  </h3>
                  {(step.descriptionZh || step.description) && (
                    <p className="text-text-secondary text-sm leading-relaxed">{step.descriptionZh ?? step.description}</p>
                  )}
                  {step.keyFactors && Array.isArray(step.keyFactors) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {step.keyFactors.map((kf: string, ki: number) => (
                        <span key={ki} className="px-2 py-0.5 text-xs font-mono rounded-sm bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">{kf}</span>
                      ))}
                    </div>
                  )}
                  {step.proTip && (
                    <p className="text-neon-amber/80 text-xs mt-2 italic">💡 {step.proTip}</p>
                  )}
                  {step.details && (
                    <p className="text-text-muted text-xs mt-2 leading-relaxed">{step.details}</p>
                  )}
                  {step.temperature && <Detail label="溫度" value={step.temperature} />}
                  {step.duration && <Detail label="時間" value={step.duration} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GrapeVarietiesSection({ data }: { data: WineData['grapeVarieties'] }) {
  if (!data) return <Empty />

  // Handle both formats: { red: [], white: [] } or flat array with .color
  let redGrapes: any[] = []
  let whiteGrapes: any[] = []
  if (Array.isArray(data)) {
    redGrapes = data.filter((g: any) => g.color === 'red')
    whiteGrapes = data.filter((g: any) => g.color === 'white')
  } else {
    redGrapes = data.red ?? []
    whiteGrapes = data.white ?? []
  }

  const renderVarieties = (varieties: any[], color: string, label: string, labelEn: string) => (
    <div>
      <h2 className="font-display text-xl text-text-warm mb-4">
        {label} <span className="font-mono text-xs text-charcoal-500">{labelEn} ({varieties.length})</span>
      </h2>
      <div className="space-y-4">
        {varieties.map((v: any, i: number) => (
          <div key={i} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${color === 'red' ? 'bg-red-500' : 'bg-yellow-300'}`} />
              <h3 className="text-text-warm font-medium">
                {v.nameZh ?? v.name}
                {v.nameEn && <span className="font-mono text-xs text-charcoal-500 ml-2">{v.nameEn}</span>}
              </h3>
            </div>
            {(v.descriptionZh || v.description) && <p className="text-text-secondary text-sm leading-relaxed mb-2">{v.descriptionZh ?? v.description}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {v.origin && <Detail label="產地" value={v.origin} />}
              {v.characteristics && typeof v.characteristics === 'object' && !Array.isArray(v.characteristics) && (
                <>
                  {v.characteristics.aroma && <Detail label="香氣" value={v.characteristics.aroma} />}
                  {v.characteristics.palate && <Detail label="口感" value={v.characteristics.palate} />}
                  {v.characteristics.body && <Detail label="酒體" value={v.characteristics.body} />}
                  {v.characteristics.tannin && <Detail label="單寧" value={v.characteristics.tannin} />}
                  {v.characteristics.acidity && <Detail label="酸度" value={v.characteristics.acidity} />}
                </>
              )}
              {typeof v.characteristics === 'string' && <Detail label="特色" value={v.characteristics} />}
              {v.agingPotential && <Detail label="陳年潛力" value={v.agingPotential} />}
              {v.flavor && <Detail label="風味" value={v.flavor} />}
              {v.aroma && <Detail label="香氣" value={v.aroma} />}
              {v.body && <Detail label="酒體" value={v.body} />}
              {v.pairing && <Detail label="搭配" value={v.pairing} />}
            </div>
            {(v.keyRegions || v.regions) && Array.isArray(v.keyRegions || v.regions) && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(v.keyRegions || v.regions).map((r: string, ri: number) => (
                  <span key={ri} className="px-2 py-0.5 text-xs font-mono rounded-sm bg-charcoal-700/50 text-text-muted">
                    {r}
                  </span>
                ))}
              </div>
            )}
            {v.foodPairings && Array.isArray(v.foodPairings) && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-neon-amber font-mono text-[10px] mr-1">🍽️</span>
                {v.foodPairings.map((fp: string, fi: number) => (
                  <span key={fi} className="px-2 py-0.5 text-xs font-mono rounded-sm bg-neon-amber/10 text-neon-amber/80">
                    {fp}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {redGrapes.length > 0 && renderVarieties(redGrapes, 'red', '紅葡萄品種', 'Red Varieties')}
      {whiteGrapes.length > 0 && renderVarieties(whiteGrapes, 'white', '白葡萄品種', 'White Varieties')}
    </div>
  )
}

function RegionsSection({ data }: { data: WineData['regions'] }) {
  if (!data || data.length === 0) return <Empty />
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {data.map((region: any, i: number) => (
        <div key={i} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
          <h3 className="font-display text-lg text-text-warm mb-1">
            {region.nameZh ?? region.name}
            <span className="font-mono text-xs text-charcoal-500 ml-2">
              {region.nameEn ?? ''}{region.country ? ` · ${region.country}` : ''}
            </span>
          </h3>
          {region.climate && (
            <p className="text-neon-cyan text-xs font-mono mb-2">🌡 {region.climate}</p>
          )}
          {(region.descriptionZh || region.description) && (
            <p className="text-text-secondary text-sm leading-relaxed mb-3">{region.descriptionZh ?? region.description}</p>
          )}
          <div className="space-y-1">
            {(region.keyGrapes || region.grapes) && <Detail label="葡萄" value={Array.isArray(region.keyGrapes || region.grapes) ? (region.keyGrapes || region.grapes).join('、') : (region.keyGrapes || region.grapes)} />}
            {region.soil && <Detail label="土壤" value={region.soil} />}
            {region.classification && <Detail label="分級" value={region.classification} />}
            {region.style && <Detail label="風格" value={region.style} />}
            {region.area && <Detail label="面積" value={region.area} />}
          </div>
          {region.famousProducers && Array.isArray(region.famousProducers) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-neon-purple font-mono text-[10px] mr-1">🏰 名莊</span>
              {region.famousProducers.map((p: string, pi: number) => (
                <span key={pi} className="px-2 py-0.5 text-xs font-mono rounded-sm bg-neon-purple/10 text-neon-purple/80">
                  {p}
                </span>
              ))}
            </div>
          )}
          {region.subRegions && Array.isArray(region.subRegions) && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-charcoal-700">
              {region.subRegions.map((sr: any, si: number) => (
                <span key={si} className="px-2 py-0.5 text-xs font-mono rounded-sm bg-neon-amber/10 text-neon-amber/80">
                  {typeof sr === 'string' ? sr : sr.nameZh ?? sr.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function BarrelsSection({ data }: { data: WineData['barrels'] }) {
  if (!data) return <Empty />
  return (
    <div className="space-y-8">
      {/* Oak Types */}
      {data.oakTypes && data.oakTypes.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            橡木種類 <span className="font-mono text-xs text-charcoal-500">Oak Types ({data.oakTypes.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.oakTypes.map((oak: any, i: number) => (
              <div key={i} className="glass-card p-5 hover:border-neon-purple transition-colors duration-300">
                <h3 className="text-text-warm font-medium mb-1">
                  {oak.nameZh ?? oak.name}
                  {oak.nameEn && <span className="font-mono text-[10px] text-charcoal-500 block mt-0.5">{oak.nameEn}</span>}
                </h3>
                {(oak.descriptionZh || oak.description) && <p className="text-text-secondary text-sm leading-relaxed mt-2">{oak.descriptionZh ?? oak.description}</p>}
                {oak.origin && <Detail label="產地" value={oak.origin} />}
                {oak.grainType && <Detail label="紋理" value={oak.grainType} />}
                {oak.grain && <Detail label="紋理" value={oak.grain} />}
                {oak.flavorContributionZh && <Detail label="風味" value={oak.flavorContributionZh} />}
                {oak.flavor && <Detail label="風味" value={oak.flavor} />}
                {oak.commonUse && <Detail label="常見用途" value={oak.commonUse} />}
                {oak.priceRange && <Detail label="價位" value={oak.priceRange} />}
                {oak.characteristics && <Detail label="特性" value={oak.characteristics} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Levels */}
      {data.toastLevels && data.toastLevels.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            烘烤程度 <span className="font-mono text-xs text-charcoal-500">Toast Levels</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.toastLevels.map((toast: any, i: number) => (
              <div key={i} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
                <h3 className="text-text-warm font-medium mb-1">
                  {toast.levelZh ?? toast.nameZh ?? toast.name ?? toast.level}
                  {toast.level && <span className="font-mono text-xs text-charcoal-500 ml-2">{toast.level}</span>}
                </h3>
                {(toast.descriptionZh || toast.description) && <p className="text-text-secondary text-sm leading-relaxed">{toast.descriptionZh ?? toast.description}</p>}
                {toast.flavorZh && <Detail label="風味" value={toast.flavorZh} />}
                {toast.temperature && <Detail label="溫度" value={toast.temperature} />}
                {toast.flavor && !toast.flavorZh && <Detail label="風味" value={toast.flavor} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barrel Sizes */}
      {data.barrelSizes && data.barrelSizes.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            桶型尺寸 <span className="font-mono text-xs text-charcoal-500">Barrel Sizes</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.barrelSizes.map((barrel: any, i: number) => (
              <div key={i} className="glass-card p-5 hover:border-neon-cyan transition-colors duration-300">
                <h3 className="text-text-warm font-medium mb-1">
                  {barrel.nameZh ?? barrel.name}
                  {barrel.nameEn && <span className="font-mono text-xs text-charcoal-500 ml-2">{barrel.nameEn}</span>}
                </h3>
                {barrel.liters && <Detail label="容量" value={`${barrel.liters} L`} />}
                {barrel.capacity && <Detail label="容量" value={barrel.capacity} />}
                {(barrel.descriptionZh || barrel.description) && <p className="text-text-secondary text-sm leading-relaxed">{barrel.descriptionZh ?? barrel.description}</p>}
                {barrel.usage && <Detail label="用途" value={barrel.usage} />}
                {barrel.region && <Detail label="產區" value={barrel.region} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aging Concepts */}
      {data.agingConcepts && data.agingConcepts.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            陳年概念 <span className="font-mono text-xs text-charcoal-500">Aging Concepts</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.agingConcepts.map((concept: any, i: number) => (
              <div key={i} className="glass-card p-5 hover:border-neon-purple transition-colors duration-300">
                <h3 className="text-text-warm font-medium mb-1">
                  {concept.conceptZh ?? concept.nameZh ?? concept.name}
                  {(concept.concept || concept.nameEn) && <span className="font-mono text-xs text-charcoal-500 ml-2">{concept.concept ?? concept.nameEn}</span>}
                </h3>
                {(concept.descriptionZh || concept.description) && <p className="text-text-secondary text-sm leading-relaxed">{concept.descriptionZh ?? concept.description}</p>}
                {concept.effect && <Detail label="效果" value={concept.effect} />}
                {concept.duration && <Detail label="時間" value={concept.duration} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TastingSection({ data }: { data: WineData['tasting'] }) {
  if (!data) return <Empty />
  return (
    <div className="space-y-8">
      {/* Tasting Steps */}
      {data.steps && data.steps.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            品飲步驟 <span className="font-mono text-xs text-charcoal-500">Tasting Steps</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.steps.map((step: any, i: number) => (
              <div key={i} className="glass-card p-6 hover:border-neon-cyan transition-colors duration-300">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center font-mono text-neon-cyan text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-text-warm font-medium mb-1">
                      {step.stepZh ?? step.nameZh ?? step.name ?? step.title}
                      {(step.step || step.nameEn) && <span className="font-mono text-xs text-charcoal-500 ml-2">{step.step ?? step.nameEn}</span>}
                    </h3>
                    {(step.descriptionZh || step.description) && <p className="text-text-secondary text-sm leading-relaxed">{step.descriptionZh ?? step.description}</p>}
                    {step.keyPoints && Array.isArray(step.keyPoints) && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {step.keyPoints.map((kp: string, ki: number) => (
                          <span key={ki} className="px-2 py-0.5 text-xs font-mono rounded-sm bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">{kp}</span>
                        ))}
                      </div>
                    )}
                    {step.tips && <p className="text-neon-amber/70 text-xs mt-2 font-mono">💡 {step.tips}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Flaws */}
      {data.commonFlaws && data.commonFlaws.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            常見缺陷 <span className="font-mono text-xs text-charcoal-500">Common Flaws</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.commonFlaws.map((flaw: any, i: number) => (
              <div key={i} className="glass-card p-5 border-l-2 border-l-red-500/50 hover:border-neon-amber transition-colors duration-300">
                <h3 className="text-text-warm font-medium mb-1">
                  {flaw.flawZh ?? flaw.nameZh ?? flaw.name}
                  {(flaw.flaw || flaw.nameEn) && <span className="font-mono text-xs text-charcoal-500 ml-2">{flaw.flaw ?? flaw.nameEn}</span>}
                </h3>
                {(flaw.detectionZh || flaw.description) && <p className="text-text-secondary text-sm leading-relaxed">{flaw.detectionZh ?? flaw.description}</p>}
                {flaw.cause && <Detail label="成因" value={flaw.cause} />}
                {flaw.indicator && <Detail label="表現" value={flaw.indicator} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Serving Temperatures */}
      {data.servingTemperatures && data.servingTemperatures.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            適飲溫度 <span className="font-mono text-xs text-charcoal-500">Serving Temperatures</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.servingTemperatures.map((temp: any, i: number) => (
              <div key={i} className="glass-card p-5 hover:border-neon-cyan transition-colors duration-300">
                <h3 className="text-text-warm font-medium mb-1">
                  {temp.name ?? temp.nameZh ?? temp.type ?? temp.wineType}
                </h3>
                {(temp.temperature ?? temp.range) && (
                  <p className="text-neon-cyan font-mono text-lg font-bold mt-1">
                    🌡 {temp.temperature ?? temp.range}
                  </p>
                )}
                {temp.description && <p className="text-text-secondary text-sm leading-relaxed mt-1">{temp.description}</p>}
                {temp.examples && <Detail label="範例" value={Array.isArray(temp.examples) ? temp.examples.join('、') : temp.examples} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FoodPairingSection({ data }: { data: WineData['foodPairing'] }) {
  if (!data) return <Empty />
  return (
    <div className="space-y-8">
      {/* Principles */}
      {data.principles && data.principles.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            搭配原則 <span className="font-mono text-xs text-charcoal-500">Pairing Principles</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.principles.map((p: any, i: number) => (
              <div key={i} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
                <h3 className="text-text-warm font-medium mb-1">
                  {p.principleZh ?? p.nameZh ?? p.name ?? p.title}
                  {(p.principle || p.nameEn) && <span className="font-mono text-xs text-charcoal-500 ml-2">{p.principle ?? p.nameEn}</span>}
                </h3>
                {(p.descriptionZh || p.description) && <p className="text-text-secondary text-sm leading-relaxed">{p.descriptionZh ?? p.description}</p>}
                {p.example && <Detail label="範例" value={p.example} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classic Pairings */}
      {data.classicPairings && data.classicPairings.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-text-warm mb-4">
            經典搭配 <span className="font-mono text-xs text-charcoal-500">Classic Pairings</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.classicPairings.map((pair: any, i: number) => (
              <div key={i} className="glass-card p-5 hover:border-neon-purple transition-colors duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-neon-amber">🍷</span>
                  <h3 className="text-text-warm font-medium">{pair.wineZh ?? pair.wine ?? pair.name ?? pair.nameZh}</h3>
                  {pair.wine && pair.wineZh && <span className="font-mono text-xs text-charcoal-500">{pair.wine}</span>}
                </div>
                {(pair.foodZh || pair.food) && (
                  <p className="text-neon-cyan text-sm font-mono mb-1">🍽️ {pair.foodZh ?? (Array.isArray(pair.food) ? pair.food.join('、') : pair.food)}</p>
                )}
                {pair.dish && (
                  <p className="text-neon-cyan text-sm font-mono mb-1">🍽️ {pair.dish}</p>
                )}
                {(pair.whyZh || pair.description) && <p className="text-text-secondary text-sm leading-relaxed">{pair.whyZh ?? pair.description}</p>}
                {pair.reason && <Detail label="原因" value={pair.reason} />}
                {pair.why && !pair.whyZh && <Detail label="原因" value={pair.why} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VintageGuideSection({ data }: { data: WineData['vintageGuide'] }) {
  if (!data) return <Empty />

  // Handle both formats: array of regions, or dict with topVintages
  let vintageList: any[] = []
  let explanation = ''
  if (Array.isArray(data)) {
    vintageList = data
  } else if (typeof data === 'object') {
    vintageList = data.topVintages ?? []
    explanation = data.explanationZh ?? ''
  }
  if (vintageList.length === 0) return <Empty />

  return (
    <div className="space-y-8">
      {explanation && (
        <div className="glass-card p-6">
          <p className="text-text-secondary leading-relaxed">{explanation}</p>
        </div>
      )}
      {vintageList.map((regionData: any, i: number) => (
        <div key={i} className="glass-card p-6">
          <h2 className="font-display text-xl text-text-warm mb-4">
            {regionData.regionZh ?? regionData.region ?? regionData.name ?? regionData.nameZh}
            {regionData.region && regionData.regionZh && (
              <span className="font-mono text-xs text-charcoal-500 ml-2">{regionData.region}</span>
            )}
          </h2>
          {/* Render greatYears or vintageChart */}
          {(regionData.greatYears || regionData.vintageChart) && (
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-2 min-w-max">
                {(regionData.greatYears ?? regionData.vintageChart ?? []).map((vintage: any, vi: number) => {
                  // Handle both string years and object vintages
                  if (typeof vintage === 'string' || typeof vintage === 'number') {
                    return (
                      <div key={vi} className="glass-card p-3 w-20 text-center hover:border-neon-amber transition-colors duration-300">
                        <p className="font-mono text-sm text-neon-amber font-bold">{vintage}</p>
                      </div>
                    )
                  }
                  const score = vintage.score ?? vintage.rating ?? 0
                  const scoreColor = score >= 90 ? 'text-neon-amber' : score >= 80 ? 'text-neon-cyan' : 'text-text-muted'
                  return (
                    <div key={vi} className="glass-card p-3 w-24 text-center hover:border-neon-amber transition-colors duration-300">
                      <p className="font-mono text-xs text-charcoal-500">{vintage.year ?? vintage.vintage}</p>
                      <p className={`font-mono text-lg font-bold ${scoreColor}`}>{score || '—'}</p>
                      {(vintage.note || vintage.description) && (
                        <p className="text-text-muted text-xs mt-1 truncate" title={vintage.note ?? vintage.description}>
                          {vintage.note ?? vintage.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {regionData.description && (
            <p className="text-text-secondary text-sm leading-relaxed mt-3">{regionData.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function AdvancedWinemakingSection({ data }: { data: WineData['advancedWinemaking'] }) {
  if (!data) return <Empty />

  // Handle both formats: flat array or dict with techniques
  let techniques: any[] = []
  if (Array.isArray(data)) {
    techniques = data
  } else if (typeof data === 'object' && data !== null) {
    techniques = (data as any).techniques ?? []
  }
  if (techniques.length === 0) return <Empty />

  const TECHNIQUE_ICONS: Record<string, string> = {
    'carbonic-maceration': '🫧', 'solera-system': '🏺', 'methode-champenoise': '🍾',
    'botrytis': '🍯', 'ice-wine': '❄️', 'orange-wine': '🍊',
    'biodynamic': '🌙', 'amphora': '🏺', 'sur-lie': '🧬', 'appassimento': '🍇',
  }

  // Split long text into paragraphs at sentence boundaries (。)
  function formatDescription(text: string) {
    if (!text) return null
    const sentences = text.split(/(?<=。)/).filter(s => s.trim())
    if (sentences.length <= 2) {
      return <p className="text-text-secondary text-sm leading-relaxed">{text}</p>
    }
    // Group into paragraphs of 2 sentences each
    const paragraphs: string[] = []
    for (let i = 0; i < sentences.length; i += 2) {
      paragraphs.push(sentences.slice(i, i + 2).join(''))
    }
    return (
      <div className="space-y-2.5">
        {paragraphs.map((p, pi) => (
          <p key={pi} className="text-text-secondary text-sm leading-relaxed">{p}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {techniques.map((technique: any, i: number) => {
        const icon = TECHNIQUE_ICONS[technique.id] || '⚗️'
        return (
          <div key={i} className="glass-card p-0 hover:border-neon-purple transition-colors duration-300">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-charcoal-700/50">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{icon}</span>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-text-warm">
                    {technique.nameZh ?? technique.name}
                  </h3>
                  {technique.nameEn && (
                    <p className="font-mono text-xs text-neon-purple/80 tracking-wider mt-0.5">{technique.nameEn}</p>
                  )}
                </div>
                <span className="font-mono text-[10px] text-charcoal-500 tracking-widest bg-charcoal-800/50 px-2 py-1 rounded-sm">
                  #{String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Description — formatted into paragraphs */}
              {(technique.descriptionZh || technique.description) && (
                <div className="pl-3 border-l-2 border-charcoal-700">
                  {formatDescription(technique.descriptionZh ?? technique.description)}
                </div>
              )}

              {/* Pro Tip */}
              {technique.proTip && (
                <div className="flex gap-2.5 p-3.5 rounded bg-neon-amber/5 border border-neon-amber/20">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <p className="font-mono text-[10px] text-neon-amber tracking-widest uppercase mb-1">Pro Tip</p>
                    <p className="text-text-secondary text-sm leading-relaxed">{technique.proTip}</p>
                  </div>
                </div>
              )}

              {/* Process (if present) */}
              {technique.process && (
                <div className="p-3.5 rounded bg-bg-tertiary/50">
                  <p className="font-mono text-[10px] text-neon-amber tracking-widest uppercase mb-2.5">🔄 製程 Process</p>
                  {Array.isArray(technique.process) ? (
                    <ol className="space-y-2">
                      {technique.process.map((step: any, si: number) => (
                        <li key={si} className="flex gap-2.5 items-start">
                          <span className="font-mono text-xs text-neon-amber bg-neon-amber/10 w-5 h-5 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                            {si + 1}
                          </span>
                          <span className="text-text-secondary text-sm leading-relaxed">
                            {typeof step === 'string' ? step : step.description ?? step.name}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-text-secondary text-sm leading-relaxed">{technique.process}</p>
                  )}
                </div>
              )}

              {/* Examples */}
              {technique.examples && (
                <div>
                  <p className="font-mono text-[10px] text-neon-cyan tracking-widest uppercase mb-2">🏷️ 代表酒款 Examples</p>
                  {Array.isArray(technique.examples) ? (
                    <ul className="space-y-1.5">
                      {technique.examples.map((ex: any, ei: number) => {
                        const text = typeof ex === 'string' ? ex : ex.name ?? ex.nameZh
                        return (
                          <li key={ei} className="flex items-start gap-2 text-sm">
                            <span className="text-neon-cyan/60 mt-0.5 shrink-0">▸</span>
                            <span className="text-text-secondary leading-relaxed">{text}</span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-text-secondary text-sm">{technique.examples}</p>
                  )}
                </div>
              )}

              {/* Regions (if present) */}
              {technique.regions && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="font-mono text-[10px] text-charcoal-500 mr-1 self-center">📍</span>
                  {(Array.isArray(technique.regions) ? technique.regions : [technique.regions]).map((r: any, ri: number) => (
                    <span key={ri} className="px-2 py-0.5 text-xs font-mono rounded-sm bg-charcoal-700/50 text-text-muted">
                      {typeof r === 'string' ? r : r.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Empty() {
  return (
    <div className="glass-card p-8 text-center">
      <p className="text-text-muted text-sm">此章節尚無資料。No data available for this section.</p>
    </div>
  )
}

/* ── Page (Server Component) ────────────────────────────── */
export default async function WinePage() {
  let data: WineData = {}

  try {
    const res = await fetch(serverUrl('/api/v1/knowledge/wine'), {
      cache: 'no-store',
    })
    if (res.ok) {
      data = await res.json()
    }
  } catch {
    // API unavailable — render with empty data
  }

  const panels: Record<string, React.ReactNode> = {
    winemaking: <WinemakingSection data={data.winemaking} />,
    grapes:     <GrapeVarietiesSection data={data.grapeVarieties} />,
    regions:    <RegionsSection data={data.regions} />,
    barrels:    <BarrelsSection data={data.barrels} />,
    tasting:    <TastingSection data={data.tasting} />,
    pairing:    <FoodPairingSection data={data.foodPairing} />,
    vintage:    <VintageGuideSection data={data.vintageGuide} />,
    advanced:   <AdvancedWinemakingSection data={data.advancedWinemaking} />,
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="wine" />
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
            Wine Encyclopedia
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
            葡萄酒百科
          </h1>
          <p className="text-text-secondary max-w-3xl">
            從風土到杯中——產地、釀造、品評的完整知識體系。
          </p>
        </div>
      </section>

      <div className="divider-amber mx-6 max-w-6xl lg:mx-auto mb-6" />

      {/* Tabs + Content */}
      <WineTabs tabs={TABS} panels={panels} defaultTab="winemaking" />
    </main>
  )
}
