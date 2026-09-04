import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverUrl } from '../../../lib/api'
import RecipeCommunity from '../../../components/RecipeCommunity'

/** 公開分享頁：憑不可猜測的權杖檢視，無需登入。撤銷後即回 404。 */
async function getShared(token: string) {
  try {
    const res = await fetch(serverUrl(`/api/v1/recipes/shared/${token}`), { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function SharedRecipePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const r = await getShared(token)
  if (!r) notFound()

  const ingredients = r.ingredients ?? []
  const steps = r.steps ?? []

  return (
    <main className="min-h-screen px-4 md:px-8 py-12 max-w-3xl mx-auto">
      <p className="font-mono text-[10px] text-charcoal-600 tracking-widest mb-6">
        SHARED RECIPE · 由使用者分享
      </p>

      <h1 className="font-display text-4xl md:text-5xl text-text-warm mb-1">{r.nameZh}</h1>
      {r.nameEn && <p className="text-text-muted mb-6">{r.nameEn}</p>}

      <div className="flex flex-wrap gap-3 mb-8 font-mono text-xs text-text-muted">
        <span className="px-2 py-1 border border-charcoal-700 rounded-sm">{r.method}</span>
        <span className="px-2 py-1 border border-charcoal-700 rounded-sm">{r.glassType}</span>
        {typeof r.balanceScore === 'number' && (
          <span className="px-2 py-1 border border-neon-amber/50 text-neon-amber rounded-sm">
            {r.grade} {r.balanceScore}
          </span>
        )}
      </div>

      {r.descriptionZh && (
        <section className="glass-card p-6 mb-8">
          <p className="text-text-secondary leading-relaxed">{r.descriptionZh}</p>
        </section>
      )}

      <section className="glass-card p-6 mb-8">
        <h2 className="font-display text-xl text-neon-amber mb-4">🧪 材料</h2>
        <ul className="space-y-2">
          {ingredients.map((ing: any, i: number) => (
            <li key={i} className="flex justify-between border-b border-charcoal-800 pb-2">
              <span className="text-text-warm text-sm">{ing.nameZh || ing.name || ing.slug}</span>
              <span className="font-mono text-xs text-text-muted">{ing.amount} {ing.unit}</span>
            </li>
          ))}
        </ul>
      </section>

      {steps.length > 0 && (
        <section className="glass-card p-6 mb-8">
          <h2 className="font-display text-xl text-neon-amber mb-4">📋 步驟</h2>
          <ol className="space-y-3 list-decimal list-inside text-text-secondary text-sm">
            {steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      )}

      {r.garnish && (
        <p className="font-mono text-xs text-text-muted mb-8">🍋 裝飾：{r.garnish}</p>
      )}

      <RecipeCommunity shareToken={token} />

      <Link href="/recipes" className="font-mono text-xs text-neon-amber hover:underline">
        瀏覽 MixMaster 配方庫 →
      </Link>
      <div className="h-16" />
    </main>
  )
}
