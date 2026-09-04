import Link from 'next/link'
import RecipeListClient from '../RecipeListClient'
import { serverUrl } from '../../../lib/api'

async function getRecipes() {
  try {
    const res = await fetch(serverUrl('/api/v1/recipes?limit=500&fields=summary'), { cache: 'no-store' })
    const data = await res.json()
    return data.items || []
  } catch {
    return []
  }
}

export default async function RecipesPage() {
  const recipes = await getRecipes()

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      {/* Back link */}
      <Link href="/" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors inline-flex items-center gap-1">
        ← 返回首頁
      </Link>

      {/* Page Header */}
      <div className="mt-8 mb-10">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">Recipe Library</p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">配方資料庫</h1>
        <p className="text-text-secondary">
          收錄 <span className="text-neon-amber font-mono">{recipes.length}</span> 款經典與創意調酒配方
        </p>
        <div className="divider-amber mt-6" />
      </div>

      {/* 建立自己的配方 */}
      <div className="mb-8">
        <Link href="/recipes/new"
          className="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs border border-neon-amber/60 text-neon-amber rounded hover:bg-neon-amber/10 transition-colors"
        >
          ＋ 建立我的配方
        </Link>
        <Link
          href="/recipes/mine"
          className="ml-3 inline-flex items-center gap-2 px-4 py-2 font-mono text-xs border border-charcoal-700 text-text-muted rounded hover:border-neon-cyan hover:text-neon-cyan transition-colors"
        >
          我的配方
        </Link>
      </div>

      {/* Client-side filterable list */}
      <RecipeListClient recipes={recipes} />

      {/* Footer */}
      <div className="mt-16 mb-4 text-center">
        <p className="font-mono text-[11px] text-charcoal-500 tracking-wider">
          MIXMASTER RECIPE DATABASE · PHASE 1
        </p>
      </div>
    </main>
  )
}
