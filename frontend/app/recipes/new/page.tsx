'use client'

import StaticModeNotice from '@/components/StaticModeNotice'
import { IS_STATIC } from '@/lib/staticMode'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { clientUrl } from '@/lib/api'
import { useAuth } from '@/components/AuthContext'
import { userMessage } from '@/lib/errorMessage'

interface Ingredient {
  id: string
  name: string
  nameZh: string
  category: string
}

interface Row {
  slug: string
  amount: string
  unit: string
}

const METHODS = [
  { id: 'build', label: '直調法 Build' },
  { id: 'shake', label: '搖盪法 Shake' },
  { id: 'stir', label: '攪拌法 Stir' },
  { id: 'blend', label: '攪打法 Blend' },
  { id: 'throw', label: '拋接法 Throw' },
]

const GLASSES = ['rocks_glass', 'highball', 'coupe', 'martini_glass', 'wine_glass', 'shot_glass']
const UNITS = ['oz', 'ml', 'dash', 'tsp', 'bsp']

const emptyRow = (): Row => ({ slug: '', amount: '', unit: 'oz' })

function NewRecipePageInner() {

  const router = useRouter()
  const { token, ready } = useAuth()
  const [catalog, setCatalog] = useState<Ingredient[]>([])
  const [nameZh, setNameZh] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [method, setMethod] = useState('build')
  const [glassType, setGlassType] = useState('rocks_glass')
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()])
  const [steps, setSteps] = useState('')
  const [garnish, setGarnish] = useState('')
  const [descriptionZh, setDescriptionZh] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(clientUrl('/api/v1/ingredients?limit=500'))
      .then(r => r.json())
      .then(d => setCatalog(d.items ?? []))
      .catch(() => setError('材料清單載入失敗'))
  }, [])

  const grouped = useMemo(() => {
    const g: Record<string, Ingredient[]> = {}
    catalog.forEach(i => { (g[i.category] ??= []).push(i) })
    return g
  }, [catalog])

  const filled = rows.filter(r => r.slug && Number(r.amount) > 0)
  const canSubmit = nameZh.trim().length > 0 && filled.length > 0 && !saving

  function setRow(i: number, patch: Partial<Row>) {
    setRows(rs => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(clientUrl('/api/v1/recipes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nameZh: nameZh.trim(),
          nameEn: nameEn.trim(),
          method,
          glassType,
          ingredients: filled.map(r => ({
            slug: r.slug,
            amount: Number(r.amount),
            unit: r.unit,
          })),
          steps: steps.split('\n').map(s => s.trim()).filter(Boolean),
          garnish: garnish.trim(),
          descriptionZh: descriptionZh.trim(),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `建立失敗（${res.status}）`)
      }
      await res.json()
      router.push('/recipes/mine')
    } catch (err) {
      setError(userMessage(err, '建立失敗'))
      setSaving(false)
    }
  }

  if (ready && !token) {
    return (
      <main className="min-h-screen px-4 md:px-8 py-12 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl text-text-warm mb-4">建立我的配方</h1>
        <p className="text-text-muted text-sm mb-6">配方屬於帳號，請先登入後再建立。</p>
        <Link href="/account" className="font-mono text-xs text-neon-amber hover:underline">
          前往登入 →
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 md:px-8 py-12 max-w-3xl mx-auto">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-6"
      >
        ← 返回配方庫
      </Link>

      <h1 className="font-display text-4xl text-text-warm mb-2">建立我的配方</h1>
      <p className="text-text-muted text-sm mb-8">
        儲存後會以與經典配方相同的平衡模型自動評分
      </p>

      <form onSubmit={submit} className="space-y-8">
        <section className="glass-card p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-mono text-xs text-text-muted">中文名稱 *</span>
              <input
                value={nameZh}
                onChange={e => setNameZh(e.target.value)}
                maxLength={80}
                required
                className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm"
              />
            </label>
            <label className="block">
              <span className="font-mono text-xs text-text-muted">英文名稱</span>
              <input
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                maxLength={80}
                className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm"
              />
            </label>
            <label className="block">
              <span className="font-mono text-xs text-text-muted">調製手法</span>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm"
              >
                {METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="font-mono text-xs text-text-muted">杯型</span>
              <select
                value={glassType}
                onChange={e => setGlassType(e.target.value)}
                className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-text-warm"
              >
                {GLASSES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="font-display text-xl text-neon-amber mb-4">🧪 材料 *</h2>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  aria-label={`材料 ${i + 1}`}
                  value={row.slug}
                  onChange={e => setRow(i, { slug: e.target.value })}
                  className="flex-1 bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-sm text-text-warm"
                >
                  <option value="">— 選擇材料 —</option>
                  {Object.entries(grouped).map(([cat, items]) => (
                    <optgroup key={cat} label={cat}>
                      {items.map(it => (
                        <option key={it.id} value={it.id}>{it.nameZh || it.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <input
                  aria-label={`用量 ${i + 1}`}
                  type="number"
                  step="0.25"
                  min="0"
                  value={row.amount}
                  onChange={e => setRow(i, { amount: e.target.value })}
                  className="w-24 bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-sm text-text-warm"
                />
                <select
                  aria-label={`單位 ${i + 1}`}
                  value={row.unit}
                  onChange={e => setRow(i, { unit: e.target.value })}
                  className="w-24 bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-sm text-text-warm"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setRows(rs => rs.filter((_, j) => j !== i))}
                  disabled={rows.length <= 1}
                  aria-label={`移除材料 ${i + 1}`}
                  className="px-2 py-2 text-red-400/70 hover:text-red-400 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRows(rs => [...rs, emptyRow()])}
            className="mt-4 font-mono text-xs text-neon-cyan hover:underline"
          >
            + 新增材料
          </button>
        </section>

        <section className="glass-card p-6 space-y-4">
          <label className="block">
            <span className="font-mono text-xs text-text-muted">製作步驟（每行一步）</span>
            <textarea
              value={steps}
              onChange={e => setSteps(e.target.value)}
              rows={4}
              className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-sm text-text-warm"
            />
          </label>
          <label className="block">
            <span className="font-mono text-xs text-text-muted">裝飾</span>
            <input
              value={garnish}
              onChange={e => setGarnish(e.target.value)}
              className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-sm text-text-warm"
            />
          </label>
          <label className="block">
            <span className="font-mono text-xs text-text-muted">簡介</span>
            <textarea
              value={descriptionZh}
              onChange={e => setDescriptionZh(e.target.value)}
              rows={3}
              maxLength={500}
              className="mt-1 w-full bg-charcoal-900 border border-charcoal-700 rounded px-3 py-2 text-sm text-text-warm"
            />
          </label>
        </section>

        {error && (
          <p role="alert" className="font-mono text-sm text-red-400 border border-red-500/40 bg-red-500/10 rounded px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 font-display text-lg rounded border border-neon-amber text-neon-amber hover:bg-neon-amber/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? '儲存中…' : '儲存配方'}
        </button>
      </form>

      <div className="h-16" />
    </main>
  )
}

/**
 * 靜態版沒有後端，此功能無法運作。
 *
 * 判斷置於包裝元件而非原元件內部——在 hooks 之前提前 return 會違反
 * React 的 hooks 規則（每次渲染須以相同順序呼叫）。
 */
export default function NewRecipePage() {
  if (IS_STATIC) return <StaticModeNotice feature="建立配方" />
  return <NewRecipePageInner />
}
