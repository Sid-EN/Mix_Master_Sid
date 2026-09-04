import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverUrl } from '../../../lib/api'

const CATEGORY_ICON: Record<string, string> = {
  syrup: '🍯',
  infusion: '🫙',
  bitters: '💧',
  mixer: '🥤',
  garnish: '🌿',
}

const CATEGORY_COLOR: Record<string, string> = {
  syrup: '#F5A623',
  infusion: '#9B59B6',
  bitters: '#E74C3C',
  mixer: '#00FFFF',
  garnish: '#2ECC71',
}

async function getPrepRecipe(slug: string) {
  try {
    const res = await fetch(serverUrl(`/api/v1/prep/${slug}`), { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function Stars({ count }: { count: number }) {
  const n = Math.min(Math.max(Math.round(count), 0), 5)
  return (
    <span className="text-neon-amber text-lg tracking-wider">
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

function slugToDisplay(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default async function PrepDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = await getPrepRecipe(slug)
  if (!r) notFound()

  const nameZh = r.nameZh || r.name_zh || r.name || '未知備料'
  const nameEn = r.nameEn || r.name_en || ''
  const category = r.category || ''
  const difficulty = r.difficulty ?? 1
  const prepTime = r.prepTime || r.prep_time || ''
  const shelfLife = r.shelfLife || r.shelf_life || ''
  const yieldAmt = r.yield || ''
  const ingredients = r.ingredients || []
  const steps = r.steps || []
  const tips = r.tips || ''
  const usedIn = r.usedIn || r.used_in || []
  const tags = r.tags || []
  const hashtags = r.hashtags || []
  const color = CATEGORY_COLOR[category] || '#F5A623'
  const icon = CATEGORY_ICON[category] || '📦'

  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto animate-fade-in">
      {/* Back Button */}
      <Link
        href="/prep"
        className="font-mono text-xs text-charcoal-500 hover:text-neon-cyan transition-colors inline-flex items-center gap-1 mb-10 block"
      >
        ← 返回備料庫
      </Link>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start gap-6 mb-8">
        <span className="text-6xl md:text-7xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-4xl md:text-5xl text-text-warm mb-1">{nameZh}</h1>
          <p className="font-mono text-sm text-charcoal-500">{nameEn}</p>
        </div>
      </div>

      {/* ── Meta Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-charcoal-800">
        {/* Category Badge */}
        <span
          className="font-mono text-xs px-3 py-1.5 border rounded-sm tracking-wider"
          style={{ borderColor: color, color: color }}
        >
          {icon} {category}
        </span>

        {/* Prep Time */}
        {prepTime && (
          <span className="font-mono text-xs px-3 py-1.5 border border-charcoal-700 text-charcoal-500">
            ⏱ {prepTime}
          </span>
        )}

        {/* Shelf Life */}
        {shelfLife && (
          <span className="font-mono text-xs px-3 py-1.5 border border-charcoal-700 text-charcoal-500">
            📅 {shelfLife}
          </span>
        )}

        {/* Yield */}
        {yieldAmt && (
          <span className="font-mono text-xs px-3 py-1.5 border border-charcoal-700 text-charcoal-500">
            📐 {yieldAmt}
          </span>
        )}

        {/* Difficulty */}
        <span className="flex items-center gap-1.5">
          <Stars count={difficulty} />
        </span>
      </div>

      {/* ── Tags & Hashtags ──────────────────────────────────── */}
      {(tags.length > 0 || hashtags.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((t: string) => (
            <span key={t} className="font-mono text-[10px] px-2 py-0.5 border border-charcoal-700 text-charcoal-500 rounded-sm">
              {t}
            </span>
          ))}
          {hashtags.map((h: string) => (
            <span key={h} className="font-mono text-[10px] px-2 py-0.5 border border-neon-cyan/30 text-neon-cyan/70 rounded-sm">
              {h}
            </span>
          ))}
        </div>
      )}

      {/* ── Materials Section ────────────────────────────────── */}
      {ingredients.length > 0 && (
        <section className="glass-card p-8 mb-8">
          <h2 className="font-display text-xl text-neon-cyan mb-6">🧪 材料</h2>
          <div className="space-y-0">
            {ingredients.map((ing: any, i: number) => {
              const name = typeof ing === 'string' ? ing : (ing.name || ing.nameZh || ing.name_zh || '材料')
              const nameEn = typeof ing === 'string' ? '' : (ing.nameEn || ing.name_en || '')
              const amount = typeof ing === 'string' ? '' : (ing.amount ?? ing.quantity ?? '')
              const unit = typeof ing === 'string' ? '' : (ing.unit || '')
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i % 2 === 0 ? 'bg-bg-tertiary' : ''
                  }`}
                >
                  <div>
                    <span className="text-text-warm text-sm">{name}</span>
                    {nameEn && (
                      <span className="text-charcoal-500 text-xs ml-2 font-mono">{nameEn}</span>
                    )}
                  </div>
                  {(amount || unit) && (
                    <span className="font-mono text-sm text-neon-cyan">
                      {amount}{unit ? ` ${unit}` : ''}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Steps Section ────────────────────────────────────── */}
      {steps.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl text-neon-cyan mb-6">📋 製作步驟</h2>
          <div className="space-y-4">
            {steps.map((step: any, i: number) => {
              const text = typeof step === 'string' ? step : (step.text || step.description || step.step || '')
              return (
                <div key={i} className="flex gap-5">
                  <span className="font-mono text-2xl font-bold text-neon-cyan/80 text-neon-glow-cyan w-10 shrink-0 text-right">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <p className="text-text-secondary leading-relaxed pt-1">{text}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Tips Section ─────────────────────────────────────── */}
      {tips && (
        <section className="glass-card p-8 mb-8 border border-neon-purple/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">💡</span>
            <div>
              <h2 className="font-display text-lg text-neon-purple mb-3">小提醒</h2>
              <p className="text-text-secondary leading-relaxed text-sm">{tips}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Used In Section ──────────────────────────────────── */}
      {usedIn.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl text-neon-amber mb-6">🍸 使用此備料的調酒</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {usedIn.map((slug: string) => (
              <Link
                key={slug}
                href={`/recipes/${slug}`}
                className="glass-card px-5 py-4 hover:border-neon-amber transition-all duration-300 group flex items-center justify-between"
              >
                <span className="font-display text-text-warm group-hover:text-neon-amber transition-colors">
                  {slugToDisplay(slug)}
                </span>
                <span className="font-mono text-[10px] text-charcoal-600 group-hover:text-neon-amber transition-colors">
                  查看配方 →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Bottom Nav ───────────────────────────────────────── */}
      <div className="border-t border-charcoal-800 pt-8 pb-4 flex items-center justify-between">
        <Link
          href="/prep"
          className="btn-neon-cyan text-xs"
        >
          ← 返回備料庫
        </Link>
        <p className="font-mono text-[10px] text-charcoal-600 tracking-wider">
          MIXMASTER PREP DETAIL
        </p>
      </div>
    </main>
  )
}
