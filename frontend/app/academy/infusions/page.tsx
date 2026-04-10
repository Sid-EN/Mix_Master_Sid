'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Difficulty = 1 | 2 | 3
type BaseSpirit =
  | 'Vodka'
  | 'Gin'
  | 'Rum'
  | 'Bourbon/Whisky'
  | 'Tequila'
  | '其他'

interface Recipe {
  id: number
  emoji: string
  nameZh: string
  nameEn: string
  base: string
  baseCategory: BaseSpirit
  amount: string
  materials: string[]
  time: string
  difficulty: Difficulty
  uses: string[]
  proTip?: string
  steps: string[]
  isFatWash?: boolean
}

/* ------------------------------------------------------------------ */
/*  Data: Infusion Time Reference Table                                */
/* ------------------------------------------------------------------ */

const TIME_TABLE: { type: string; time: string; examples: string }[] = [
  { type: '辣椒/香料', time: '30分-4小時', examples: '墨西哥辣椒、花椒、肉桂棒' },
  { type: '新鮮香草', time: '2-5天', examples: '薄荷、羅勒、迷迭香' },
  { type: '新鮮水果', time: '3-7天', examples: '草莓、覆盆莓、鳳梨' },
  { type: '柑橘皮', time: '3-7天', examples: '檸檬皮、橙皮、葡萄柚皮' },
  { type: '乾燥香料', time: '3-14天', examples: '肉桂、丁香、荳蔻、八角' },
  { type: '堅果/咖啡', time: '5-14天', examples: '核桃、杏仁、咖啡豆' },
  { type: '花朵', time: '1-3天', examples: '薰衣草、洛神花、玫瑰花瓣' },
  { type: '茶葉', time: '2-8小時', examples: '伯爵茶、茉莉花茶、焙茶' },
]

/* ------------------------------------------------------------------ */
/*  Data: 15 Recipes                                                   */
/* ------------------------------------------------------------------ */

const RECIPES: Recipe[] = [
  {
    id: 1,
    emoji: '🌶️',
    nameZh: '辣椒伏特加',
    nameEn: 'Chili Vodka',
    base: 'Vodka 750ml',
    baseCategory: 'Vodka',
    amount: '750ml',
    materials: ['墨西哥辣椒(Jalapeño) 2根，去籽切片'],
    time: '2-4 小時（每 30 分鐘試味）',
    difficulty: 1,
    uses: ['Bloody Mary', 'Spicy Margarita'],
    proTip: '去籽控制辣度，帶籽則極辣',
    steps: [
      '將辣椒去籽後切成薄片',
      '放入乾淨玻璃瓶中，倒入 Vodka',
      '密封後每 30 分鐘試味一次',
      '達到理想辣度後過濾取出辣椒',
      '冷藏保存',
    ],
  },
  {
    id: 2,
    emoji: '🍓',
    nameZh: '草莓琴酒',
    nameEn: 'Strawberry Gin',
    base: 'London Dry Gin 750ml',
    baseCategory: 'Gin',
    amount: '750ml',
    materials: ['新鮮草莓 250g 切半', '黑胡椒 5顆'],
    time: '5-7 天',
    difficulty: 1,
    uses: ['Strawberry Gimlet', 'G&T 變體'],
    steps: [
      '草莓洗淨切半，黑胡椒略壓碎',
      '放入密封玻璃瓶，倒入 Gin',
      '置於陰涼處，每天輕搖一次',
      '5-7 天後以細網過濾',
      '冷藏可保存約 1 個月',
    ],
  },
  {
    id: 3,
    emoji: '☕',
    nameZh: '咖啡波本',
    nameEn: 'Coffee Bourbon',
    base: 'Bourbon 750ml',
    baseCategory: 'Bourbon/Whisky',
    amount: '750ml',
    materials: ['中深焙咖啡豆 80g（整顆）'],
    time: '24-48 小時',
    difficulty: 1,
    uses: ['Espresso Old Fashioned', 'Coffee Manhattan'],
    proTip: '不要超過 48 小時，否則過度萃取變苦',
    steps: [
      '將整顆咖啡豆放入密封瓶',
      '倒入 Bourbon，密封搖勻',
      '室溫靜置 24-48 小時',
      '以咖啡濾紙雙重過濾',
      '裝瓶冷藏保存',
    ],
  },
  {
    id: 4,
    emoji: '🍊',
    nameZh: '柑橘杜松伏特加',
    nameEn: 'Citrus Juniper Vodka',
    base: 'Vodka 750ml',
    baseCategory: 'Vodka',
    amount: '750ml',
    materials: [
      '橙皮 2顆份',
      '檸檬皮 1顆份',
      '杜松子 1大匙',
      '芫荽籽 1茶匙',
    ],
    time: '5-7 天',
    difficulty: 2,
    uses: ['自製「琴酒」', 'DIY Gin & Tonic'],
    steps: [
      '用削皮器取柑橘皮（避免白色髓部）',
      '杜松子與芫荽籽略壓碎釋放香氣',
      '所有材料放入密封瓶，倒入 Vodka',
      '每天輕搖，浸泡 5-7 天',
      '細網過濾後裝瓶',
    ],
  },
  {
    id: 5,
    emoji: '🌸',
    nameZh: '薰衣草蜂蜜伏特加',
    nameEn: 'Lavender Honey Vodka',
    base: 'Vodka 750ml',
    baseCategory: 'Vodka',
    amount: '750ml',
    materials: ['乾燥薰衣草 2大匙', '蜂蜜 60ml'],
    time: '3 天（薰衣草），蜂蜜隨時加入',
    difficulty: 1,
    uses: ['Lavender Lemonade', "Bee's Knees 變體"],
    steps: [
      '薰衣草放入密封瓶，倒入 Vodka',
      '密封浸泡 3 天，每天搖晃',
      '過濾取出薰衣草',
      '加入蜂蜜攪拌至溶解',
      '冷藏保存',
    ],
  },
  {
    id: 6,
    emoji: '🥓',
    nameZh: '培根波本',
    nameEn: 'Bacon Bourbon',
    base: 'Bourbon 750ml',
    baseCategory: 'Bourbon/Whisky',
    amount: '750ml',
    materials: ['培根油 60ml（煎培根後的油）'],
    time: '4-6小時室溫 → 冷凍12小時 → 過濾去油',
    difficulty: 3,
    uses: ['Bacon Old Fashioned'],
    proTip: '這是脂洗(Fat-Wash)技法',
    isFatWash: true,
    steps: [
      '煎培根取油，冷卻至室溫',
      '將培根油倒入 Bourbon，密封搖勻',
      '室溫靜置 4-6 小時',
      '放入冷凍庫 12 小時，油脂凝固',
      '用細網+咖啡濾紙過濾去除油脂',
    ],
  },
  {
    id: 7,
    emoji: '🍍',
    nameZh: '鳳梨蘭姆酒',
    nameEn: 'Pineapple Rum',
    base: 'White Rum 750ml',
    baseCategory: 'Rum',
    amount: '750ml',
    materials: ['新鮮鳳梨 1/4顆切塊', '肉桂棒 1根'],
    time: '5-7 天',
    difficulty: 1,
    uses: ['Piña Colada 升級', 'Tiki cocktails'],
    steps: [
      '鳳梨去皮切小塊',
      '與肉桂棒一起放入密封瓶',
      '倒入 White Rum，密封搖勻',
      '陰涼處靜置 5-7 天',
      '過濾裝瓶，冷藏保存',
    ],
  },
  {
    id: 8,
    emoji: '🫖',
    nameZh: '伯爵茶琴酒',
    nameEn: 'Earl Grey Gin',
    base: 'Gin 750ml',
    baseCategory: 'Gin',
    amount: '750ml',
    materials: ['伯爵茶葉 3大匙'],
    time: '2-3 小時（不可過久，單寧會過重）',
    difficulty: 1,
    uses: ['Earl Grey Martini', 'Tea-infused G&T'],
    steps: [
      '伯爵茶葉直接加入 Gin',
      '密封浸泡 2-3 小時',
      '頻繁試味，避免單寧過重',
      '細網過濾取出茶葉',
      '裝瓶後即可使用',
    ],
  },
  {
    id: 9,
    emoji: '🍫',
    nameZh: '可可蘭姆酒',
    nameEn: 'Cacao Rum',
    base: 'Dark Rum 750ml',
    baseCategory: 'Rum',
    amount: '750ml',
    materials: ['可可碎粒(Cacao Nibs) 60g', '香草莢 1/2根'],
    time: '7-10 天',
    difficulty: 2,
    uses: ['Chocolate Martini', 'Daiquiri 變體'],
    steps: [
      '香草莢縱切取籽，連莢放入',
      '加入可可碎粒與 Dark Rum',
      '密封後每天搖晃一次',
      '7-10 天後雙重過濾',
      '裝瓶冷藏保存',
    ],
  },
  {
    id: 10,
    emoji: '🌿',
    nameZh: '迷迭香蜂蜜龍舌蘭',
    nameEn: 'Rosemary Honey Tequila',
    base: 'Blanco Tequila 750ml',
    baseCategory: 'Tequila',
    amount: '750ml',
    materials: ['新鮮迷迭香 3枝', '蜂蜜 45ml'],
    time: '3-5 天',
    difficulty: 2,
    uses: ['Rosemary Margarita'],
    steps: [
      '迷迭香洗淨擦乾',
      '放入密封瓶，倒入 Tequila',
      '浸泡 3-5 天，每天搖晃',
      '過濾取出迷迭香',
      '加入蜂蜜攪拌溶解，裝瓶',
    ],
  },
  {
    id: 11,
    emoji: '🫒',
    nameZh: '橄欖油伏特加',
    nameEn: 'Olive Oil Vodka',
    base: 'Vodka 750ml',
    baseCategory: 'Vodka',
    amount: '750ml',
    materials: ['特級初榨橄欖油 60ml'],
    time: '4小時室溫 → 冷凍12小時 → 過濾',
    difficulty: 3,
    uses: ['Dirty Martini 升級版'],
    isFatWash: true,
    steps: [
      '將橄欖油倒入 Vodka，搖勻',
      '室溫靜置 4 小時',
      '放入冷凍庫 12 小時',
      '油脂凝固後用細網+濾紙過濾',
      '裝瓶冷藏保存',
    ],
  },
  {
    id: 12,
    emoji: '🌺',
    nameZh: '洛神花龍舌蘭',
    nameEn: 'Hibiscus Tequila',
    base: 'Blanco Tequila 750ml',
    baseCategory: 'Tequila',
    amount: '750ml',
    materials: ['乾燥洛神花 30g'],
    time: '2-3 天',
    difficulty: 1,
    uses: ['Hibiscus Margarita（美麗紅色）'],
    steps: [
      '乾燥洛神花放入密封瓶',
      '倒入 Tequila，密封搖勻',
      '靜置 2-3 天，顏色轉為深紅',
      '過濾取出洛神花',
      '裝瓶冷藏，風味可保持數月',
    ],
  },
  {
    id: 13,
    emoji: '🧈',
    nameZh: '奶油威士忌',
    nameEn: 'Butter Scotch',
    base: 'Scotch 750ml',
    baseCategory: 'Bourbon/Whisky',
    amount: '750ml',
    materials: ['棕化奶油(Brown Butter) 45ml'],
    time: '4小時 → 冷凍 → 過濾',
    difficulty: 3,
    uses: ['Buttered Scotch Old Fashioned'],
    isFatWash: true,
    steps: [
      '奶油小火加熱至棕化（散發堅果香）',
      '冷卻後倒入 Scotch，搖勻',
      '室溫靜置 4 小時',
      '冷凍 12 小時使油脂凝固',
      '雙重過濾去除所有油脂',
    ],
  },
  {
    id: 14,
    emoji: '🍋',
    nameZh: '柚子清酒',
    nameEn: 'Yuzu Sake',
    base: '清酒 720ml',
    baseCategory: '其他',
    amount: '720ml',
    materials: ['柚子皮 3顆份（只取黃色部分）'],
    time: '24-48 小時',
    difficulty: 1,
    uses: ['Yuzu Sake Spritz'],
    steps: [
      '用削皮器取柚子皮（避免白色髓部）',
      '放入密封瓶，倒入清酒',
      '冷藏浸泡 24-48 小時',
      '過濾取出柚子皮',
      '冷藏保存，儘早飲用',
    ],
  },
  {
    id: 15,
    emoji: '🎃',
    nameZh: '南瓜香料波本',
    nameEn: 'Pumpkin Spice Bourbon',
    base: 'Bourbon 750ml',
    baseCategory: 'Bourbon/Whisky',
    amount: '750ml',
    materials: [
      '烤南瓜泥 120g',
      '肉桂棒 2根',
      '丁香 3顆',
      '荳蔻 1/4茶匙',
    ],
    time: '5-7 天（過濾需仔細）',
    difficulty: 2,
    uses: ['秋季 Old Fashioned', 'Pumpkin Sour'],
    steps: [
      '南瓜泥先烤過增加風味',
      '與香料一起放入密封瓶',
      '倒入 Bourbon，搖勻密封',
      '浸泡 5-7 天，每天搖晃',
      '多次過濾（細網→咖啡濾紙）直到澄清',
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Filter options                                                     */
/* ------------------------------------------------------------------ */

const BASE_FILTERS: { label: string; value: BaseSpirit | '全部' }[] = [
  { label: '全部', value: '全部' },
  { label: 'Vodka', value: 'Vodka' },
  { label: 'Gin', value: 'Gin' },
  { label: 'Rum', value: 'Rum' },
  { label: 'Bourbon/Whisky', value: 'Bourbon/Whisky' },
  { label: 'Tequila', value: 'Tequila' },
  { label: '其他', value: '其他' },
]

const DIFF_FILTERS: { label: string; value: Difficulty | 0 }[] = [
  { label: '全部', value: 0 },
  { label: '⭐ 簡單', value: 1 },
  { label: '⭐⭐ 中等', value: 2 },
  { label: '⭐⭐⭐ 進階', value: 3 },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function difficultyStars(d: Difficulty) {
  return '⭐'.repeat(d)
}

function DurationBar({ time }: { time: string }) {
  // Map descriptive time to a rough 0–100 visual width
  const t = time.toLowerCase()
  let pct = 30
  if (t.includes('分') && !t.includes('天')) pct = 10
  if (t.includes('小時') && !t.includes('天')) pct = 25
  if (t.includes('1') && t.includes('天')) pct = 35
  if (t.includes('2') && t.includes('天')) pct = 40
  if (t.includes('3') && t.includes('天')) pct = 50
  if (t.includes('5') && t.includes('天')) pct = 65
  if (t.includes('7') && t.includes('天')) pct = 75
  if (t.includes('10') || t.includes('14')) pct = 90

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
        <span>⏱ 浸泡時間</span>
        <span>{time}</span>
      </div>
      <div className="h-1.5 rounded-full bg-charcoal-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--color-neon-amber), var(--color-neon-cyan))',
          }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function InfusionsPage() {
  const [baseFilter, setBaseFilter] = useState<BaseSpirit | '全部'>('全部')
  const [diffFilter, setDiffFilter] = useState<Difficulty | 0>(0)

  const filtered = RECIPES.filter((r) => {
    if (baseFilter !== '全部' && r.baseCategory !== baseFilter) return false
    if (diffFilter !== 0 && r.difficulty !== diffFilter) return false
    return true
  })

  return (
    <main className="min-h-screen px-4 py-12 md:px-8 lg:px-16 max-w-7xl mx-auto">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-amber mb-4">
          🧪 自製浸泡酒工坊 (Infusion Lab)
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          將日常材料化為獨家風味——浸泡酒是每位調酒師的秘密武器
        </p>
      </header>

      {/* ── Section 1: Basics ────────────────────────────────── */}
      <section className="mb-16 animate-fade-in-up-delay-1">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient-amber mb-6">
          🔬 浸泡酒基礎 (Infusion Basics)
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: '⚗️',
              title: '原理',
              desc: '酒精作為溶劑萃取材料的風味、色素、芳香油',
            },
            {
              icon: '🍶',
              title: '選擇基酒',
              desc: '高ABV無色烈酒最適合（Vodka, Overproof Rum, Grain Spirit）',
            },
            {
              icon: '🫙',
              title: '容器',
              desc: '玻璃密封瓶（避免塑膠），保存在陰暗處',
            },
            {
              icon: '⚠️',
              title: '安全',
              desc: '避免有毒植物，柑橘類去除白色髓部（苦味）',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card p-5 flex gap-4 items-start hover:border-neon-amber transition-all duration-300"
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-text-warm mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Time Reference Table ──────────────────── */}
      <section className="mb-16 animate-fade-in-up-delay-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient-amber mb-6">
          ⏱ 浸泡時間對照表
        </h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-700">
                <th className="text-left px-5 py-3 text-neon-amber font-semibold">材料類型</th>
                <th className="text-left px-5 py-3 text-neon-amber font-semibold">時間</th>
                <th className="text-left px-5 py-3 text-neon-amber font-semibold">範例</th>
              </tr>
            </thead>
            <tbody>
              {TIME_TABLE.map((row, i) => (
                <tr
                  key={row.type}
                  className={`border-b border-charcoal-700/50 hover:bg-charcoal-800/50 transition-colors ${
                    i % 2 === 0 ? 'bg-charcoal-900/30' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-text-warm">{row.type}</td>
                  <td className="px-5 py-3 text-neon-cyan font-mono text-xs">{row.time}</td>
                  <td className="px-5 py-3 text-text-secondary">{row.examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 3: Recipes ───────────────────────────────── */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient-amber mb-6 animate-fade-in-up-delay-3">
          🍸 浸泡酒配方 ({RECIPES.length} 款)
        </h2>

        {/* Filters */}
        <div className="glass-card p-5 mb-8 space-y-4 animate-fade-in-up-delay-3">
          {/* Base spirit filter */}
          <div>
            <span className="text-xs uppercase tracking-widest text-text-muted mr-3">基酒篩選</span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {BASE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setBaseFilter(f.value)}
                  className={`px-3 py-1 text-xs rounded-sm border transition-all duration-200 ${
                    baseFilter === f.value
                      ? 'border-neon-amber bg-neon-amber/20 text-neon-amber'
                      : 'border-charcoal-600 text-text-secondary hover:border-charcoal-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {/* Difficulty filter */}
          <div>
            <span className="text-xs uppercase tracking-widest text-text-muted mr-3">難度篩選</span>
            <div className="inline-flex flex-wrap gap-2 mt-1">
              {DIFF_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setDiffFilter(f.value)}
                  className={`px-3 py-1 text-xs rounded-sm border transition-all duration-200 ${
                    diffFilter === f.value
                      ? 'border-neon-amber bg-neon-amber/20 text-neon-amber'
                      : 'border-charcoal-600 text-text-secondary hover:border-charcoal-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length !== RECIPES.length && (
            <p className="text-xs text-text-muted">
              顯示 {filtered.length} / {RECIPES.length} 款配方
            </p>
          )}
        </div>

        {/* Recipe Cards Grid */}
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center text-text-muted">
            <p className="text-4xl mb-3">🔍</p>
            <p>沒有符合條件的配方，請調整篩選</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((r, idx) => (
              <article
                key={r.id}
                className="glass-card p-6 hover:border-neon-amber transition-all duration-300 flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${Math.min(idx * 0.06, 0.6)}s`, opacity: 0 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-display font-bold text-text-warm flex items-center gap-2">
                      <span className="text-2xl">{r.emoji}</span>
                      {r.nameZh}
                    </h3>
                    <p className="text-xs text-text-muted font-mono mt-0.5">{r.nameEn}</p>
                  </div>
                  {r.isFatWash && (
                    <span className="text-[10px] px-2 py-0.5 rounded-sm bg-neon-purple/20 text-neon-purple border border-neon-purple/40 flex-shrink-0">
                      Fat-Wash
                    </span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-0.5 rounded-sm bg-neon-amber/10 text-neon-amber border border-neon-amber/30">
                    🍶 {r.base}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-sm bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
                    ⏱ {r.time.split('（')[0].split('→')[0].trim()}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-sm bg-charcoal-700 text-text-secondary">
                    {difficultyStars(r.difficulty)}
                  </span>
                </div>

                {/* Materials */}
                <div className="mb-4">
                  <h4 className="text-xs uppercase tracking-widest text-text-muted mb-2">材料</h4>
                  <ul className="space-y-1">
                    {r.materials.map((m) => (
                      <li key={m} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-neon-amber mt-0.5">•</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Steps */}
                <div className="mb-4 flex-1">
                  <h4 className="text-xs uppercase tracking-widest text-text-muted mb-2">步驟</h4>
                  <ol className="space-y-1.5">
                    {r.steps.map((s, i) => (
                      <li key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-neon-cyan font-mono text-xs mt-0.5 flex-shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Duration Bar */}
                <DurationBar time={r.time} />

                {/* Uses (pills) */}
                <div className="mt-4">
                  <h4 className="text-xs uppercase tracking-widest text-text-muted mb-2">推薦用途</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {r.uses.map((u) => (
                      <span
                        key={u}
                        className="text-xs px-2 py-0.5 rounded-full bg-charcoal-700/70 text-text-secondary border border-charcoal-600/50 hover:border-neon-amber/40 hover:text-neon-amber transition-colors"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pro Tip */}
                {r.proTip && (
                  <div className="mt-4 p-3 rounded-sm bg-neon-amber/5 border border-neon-amber/20">
                    <p className="text-xs text-neon-amber">
                      <span className="font-bold">💡 Pro Tip：</span>
                      {r.proTip}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer Nav ───────────────────────────────────────── */}
      <footer className="flex flex-wrap justify-center gap-4 pt-8 border-t border-charcoal-700">
        <Link href="/academy" className="btn-neon-amber">
          ← 返回調酒學院
        </Link>
        <Link href="/" className="btn-neon-cyan">
          🏠 首頁
        </Link>
      </footer>
    </main>
  )
}
