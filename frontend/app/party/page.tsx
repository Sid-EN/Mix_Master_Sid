'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { loadRecipeData } from '@/lib/recipeData'
import { loadInventory, type Inventory } from '@/lib/inventory'
import { bottlesToBuy, planTotals, type PlanEntry, type PlanRecipe } from '@/lib/partyPlan'
import { addItems, loadList, saveList } from '@/lib/shoppingList'
import { formatMl } from '@/lib/units'

const PRESET_SERVINGS = [4, 6, 10, 20]

export default function PartyPage() {
  const [recipes, setRecipes] = useState<PlanRecipe[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [inventory, setInventory] = useState<Inventory>({})
  const [entries, setEntries] = useState<PlanEntry[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadRecipeData()
      .then(data => {
        if (cancelled) return
        setRecipes(data.recipes)
        setNames(data.ingredientNames)
      })
      .catch(() => { if (!cancelled) setError('配方資料載入失敗，請稍後再試') })
      .finally(() => { if (!cancelled) setLoading(false) })
    setInventory(loadInventory())
    return () => { cancelled = true }
  }, [])

  const plan = useMemo(
    () => planTotals(entries, recipes, names, inventory),
    [entries, recipes, names, inventory],
  )

  const setServings = useCallback((recipeId: string, servings: number) => {
    setEntries(prev => {
      const rest = prev.filter(e => e.recipeId !== recipeId)
      return servings > 0 ? [...rest, { recipeId, servings }] : rest
    })
  }, [])

  const servingsOf = (id: string) => entries.find(e => e.recipeId === id)?.servings ?? 0

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter(r =>
      `${r.nameZh ?? ''} ${r.nameEn ?? ''}`.toLowerCase().includes(q))
  }, [recipes, query])

  const chosen = useMemo(
    () => entries.map(e => recipes.find(r => r.id === e.recipeId)).filter(Boolean) as PlanRecipe[],
    [entries, recipes],
  )

  /** 只把真的還缺的材料加入購物清單，庫存足夠的不必再買 */
  const addShortfallToList = () => {
    const requests = plan.needs
      .filter(n => n.shortfallMl === null || n.shortfallMl > 0)
      .map(n => ({
        id: n.slug,
        name: n.name,
        neededMl: n.shortfallMl ?? n.neededMl,
        source: `派對規劃（${plan.totalServings} 杯）`,
      }))
    if (requests.length === 0) return
    saveList(addItems(loadList(), requests))
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <Link href="/" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors">
        ← 返回首頁
      </Link>

      <header className="mt-8 mb-8">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">Party Planner</p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">派對規劃</h1>
        <p className="text-text-secondary">
          選好要調的酒與杯數，算出材料總用量、對照酒櫃庫存的缺口與預估花費。
        </p>
        <div className="divider-amber mt-6" />
      </header>

      {loading && <p className="text-text-muted font-mono text-sm">載入配方中…</p>}
      {error && <p className="text-red-400 font-mono text-sm">{error}</p>}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-8">
          {/* 選擇配方 */}
          <section>
            <h2 className="font-display text-xl text-text-warm mb-3">1 · 選擇酒單</h2>
            <label htmlFor="party-search" className="sr-only">搜尋配方</label>
            <input
              id="party-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜尋配方…"
              className="input-neon w-full px-4 py-2.5 text-sm mb-3"
            />
            <ul className="space-y-1.5 max-h-[28rem] overflow-y-auto pr-1">
              {filtered.map(r => {
                const n = servingsOf(r.id)
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-3 p-2.5 bg-bg-tertiary border rounded-sm ${
                      n > 0 ? 'border-neon-amber/60' : 'border-charcoal-700'
                    }`}
                  >
                    <span className="flex-1 min-w-0 truncate text-sm text-text-warm">
                      {r.nameZh || r.nameEn}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setServings(r.id, Math.max(0, n - 1))}
                        disabled={n === 0}
                        className="w-7 h-7 font-mono text-sm border border-charcoal-700 rounded
                                   text-text-muted hover:border-neon-amber hover:text-neon-amber
                                   disabled:opacity-30 transition-colors"
                        aria-label={`減少 ${r.nameZh || r.nameEn} 的杯數`}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-mono text-sm text-neon-amber">{n}</span>
                      <button
                        onClick={() => setServings(r.id, n + 1)}
                        className="w-7 h-7 font-mono text-sm border border-charcoal-700 rounded
                                   text-text-muted hover:border-neon-amber hover:text-neon-amber transition-colors"
                        aria-label={`增加 ${r.nameZh || r.nameEn} 的杯數`}
                      >
                        ＋
                      </button>
                    </div>
                  </li>
                )
              })}
              {filtered.length === 0 && (
                <li className="text-text-muted font-mono text-sm py-6 text-center">找不到相符的配方</li>
              )}
            </ul>
          </section>

          {/* 結果 */}
          <section>
            <h2 className="font-display text-xl text-text-warm mb-3">2 · 採購與用量</h2>

            {chosen.length === 0 && (
              <div className="p-6 border border-dashed border-charcoal-700 rounded text-center">
                <p className="text-text-muted text-sm mb-3">先從左側選幾款酒</p>
                <div className="flex gap-2 justify-center">
                  {PRESET_SERVINGS.map(n => (
                    <button
                      key={n}
                      onClick={() => {
                        // 快速起手式：前三款各 n 杯
                        recipes.slice(0, 3).forEach(r => setServings(r.id, n))
                      }}
                      className="px-3 py-1.5 font-mono text-[11px] border border-charcoal-700 text-text-muted
                                 rounded hover:border-neon-amber hover:text-neon-amber transition-colors"
                    >
                      每款 {n} 杯
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chosen.length > 0 && (
              <>
                <div className="flex flex-wrap gap-4 mb-4 p-4 bg-bg-tertiary border border-charcoal-700 rounded-sm">
                  <div>
                    <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">總杯數</p>
                    <p className="font-display text-2xl text-neon-amber">{plan.totalServings}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">材料種類</p>
                    <p className="font-display text-2xl text-text-warm">{plan.needs.length}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">預估花費</p>
                    <p className="font-display text-2xl text-neon-cyan">
                      {plan.totalCost > 0 ? `$${Math.round(plan.totalCost)}` : '—'}
                    </p>
                  </div>
                </div>

                {plan.unpricedCount > 0 && (
                  // 把缺價格的材料當成 0 會讓花費嚴重低估，因此明白說出來
                  <p className="mb-4 font-mono text-[11px] text-charcoal-500">
                    有 {plan.unpricedCount} 項材料尚未填寫價格，未計入花費。
                    可到 <Link href="/my-bar" className="text-neon-cyan underline">我的酒櫃</Link> 補上容量與售價。
                  </p>
                )}

                <div className="overflow-x-auto border border-charcoal-700 rounded-sm">
                  <table className="w-full text-sm">
                    <caption className="sr-only">各材料的需求量、庫存與缺口</caption>
                    <thead>
                      <tr className="bg-charcoal-800/60 font-mono text-[10px] text-charcoal-400 tracking-wider">
                        <th scope="col" className="text-left px-3 py-2">材料</th>
                        <th scope="col" className="text-right px-3 py-2">需要</th>
                        <th scope="col" className="text-right px-3 py-2">庫存</th>
                        <th scope="col" className="text-right px-3 py-2">還缺</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.needs.map(n => {
                        const bottles = bottlesToBuy(n, inventory)
                        return (
                          <tr key={n.slug} className="border-t border-charcoal-800">
                            <td className="px-3 py-2 text-text-warm">
                              {n.name}
                              <span className="block font-mono text-[10px] text-charcoal-600">
                                {n.usedBy.join('、')}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-xs text-text-secondary">
                              {n.neededMl === null ? '依配方' : formatMl(n.neededMl)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-xs text-charcoal-500">
                              {n.haveMl === null ? '—' : formatMl(n.haveMl)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-xs">
                              {n.shortfallMl === null ? (
                                <span className="text-charcoal-600">未知</span>
                              ) : n.shortfallMl === 0 ? (
                                <span className="text-green-400">足夠</span>
                              ) : (
                                <span className="text-neon-amber">
                                  {formatMl(n.shortfallMl)}
                                  {bottles ? `（${bottles} 瓶）` : ''}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={addShortfallToList}
                    className="px-4 py-2 font-mono text-xs border border-neon-amber/60 text-neon-amber
                               rounded hover:bg-neon-amber/10 transition-colors"
                  >
                    {added ? '已加入清單' : '把缺的加入購物清單'}
                  </button>
                  <button
                    onClick={() => setEntries([])}
                    className="px-4 py-2 font-mono text-xs border border-charcoal-700 text-text-muted
                               rounded hover:border-red-400 hover:text-red-400 transition-colors"
                  >
                    清空酒單
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
