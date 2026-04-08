import PrepListClient from './PrepListClient'
import { serverUrl } from '../../lib/api'

async function getPrepRecipes() {
  try {
    const res = await fetch(serverUrl('/api/v1/prep?limit=100'), { cache: 'no-store' })
    const data = await res.json()
    return data.items || []
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    const res = await fetch(serverUrl('/api/v1/prep/categories'), { cache: 'no-store' })
    const data = await res.json()
    return data.categories || []
  } catch {
    return []
  }
}

export default async function PrepPage() {
  const [recipes, categories] = await Promise.all([getPrepRecipes(), getCategories()])

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      {/* Back link */}
      <a
        href="/"
        className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors inline-flex items-center gap-1"
      >
        ← 返回首頁
      </a>

      {/* Page Header */}
      <div className="mt-8 mb-10">
        <p className="font-mono text-neon-cyan text-xs tracking-[0.3em] uppercase mb-3">Prep Workshop</p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">備料工坊</h1>
        <p className="text-text-secondary">
          收錄 <span className="text-neon-amber font-mono">{recipes.length}</span> 款自製備料配方
        </p>
        <div className="divider-amber mt-6" />
      </div>

      {/* Category Stats */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          {categories.map((cat: any) => (
            <div
              key={cat.category || cat.name}
              className="font-mono text-xs px-4 py-2 bg-bg-tertiary border border-charcoal-700 text-text-secondary rounded-sm flex items-center gap-2"
            >
              <span className="text-neon-amber">{cat.count ?? cat.total ?? 0}</span>
              <span className="text-charcoal-500">{cat.category || cat.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Client-side filterable list */}
      <PrepListClient recipes={recipes} />

      {/* Footer */}
      <div className="mt-16 mb-4 text-center">
        <p className="font-mono text-[11px] text-charcoal-500 tracking-wider">
          MIXMASTER PREP LIBRARY · PHASE 1
        </p>
      </div>
    </main>
  )
}
