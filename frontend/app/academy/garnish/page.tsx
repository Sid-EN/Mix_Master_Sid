'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────────────────── */
/*  Types                                                       */
/* ──────────────────────────────────────────────────────────── */

type Category = 'all' | 'citrus' | 'herbs' | 'fruits' | 'rim' | 'advanced'

interface GarnishTechnique {
  id: number
  name: string
  nameEn: string
  emoji: string
  category: Category
  difficulty: number          // 1-5 stars
  tools: string[]
  steps: string[]
  usage: string[]
  proTip?: string
  warning?: string
  variations?: string
  effect?: string
  notes?: string
}

/* ──────────────────────────────────────────────────────────── */
/*  Category Filter Tabs                                        */
/* ──────────────────────────────────────────────────────────── */

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all',      label: '全部' },
  { value: 'citrus',   label: '🍊 柑橘類' },
  { value: 'herbs',    label: '🌿 草本花卉' },
  { value: 'fruits',   label: '🍒 水果' },
  { value: 'rim',      label: '🧂 杯口裝飾' },
  { value: 'advanced', label: '🔥 進階技法' },
]

/* ──────────────────────────────────────────────────────────── */
/*  Garnish Data (20 techniques)                                */
/* ──────────────────────────────────────────────────────────── */

const GARNISHES: GarnishTechnique[] = [
  // ── 🍊 柑橘類 Citrus ────────────────────────────────────
  {
    id: 1,
    name: '橙皮捲',
    nameEn: 'Orange Twist',
    emoji: '🍊',
    category: 'citrus',
    difficulty: 2,
    tools: ['削皮刀或Y型削皮器'],
    steps: [
      '削取5cm×2cm橙皮',
      '避免白色髓部',
      '在杯面擠壓釋放精油',
      '捲成螺旋投入杯中',
    ],
    usage: ['Old Fashioned', 'Martini', 'Negroni'],
    proTip: '擠壓時對著火焰可創造火焰橙皮（Flamed Orange Peel）',
  },
  {
    id: 2,
    name: '檸檬馬',
    nameEn: "Lemon Horse's Neck",
    emoji: '🍋',
    category: 'citrus',
    difficulty: 3,
    tools: ['通道刀（Channel Knife）'],
    steps: [
      '從檸檬頂部開始',
      '螺旋式連續削出長條皮',
      '掛在杯緣螺旋垂入杯中',
    ],
    usage: ["Horse's Neck", 'Highball'],
    proTip: '需要完整不斷的一條，練習是關鍵',
  },
  {
    id: 3,
    name: '柑橘輪片',
    nameEn: 'Citrus Wheel',
    emoji: '🍊',
    category: 'citrus',
    difficulty: 1,
    tools: ['鋒利水果刀'],
    steps: [
      '切3-5mm薄片',
      '從中心切一刀到邊緣',
      '掛在杯緣',
    ],
    usage: ['Gin & Tonic', 'Tom Collins', 'Spritz'],
    variations: '半月型（Half Moon）、扇形（Fan）',
  },
  {
    id: 4,
    name: '火焰橙皮',
    nameEn: 'Flamed Orange Peel',
    emoji: '🔥',
    category: 'citrus',
    difficulty: 3,
    tools: ['大片橙皮', '打火機／火柴'],
    steps: [
      '削大片橙皮',
      '點燃火焰',
      '在杯面上方擠壓橙皮穿過火焰',
      '精油引燃產生火花',
    ],
    usage: ['Old Fashioned', 'Sazerac'],
    warning: '注意安全，遠離易燃物',
  },

  // ── 🌿 草本花卉 Herbs & Flowers ─────────────────────────
  {
    id: 5,
    name: '薄荷花束',
    nameEn: 'Mint Bouquet',
    emoji: '🌿',
    category: 'herbs',
    difficulty: 1,
    tools: ['新鮮薄荷枝'],
    steps: [
      '挑選飽滿枝條',
      '拍打一下釋放香氣',
      '插入碎冰中如花束',
    ],
    usage: ['Mojito', 'Julep', 'Smash'],
    proTip: '拍打（Slap）而非揉搓，避免苦味',
  },
  {
    id: 6,
    name: '迷迭香火炬',
    nameEn: 'Rosemary Torch',
    emoji: '🔥',
    category: 'herbs',
    difficulty: 2,
    tools: ['新鮮迷迭香枝', '打火機'],
    steps: [
      '取新鮮迷迭香枝',
      '用打火機燒烤頂部直到冒煙',
      '插入杯中',
    ],
    usage: ['Smoky cocktails', 'Gin cocktails'],
    effect: '視覺煙霧＋香氣',
  },
  {
    id: 7,
    name: '可食用花朵',
    nameEn: 'Edible Flowers',
    emoji: '🌸',
    category: 'herbs',
    difficulty: 1,
    tools: ['食品級花朵'],
    steps: [
      '選擇花種：蝴蝶蘭花瓣、三色堇、薰衣草、玫瑰花瓣、接骨木花',
      '漂浮在杯面或冰塊中冷凍',
    ],
    usage: ['Gin cocktails', 'Champagne cocktails'],
    warning: '必須使用食品級花朵，非花店裝飾花',
  },
  {
    id: 8,
    name: '羅勒葉拍打',
    nameEn: 'Basil Slap',
    emoji: '🌿',
    category: 'herbs',
    difficulty: 1,
    tools: ['新鮮羅勒葉'],
    steps: [
      '取大片羅勒葉',
      '放在手心用力拍一下',
      '放在杯面',
    ],
    usage: ['Basil Smash', '任何草本調酒'],
    notes: '拍打破壞細胞壁釋放芳香油',
  },

  // ── 🍒 水果 Fruits ──────────────────────────────────────
  {
    id: 9,
    name: '雞尾酒櫻桃',
    nameEn: 'Cocktail Cherry',
    emoji: '🍒',
    category: 'fruits',
    difficulty: 1,
    tools: ['雞尾酒叉'],
    steps: [
      '選擇 Maraschino（高端）而非普通罐頭（避免）',
      '以雞尾酒叉串起放入杯中',
    ],
    usage: ['Manhattan', 'Old Fashioned', 'Whiskey Sour'],
    proTip: 'Luxardo Maraschino Cherries 是黑色的，不是螢光紅色的',
    notes: '推薦品牌：Luxardo Maraschino Cherries',
  },
  {
    id: 10,
    name: '鳳梨葉扇',
    nameEn: 'Pineapple Leaf Fan',
    emoji: '🍍',
    category: 'fruits',
    difficulty: 2,
    tools: ['鳳梨冠葉', '雞尾酒叉'],
    steps: [
      '取3-5片鳳梨冠葉',
      '扇形排列',
      '以雞尾酒叉固定',
    ],
    usage: ['Piña Colada', 'Tiki drinks'],
  },
  {
    id: 11,
    name: '蘋果扇',
    nameEn: 'Apple Fan',
    emoji: '🍎',
    category: 'fruits',
    difficulty: 2,
    tools: ['鋒利水果刀', '牙籤'],
    steps: [
      '將蘋果切薄片',
      '排成扇形',
      '以牙籤固定放杯緣',
    ],
    usage: ['Apple cocktails', 'Autumn drinks'],
    proTip: '切後泡檸檬水防止氧化變色',
  },
  {
    id: 12,
    name: '脫水柑橘片',
    nameEn: 'Dehydrated Citrus',
    emoji: '🍊',
    category: 'fruits',
    difficulty: 2,
    tools: ['烤箱或脫水機', '鋒利水果刀'],
    steps: [
      '切2-3mm薄片',
      '烤箱80°C烘烤3-4小時',
      '或使用脫水機',
    ],
    usage: ['任何調酒', '極佳視覺效果'],
    notes: '可保存數週，專業感十足',
  },

  // ── 🧂 杯口裝飾 Rim ─────────────────────────────────────
  {
    id: 13,
    name: '鹽口杯',
    nameEn: 'Salt Rim',
    emoji: '🧂',
    category: 'rim',
    difficulty: 1,
    tools: ['淺盤', '檸檬或萊姆'],
    steps: [
      '檸檬／萊姆汁塗杯口',
      '倒扣入鹽盤',
      '旋轉均勻沾附',
    ],
    usage: ['Margarita', 'Salty Dog'],
    proTip: '混合辣椒粉（Tajín）做辣鹽口',
  },
  {
    id: 14,
    name: '糖口杯',
    nameEn: 'Sugar Rim',
    emoji: '✨',
    category: 'rim',
    difficulty: 1,
    tools: ['淺盤', '細砂糖', '檸檬汁'],
    steps: [
      '檸檬汁塗杯口',
      '倒扣入糖盤',
      '旋轉均勻沾附',
    ],
    usage: ['Lemon Drop', 'Sidecar', 'Cosmopolitan'],
    variations: '有色糖、肉桂糖',
  },
  {
    id: 15,
    name: '巧克力杯口',
    nameEn: 'Chocolate Rim',
    emoji: '🍫',
    category: 'rim',
    difficulty: 2,
    tools: ['融化巧克力', '可可粉或碎堅果'],
    steps: [
      '融化巧克力',
      '杯口沾巧克力',
      '沾可可粉或碎堅果',
    ],
    usage: ['Espresso Martini', 'Chocolate cocktails'],
  },
  {
    id: 16,
    name: '萬用辛香料杯口',
    nameEn: 'Everything Rim',
    emoji: '🌶️',
    category: 'rim',
    difficulty: 2,
    tools: ['蜂蜜', '混合香料'],
    steps: [
      '混合海鹽＋黑胡椒＋蒜粉＋洋蔥粉＋芝麻',
      '蜂蜜塗杯口',
      '沾混合香料',
    ],
    usage: ['Bloody Mary'],
  },

  // ── 🔥 進階技法 Advanced ─────────────────────────────────
  {
    id: 17,
    name: '煙燻杯',
    nameEn: 'Smoked Glass',
    emoji: '💨',
    category: 'advanced',
    difficulty: 3,
    tools: ['木片（如櫻桃木、蘋果木）', '打火機'],
    steps: [
      '將杯子倒扣在燃燒的木片上',
      '捕捉煙霧',
      '翻轉倒入調酒',
    ],
    usage: ['Smoky Old Fashioned', 'Mezcal cocktails'],
  },
  {
    id: 18,
    name: '冰球內嵌裝飾',
    nameEn: 'Garnish in Ice',
    emoji: '🧊',
    category: 'advanced',
    difficulty: 3,
    tools: ['球形冰模', '花朵或水果'],
    steps: [
      '花朵／水果放模具底部',
      '加少量水冷凍',
      '再加滿水冷凍',
    ],
    usage: ['展示型調酒', 'Fine dining cocktails'],
    effect: '透明冰球中包裹裝飾物',
  },
  {
    id: 19,
    name: '棉花糖火炬',
    nameEn: 'Torched Marshmallow',
    emoji: '🔥',
    category: 'advanced',
    difficulty: 2,
    tools: ['竹籤', '棉花糖', '噴槍'],
    steps: [
      '串棉花糖在竹籤上',
      '用噴槍炙烤至焦糖色',
      '橫放杯口',
    ],
    usage: ["S'mores Martini", '甜系調酒'],
  },
  {
    id: 20,
    name: '乾冰霧氣',
    nameEn: 'Dry Ice Fog',
    emoji: '🌫️',
    category: 'advanced',
    difficulty: 4,
    tools: ['食品級乾冰', '夾子（切勿徒手碰觸）'],
    steps: [
      '小塊乾冰放杯底',
      '倒入調酒',
      '產生戲劇性煙霧',
    ],
    usage: ['萬聖節調酒', '展示型調酒'],
    warning: '切勿食用乾冰，等氣泡完全消失才能飲用',
  },
]

/* ──────────────────────────────────────────────────────────── */
/*  Essential Garnish Tools                                     */
/* ──────────────────────────────────────────────────────────── */

const TOOLS = [
  { emoji: '🔪', name: '削皮刀', nameEn: 'Y-Peeler' },
  { emoji: '🔧', name: '通道刀', nameEn: 'Channel Knife' },
  { emoji: '🪡', name: '雞尾酒叉', nameEn: 'Cocktail Pick' },
  { emoji: '🔥', name: '噴槍', nameEn: 'Culinary Torch' },
  { emoji: '🍋', name: '柑橘榨汁器', nameEn: 'Citrus Juicer' },
  { emoji: '🪵', name: '砧板＋鋒利水果刀', nameEn: 'Cutting Board + Knife' },
]

/* ──────────────────────────────────────────────────────────── */
/*  Helper: Difficulty Stars                                    */
/* ──────────────────────────────────────────────────────────── */

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="font-mono text-sm tracking-wider" title={`難度 ${level}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < level ? 'text-neon-amber' : 'text-charcoal-700'}>
          ⭐
        </span>
      ))}
    </span>
  )
}

/* ──────────────────────────────────────────────────────────── */
/*  Component                                                   */
/* ──────────────────────────────────────────────────────────── */

export default function GarnishPage() {
  const [filter, setFilter] = useState<Category>('all')

  const filtered =
    filter === 'all'
      ? GARNISHES
      : GARNISHES.filter((g) => g.category === filter)

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-12 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="inline-flex items-center gap-1 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors duration-200 mb-8"
        >
          ← 返回學院
        </Link>

        <div className="animate-fade-in-up">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            The Art of Garnish
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-gradient-amber mb-4">
            🎨 裝飾藝術百科
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-3xl leading-relaxed">
            調酒的最後一筆——裝飾是視覺、香氣與風味的完美收尾
          </p>
          <div className="divider-amber mt-8" />
        </div>

        {/* ── Category Tabs ───────────────────────────────── */}
        <div className="mt-10 flex flex-wrap gap-3 animate-fade-in-up-delay-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-5 py-2 rounded-sm font-mono text-sm tracking-wider border transition-all duration-300 ${
                filter === cat.value
                  ? 'btn-neon-amber bg-neon-amber text-bg-primary'
                  : 'border-charcoal-700 text-charcoal-400 hover:border-neon-amber hover:text-neon-amber'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Garnish Cards ─────────────────────────────────── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((g, idx) => (
            <article
              key={g.id}
              className="glass-card p-8 hover:border-neon-amber/60 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.07}s`, opacity: 0 }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{g.emoji}</span>
                  <div>
                    <h2 className="font-display text-xl text-text-warm group-hover:text-neon-amber transition-colors">
                      {g.name}
                    </h2>
                    <p className="font-mono text-xs text-charcoal-400">
                      {g.nameEn}
                    </p>
                  </div>
                </div>
                <DifficultyStars level={g.difficulty} />
              </div>

              {/* Tools */}
              <div className="flex flex-wrap gap-2 mb-4">
                {g.tools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs bg-charcoal-800 text-charcoal-300 border border-charcoal-700"
                  >
                    🔧 {tool}
                  </span>
                ))}
              </div>

              {/* Steps */}
              <ol className="space-y-1.5 mb-4">
                {g.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neon-amber/15 text-neon-amber font-mono text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              {/* Usage pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {g.usage.map((u) => (
                  <span
                    key={u}
                    className="px-2.5 py-0.5 rounded-full font-mono text-xs bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                  >
                    {u}
                  </span>
                ))}
              </div>

              {/* Optional extras */}
              {g.proTip && (
                <div className="mt-3 p-3 rounded bg-neon-amber/5 border border-neon-amber/20">
                  <p className="text-sm text-neon-amber">
                    <span className="font-mono font-semibold">💡 Pro Tip：</span>{' '}
                    {g.proTip}
                  </p>
                </div>
              )}

              {g.warning && (
                <div className="mt-3 p-3 rounded bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-400">
                    <span className="font-mono font-semibold">⚠️ 警告：</span>{' '}
                    {g.warning}
                  </p>
                </div>
              )}

              {g.variations && (
                <p className="mt-3 text-sm text-charcoal-300">
                  <span className="font-mono text-neon-amber/80">變化：</span> {g.variations}
                </p>
              )}

              {g.effect && (
                <p className="mt-3 text-sm text-charcoal-300">
                  <span className="font-mono text-neon-cyan/80">✦ 效果：</span> {g.effect}
                </p>
              )}

              {g.notes && (
                <p className="mt-2 text-xs text-charcoal-400 italic">
                  📝 {g.notes}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ── Essential Garnish Tools ───────────────────────── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="animate-fade-in-up">
          <h2 className="font-display text-3xl text-gradient-amber mb-2">
            🧰 裝飾工具清單
          </h2>
          <p className="text-text-secondary mb-6">
            Essential Garnish Tools — 好的裝飾從好的工具開始
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {TOOLS.map((t, idx) => (
            <div
              key={t.nameEn}
              className="glass-card p-4 text-center hover:border-neon-amber/60 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.08}s`, opacity: 0 }}
            >
              <span className="text-3xl block mb-2">{t.emoji}</span>
              <p className="text-sm text-text-warm font-medium">{t.name}</p>
              <p className="font-mono text-xs text-charcoal-400 mt-0.5">{t.nameEn}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
