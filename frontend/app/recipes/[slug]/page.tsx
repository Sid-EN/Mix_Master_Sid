import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverUrl, fetchWithTimeout, CONTENT_TIMEOUT_MS } from '../../../lib/api'
import { IS_STATIC } from '../../../lib/staticMode'
import { getClassicRecipe, getClassicRecipes } from '../../../lib/staticData'
import RecipeActions from './RecipeActions'
import RecipeTracker from '../../../components/RecipeTracker'
import RecipeTriedButton from '../../../components/RecipeTriedButton'
import IngredientSubstitutions from '../../../components/IngredientSubstitutions'
import RecipeCostBar from '../../../components/RecipeCostBar'
import {
  LocalisedParagraph,
  LocalisedSteps,
  LocalisedTags,
} from '../../../components/LocalisedText'
import { pageMetadata, recipeJsonLd, summarise } from '../../../lib/seo'
import type { Metadata } from 'next'
import FoodPairingSection from '../../../components/FoodPairingSection'

const METHOD_ICON: Record<string, string> = { shake: '🧊', stir: '🥄', build: '🥃' }
const METHOD_ZH: Record<string, string>   = { shake: '搖盪法', stir: '攪拌法', build: '直調法' }
const METHOD_CLR: Record<string, string>   = { shake: '#00BFFF', stir: '#9B59B6', build: '#F5A623' }
const GRADE_CLR: Record<string, string>    = { A: '#2ECC71', B: '#F1C40F', C: '#E67E22', D: '#E74C3C' }

const BAR_COLORS: Record<string, string> = {
  acid:    '#FFD700',
  sweet:   '#FF69B4',
  bitter:  '#228B22',
  punch:   '#E74C3C',
  citrus:  '#FFD700',
  tropical:'#FF8C00',
  herbal:  '#228B22',
  smoky:   '#696969',
  floral:  '#DDA0DD',
}

/** 靜態匯出時預先產生全部經典配方的頁面。 */
/**
 * 一般部署時本頁必須是動態的。
 *
 * 這個路由匯出了 generateStaticParams，Next 因此預設視為靜態頁；
 * 但非靜態模式下頁面以 cache: 'no-store' 取資料，渲染時會從靜態轉為動態，
 * Next 16 對此直接回 500（Page changed from static to dynamic at runtime）。
 * 症狀只在乾淨建置時出現——本機殘留的 .next 會用舊的預產生頁面掩蓋問題。
 *
 * 靜態匯出時不能有 force-dynamic，且路由設定必須是字面字串、無法用條件式，
 * 因此改由 scripts/toggle-dynamic-routes.mjs 於匯出前後替換這一行。
 */
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  if (!IS_STATIC) return []
  return getClassicRecipes().map(r => ({ slug: r.slug ?? r.id }))
}

/**
 * 每道配方各自的標題與描述。
 *
 * 先前全站共用同一組 metadata，搜尋結果與分享預覽長得一模一樣，
 * 看不出點進去會是哪一杯酒。
 */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const r = await getRecipe(slug)
  if (!r) return pageMetadata({ title: '找不到配方', path: `/recipes/${slug}` })

  const nameZh = r.nameZh || r.name_zh || r.name || '調酒配方'
  const nameEn = r.nameEn || r.name_en || ''
  const tags: string[] = Array.isArray(r.tags) ? r.tags : []

  return pageMetadata({
    title: nameEn ? `${nameZh}（${nameEn}）` : nameZh,
    description: summarise(r.descriptionZh || r.description),
    path: `/recipes/${slug}`,
    keywords: [nameZh, nameEn, '調酒', '配方', ...tags].filter(Boolean),
    type: 'article',
  })
}

async function getRecipe(slug: string) {
  // 靜態版沒有後端；經典配方本就在 repo 內，直接讀取即可
  if (IS_STATIC) return getClassicRecipe(slug)
  try {
    const res = await fetchWithTimeout(serverUrl(`/api/v1/recipes/${slug}`), CONTENT_TIMEOUT_MS, { cache: 'no-store' })
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

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = await getRecipe(slug)
  if (!r) notFound()

  const nameZh = r.nameZh || r.name_zh || r.name || '未知配方'
  const nameEn = r.nameEn || r.name_en || ''
  const method = r.method || 'build'
  const glass = r.glass || r.glassType || r.glass_type || ''
  const difficulty = r.difficulty ?? 3
  const grade = r.grade || r.balanceGrade || ''
  const score = r.balanceScore ?? r.balance_score ?? ''
  const origin = r.origin || ''
  const story = r.story || ''
  const steps = r.steps || []
  const ingredients = r.ingredients || []
  const garnish = r.garnish || ''
  const tips = r.tips || r.proTips || r.pro_tips || ''
  const pairings = r.pairings || r.foodPairings || r.food_pairings || []
  const tags = r.tags || []
  const iba = r.iba ?? r.isIba ?? r.is_iba ?? false
  const glassImg = r.glassImage || r.glass_image || METHOD_ICON[method] || '🍹'
  const flavorProfile = r.flavorProfile || r.flavor_profile || null
  const descZh = r.descriptionZh || r.description_zh || ''
  const descEn = r.description || ''

  const primaryFlavors = flavorProfile?.primary || flavorProfile?.primaryFlavors || []
  const acid = flavorProfile?.acid ?? flavorProfile?.sour ?? null
  const sweet = flavorProfile?.sweet ?? null
  const bitter = flavorProfile?.bitter ?? null
  const punch = flavorProfile?.punch ?? flavorProfile?.boozy ?? null

  // Normalize 0-1 scale to 0-10 for display
  const toScore10 = (v: number | null) => v !== null && v !== undefined ? Math.round(v <= 1 ? v * 10 : v) : null

  const barDimensions = [
    { key: 'acid',   label: '酸度 Acid',   value: toScore10(acid) },
    { key: 'sweet',  label: '甜度 Sweet',  value: toScore10(sweet) },
    { key: 'bitter', label: '苦度 Bitter', value: toScore10(bitter) },
    { key: 'punch',  label: '酒感 Punch',  value: toScore10(punch) },
  ].filter(d => d.value !== null && d.value !== undefined)

  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto animate-fade-in">
      {/*
        schema.org 結構化資料：讓搜尋引擎知道這是一份食譜而非普通文章，
        搜尋結果才可能直接顯示材料與步驟。
      */}
      <script
        type="application/ld+json"
        // 內容由自家資料產生，非使用者輸入
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeJsonLd({
            nameZh, nameEn, slug,
            descriptionZh: r.descriptionZh,
            description: r.description,
            method: r.method,
            ingredients,
            steps: Array.isArray(r.steps) ? r.steps : [],
            garnish: r.garnish,
          })),
        }}
      />

      {/* Back Button */}
      <Link
        href="/recipes"
        className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors inline-flex items-center gap-1 mb-10 block"
      >
        ← 返回配方庫
      </Link>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start gap-6 mb-8">
        <span className="text-6xl md:text-7xl">{glassImg}</span>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-4xl md:text-5xl text-text-warm mb-1">{nameZh}</h1>
          <p className="font-mono text-sm text-charcoal-500 mb-3">{nameEn}</p>
          {origin && (
            <span className="inline-block font-mono text-xs px-3 py-1 bg-bg-tertiary border border-charcoal-700 text-text-muted">
              📍 {origin}
            </span>
          )}
        </div>
      </div>

      {/* ── XP Tracking ────────────────────────────────────────── */}
      <RecipeTracker slug={slug} />

      {/* ── Recipe Actions (Favorites, Rating, Notes) ────────── */}
      <RecipeActions slug={slug} />

      {/* ── Mark as Tried ────────────────────────────────────── */}
      <div className="mb-8">
        <RecipeTriedButton slug={slug} />
      </div>

      {/* ── Meta Bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-charcoal-800">
        {/* Method */}
        <span
          className="font-mono text-xs px-3 py-1.5 border rounded-sm tracking-wider"
          style={{ borderColor: METHOD_CLR[method], color: METHOD_CLR[method] }}
        >
          {METHOD_ICON[method]} {METHOD_ZH[method]}
        </span>

        {/* Glass type */}
        {glass && (
          <span className="font-mono text-xs px-3 py-1.5 border border-charcoal-700 text-charcoal-500">
            🥂 {glass}
          </span>
        )}

        {/* Difficulty */}
        <span className="flex items-center gap-1.5">
          <Stars count={difficulty} />
        </span>

        {/* Balance Score */}
        {grade && (
          <span
            // 底色是固定的等第色，文字色也必須固定為深色：
            // 白字在綠、黃底上僅 1.7–2.1:1，而 bg-primary 在淺色主題下本身是淺色。
            className="font-mono text-sm font-bold px-3 py-1.5 rounded-sm text-[#0A0A0F]"
            style={{ backgroundColor: GRADE_CLR[grade] }}
          >
            {grade}{score ? ` ${score}` : ''}
          </span>
        )}

        {/* IBA Badge */}
        {iba && (
          <span className="font-mono text-[10px] px-2.5 py-1 bg-neon-amber/10 border border-neon-amber/40 text-neon-amber tracking-widest uppercase">
            IBA Official
          </span>
        )}
      </div>

      {/* ── Description/Introduction Section ─────────────────── */}
      {(descZh || descEn) && (
        <section className="glass-card p-8 mb-8">
          <h2 className="font-display text-xl text-neon-amber mb-4">📝 介紹</h2>
          {descZh && <p className="text-text-secondary leading-relaxed mb-2">{descZh}</p>}
          {descEn && descEn !== descZh && (
            <p className="text-text-muted text-sm leading-relaxed italic">{descEn}</p>
          )}
        </section>
      )}

      {/* ── Story Section ────────────────────────────────────── */}
      {story && (
        <section className="glass-card p-8 mb-8">
          <h2 className="font-display text-xl text-neon-amber mb-4">📖 故事</h2>
          <LocalisedParagraph
            zh={story}
            en={r.storyEn}
            italic
            className="text-text-secondary italic leading-relaxed"
          />
          {origin && (
            <p className="font-mono text-xs text-charcoal-500 mt-4 tracking-wider">— {origin}</p>
          )}
        </section>
      )}

      {/* ── Ingredients Section ───────────────────────────────── */}
      <section className="glass-card p-8 mb-8">
        <h2 className="font-display text-xl text-neon-amber mb-6">🧪 材料</h2>
        <div className="space-y-0">
          {ingredients.map((ing: any, i: number) => {
            const name = typeof ing === 'string' ? ing : (ing.nameZh || ing.name_zh || ing.name || '材料')
            const amount = typeof ing === 'string' ? '' : (ing.amount ?? ing.quantity ?? '')
            const unit = typeof ing === 'string' ? '' : (ing.unit || '')
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 ${
                  i % 2 === 0 ? 'bg-bg-tertiary' : ''
                }`}
              >
                <span className="text-text-warm text-sm">{name}</span>
                {(amount || unit) && (
                  <span className="font-mono text-sm text-neon-amber">
                    {amount}{unit ? ` ${unit}` : ''}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 成本與採購 ──────────────────────────────────────── */}
      <RecipeCostBar
        recipeName={nameZh || nameEn || slug}
        ingredients={ingredients
          .filter((ing: any) => typeof ing !== 'string' && ing.slug)
          .map((ing: any) => ({
            slug: ing.slug,
            name: ing.nameZh || ing.name_zh || ing.name || ing.slug,
            amount: ing.amount ?? ing.quantity ?? 0,
            unit: ing.unit ?? 'oz',
          }))}
      />

      {/* ── Ingredient Substitutions ────────────────────────── */}
      <IngredientSubstitutions
        ingredients={ingredients.map((ing: any) => ({
          name: typeof ing === 'string' ? ing : (ing.name || ing.ingredientName || ''),
          nameZh: typeof ing === 'string' ? ing : (ing.nameZh || ing.name_zh || ing.ingredientNameZh || ''),
          amount: typeof ing === 'string' ? '' : String(ing.amount ?? ing.quantity ?? ''),
          unit: typeof ing === 'string' ? '' : (ing.unit || ''),
        }))}
      />

      {/* ── Food Pairing Suggestions ─────────────────────────── */}
      <FoodPairingSection recipe={r} />

      {/* ── Steps Section ────────────────────────────────────── */}
      {steps.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl text-neon-amber mb-6">📋 調製步驟</h2>
          <LocalisedSteps
            zh={steps.map((step: any) =>
              typeof step === 'string' ? step : (step.text || step.description || step.step || ''))}
            en={r.stepsEn}
          />
        </section>
      )}

      {/* ── Garnish Section ──────────────────────────────────── */}
      {garnish && (
        <section className="glass-card p-6 mb-8 border-neon-amber-glow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌿</span>
            <div>
              <p className="font-mono text-[10px] text-charcoal-500 uppercase tracking-widest mb-1">Garnish</p>
              <LocalisedParagraph
                zh={garnish}
                en={r.garnishEn}
                className="text-text-warm text-lg font-display"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Flavor Profile Section ───────────────────────────── */}
      {(primaryFlavors.length > 0 || barDimensions.length > 0) && (
        <section className="glass-card p-8 mb-8">
          <h2 className="font-display text-xl text-neon-amber mb-6">🎨 風味結構</h2>

          {/* Primary Flavors */}
          {primaryFlavors.length > 0 && (
            <div className="mb-6">
              <p className="font-mono text-xs text-charcoal-500 uppercase tracking-widest mb-3">Primary Flavors</p>
              <div className="flex flex-wrap gap-2">
                {primaryFlavors.map((f: string, i: number) => (
                  <span
                    key={i}
                    className="font-mono text-xs px-3 py-1.5 rounded-sm border"
                    style={{
                      borderColor: BAR_COLORS[f.toLowerCase()] || '#6B6B80',
                      color: BAR_COLORS[f.toLowerCase()] || '#B8B0A0',
                      backgroundColor: `${BAR_COLORS[f.toLowerCase()] || '#6B6B80'}15`,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bar Graphs */}
          {barDimensions.length > 0 && (
            <div className="space-y-4">
              {barDimensions.map((d) => (
                <div key={d.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs text-text-secondary">{d.label}</span>
                    <span className="font-mono text-xs text-charcoal-500">{d.value}/10</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-tertiary rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${Math.min((d.value! / 10) * 100, 100)}%`,
                        backgroundColor: BAR_COLORS[d.key] || '#F5A623',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Tips Section ─────────────────────────────────────── */}
      {tips && (
        <section className="glass-card p-8 mb-8 border border-neon-cyan/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">💡</span>
            <div>
              <h2 className="font-display text-lg text-neon-cyan mb-3">調酒師筆記</h2>
              <LocalisedParagraph
                zh={tips}
                en={r.tipsEn}
                className="text-text-secondary leading-relaxed text-sm"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Pairings Section ─────────────────────────────────── */}
      {pairings.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl text-neon-amber mb-4">🍽️ 餐搭建議</h2>
          <LocalisedTags zh={pairings} en={r.pairingsEn} />
        </section>
      )}

      {/* ── Tags ─────────────────────────────────────────────── */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 pt-6 border-t border-charcoal-800">
          {tags.map((t: string) => (
            <span key={t} className="font-mono text-[10px] px-2 py-0.5 border border-charcoal-700 text-charcoal-500 rounded-sm">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* ── Bottom Nav ───────────────────────────────────────── */}
      <div className="border-t border-charcoal-800 pt-8 pb-4 flex items-center justify-between">
        <Link
          href="/recipes"
          className="btn-neon-amber text-xs"
        >
          ← 返回配方庫
        </Link>
        <p className="font-mono text-[10px] text-charcoal-600 tracking-wider">
          MIXMASTER RECIPE DETAIL
        </p>
      </div>
    </main>
  )
}
