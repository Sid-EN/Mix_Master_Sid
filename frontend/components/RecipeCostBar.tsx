'use client'

/**
 * 配方頁的成本與採購資訊
 *
 * 三件事：這杯用你的酒櫃算起來多少錢、你還能調幾杯、缺的材料一鍵加入購物清單。
 * 沒有填過任何庫存資料時只顯示加入購物清單，不硬湊出一個沒有依據的成本數字。
 */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { loadInventory, recipeCost, servingsAvailable, type Inventory } from '@/lib/inventory'
import { addItems, loadList, saveList } from '@/lib/shoppingList'
import { parseAmount, toMl } from '@/lib/units'

export interface CostBarIngredient {
  slug: string
  name: string
  amount: number | string
  unit?: string | null
}

const MY_BAR_KEY = 'mixmaster-my-bar'

function loadOwned(): string[] {
  try {
    const raw = localStorage.getItem(MY_BAR_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function RecipeCostBar({
  recipeName,
  ingredients,
}: {
  recipeName: string
  ingredients: CostBarIngredient[]
}) {
  const [inventory, setInventory] = useState<Inventory>({})
  const [owned, setOwned] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setInventory(loadInventory())
    setOwned(loadOwned())
    setHydrated(true)
  }, [])

  const cost = useMemo(() => recipeCost(ingredients, inventory), [ingredients, inventory])
  const servings = useMemo(() => servingsAvailable(ingredients, inventory), [ingredients, inventory])
  const missing = useMemo(
    () => ingredients.filter(i => !owned.includes(i.slug)),
    [ingredients, owned],
  )

  const hasCost = cost.total > 0 && cost.unknown.length < ingredients.length

  const addMissing = () => {
    const targets = missing.length > 0 ? missing : ingredients
    saveList(addItems(loadList(), targets.map(i => ({
      id: i.slug,
      name: i.name,
      neededMl: toMl(parseAmount(i.amount), i.unit),
      source: recipeName,
    }))))
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  if (!hydrated) return null

  return (
    <section className="glass-card p-6 mb-8">
      <h2 className="font-display text-lg text-neon-cyan mb-4">🧾 成本與採購</h2>

      <div className="flex flex-wrap gap-6 mb-4">
        <div>
          <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">單杯成本</p>
          <p className="font-display text-2xl text-neon-cyan">
            {hasCost ? `$${cost.total.toFixed(1)}` : '—'}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">庫存還能調</p>
          <p className="font-display text-2xl text-text-warm">
            {servings === null ? '—' : `${servings} 杯`}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">你缺的材料</p>
          <p className="font-display text-2xl text-neon-amber">{missing.length}</p>
        </div>
      </div>

      {/* 資料不足時說明原因，而不是給出一個看起來很便宜的假數字 */}
      {cost.unknown.length > 0 && (
        <p className="font-mono text-[11px] text-charcoal-500 mb-3">
          有 {cost.unknown.length} 項材料尚未填寫容量與售價，未計入成本。
          可到 <Link href="/my-bar" className="text-neon-cyan underline">我的酒櫃</Link> 補上。
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={addMissing}
          className="px-4 py-2 font-mono text-xs border border-neon-amber/60 text-neon-amber
                     rounded hover:bg-neon-amber/10 transition-colors"
        >
          {added
            ? '已加入清單'
            : missing.length > 0
              ? `把缺的 ${missing.length} 項加入購物清單`
              : '全部加入購物清單'}
        </button>
        <Link
          href="/shopping-list"
          className="px-4 py-2 font-mono text-xs border border-charcoal-700 text-text-muted
                     rounded hover:border-neon-cyan hover:text-neon-cyan transition-colors"
        >
          查看購物清單
        </Link>
      </div>
    </section>
  )
}
