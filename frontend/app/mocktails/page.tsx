'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ─── Types ─── */
interface Mocktail {
  id: number
  emoji: string
  nameEn: string
  nameZh: string
  category: Category
  ingredients: string[]
  method: string
  glass: string
  flavor: string[]
  description: string
  difficulty: number
}

type Category = '全部' | '柑橘清爽' | '花香果香' | '茶系' | '奶系濃郁' | '草本健康' | '氣泡系'

/* ─── Data ─── */
const CATEGORIES: { label: Category; icon: string }[] = [
  { label: '全部', icon: '✨' },
  { label: '柑橘清爽', icon: '🍋' },
  { label: '花香果香', icon: '🌺' },
  { label: '茶系', icon: '🍵' },
  { label: '奶系濃郁', icon: '🥥' },
  { label: '草本健康', icon: '🌿' },
  { label: '氣泡系', icon: '🧊' },
]

const MOCKTAILS: Mocktail[] = [
  {
    id: 1,
    emoji: '🍋',
    nameEn: 'Virgin Mojito',
    nameZh: '無酒精莫希托',
    category: '柑橘清爽',
    ingredients: ['萊姆汁 30ml', '薄荷葉 8片', '糖漿 20ml', '蘇打水 補滿'],
    method: 'Build',
    glass: 'Highball',
    flavor: ['清新', '薄荷', '柑橘'],
    description: '經典 Mojito 的零酒精版，夏日必備的清涼選擇',
    difficulty: 1,
  },
  {
    id: 2,
    emoji: '🍊',
    nameEn: 'Sunrise Cooler',
    nameZh: '日出冷飲',
    category: '柑橘清爽',
    ingredients: ['柳橙汁 120ml', '紅石榴糖漿 15ml', '檸檬汁 15ml', '氣泡水 60ml'],
    method: 'Build',
    glass: 'Highball',
    flavor: ['甜酸', '果香', '視覺效果'],
    description: '模仿 Tequila Sunrise 的漸層效果，橘紅色的美麗日出',
    difficulty: 1,
  },
  {
    id: 3,
    emoji: '🌺',
    nameEn: 'Lavender Lemonade',
    nameZh: '薰衣草檸檬水',
    category: '花香果香',
    ingredients: ['檸檬汁 45ml', '薰衣草糖漿 25ml', '蝶豆花水 30ml', '氣泡水 90ml'],
    method: 'Build',
    glass: 'Collins',
    flavor: ['花香', '清甜', '夢幻紫色'],
    description: '蝶豆花遇到檸檬酸會變色，創造從藍到紫的魔幻效果',
    difficulty: 1,
  },
  {
    id: 4,
    emoji: '🍵',
    nameEn: 'Matcha Fizz',
    nameZh: '抹茶費茲',
    category: '茶系',
    ingredients: ['抹茶粉 2g', '熱水 30ml', '糖漿 20ml', '冰牛奶 60ml', '氣泡水 60ml'],
    method: 'Build',
    glass: 'Highball',
    flavor: ['茶香', '微苦', '奶香'],
    description: '日式抹茶與氣泡的完美結合，苦甜交織的大人味',
    difficulty: 1,
  },
  {
    id: 5,
    emoji: '🥥',
    nameEn: 'Virgin Piña Colada',
    nameZh: '無酒精鳳梨可樂達',
    category: '奶系濃郁',
    ingredients: ['鳳梨汁 120ml', '椰奶 60ml', '椰子糖漿 15ml', '碎冰'],
    method: 'Blend',
    glass: 'Hurricane',
    flavor: ['熱帶', '椰香', '滑順'],
    description: '不需要酒精也能帶你到熱帶海灘，椰香鳳梨的絕佳搭配',
    difficulty: 1,
  },
  {
    id: 6,
    emoji: '🌿',
    nameEn: 'Cucumber Mint Cooler',
    nameZh: '小黃瓜薄荷冷飲',
    category: '草本健康',
    ingredients: ['小黃瓜 5片', '薄荷葉 6片', '萊姆汁 20ml', '蜂蜜 15ml', '蘇打水 150ml'],
    method: 'Muddle & Build',
    glass: 'Collins',
    flavor: ['清新', 'spa感', '解暑'],
    description: '如同 spa 般的舒爽體驗，小黃瓜與薄荷的清新組合',
    difficulty: 1,
  },
  {
    id: 7,
    emoji: '🧊',
    nameEn: 'Ginger Beer Mule',
    nameZh: '無酒精騾子',
    category: '氣泡系',
    ingredients: ['薑汁汽水 180ml', '萊姆汁 30ml', '安格仕苦精 2dash（微量酒精可省略）'],
    method: 'Build',
    glass: 'Copper Mug',
    flavor: ['辛辣', '清爽', '提神'],
    description: 'Moscow Mule 的零酒精版本，薑汁的辛辣感依然帶勁',
    difficulty: 1,
  },
  {
    id: 8,
    emoji: '🍓',
    nameEn: 'Strawberry Basil Smash',
    nameZh: '草莓羅勒碎',
    category: '花香果香',
    ingredients: ['草莓 3顆', '羅勒葉 5片', '檸檬汁 25ml', '糖漿 20ml', '氣泡水 90ml'],
    method: 'Muddle & Build',
    glass: 'Rocks',
    flavor: ['莓果', '草本', '清甜'],
    description: '草莓的甜與羅勒的香草氣息，意想不到的美妙組合',
    difficulty: 1,
  },
  {
    id: 9,
    emoji: '🫖',
    nameEn: 'Earl Grey Sour',
    nameZh: '伯爵茶酸',
    category: '茶系',
    ingredients: ['冷泡伯爵茶 90ml', '檸檬汁 30ml', '蜂蜜糖漿 25ml', '蛋白 1顆（可省略用 aquafaba）'],
    method: 'Dry Shake + Shake',
    glass: 'Coupe',
    flavor: ['茶香', '柑橘', '絲滑泡沫'],
    description: '伯爵茶的佛手柑香氣搭配絲滑蛋白泡沫，優雅的午後選擇',
    difficulty: 2,
  },
  {
    id: 10,
    emoji: '🥭',
    nameEn: 'Mango Lassi Cocktail',
    nameZh: '芒果拉西調酒',
    category: '奶系濃郁',
    ingredients: ['芒果泥 80ml', '優格 60ml', '蜂蜜 15ml', '荳蔻粉少許', '冰塊'],
    method: 'Blend',
    glass: 'Highball',
    flavor: ['熱帶', '奶香', '印度風'],
    description: '印度經典飲品的調酒化呈現，芒果與優格的黃金比例',
    difficulty: 1,
  },
  {
    id: 11,
    emoji: '🌹',
    nameEn: 'Rose Water Spritz',
    nameZh: '玫瑰水氣泡',
    category: '花香果香',
    ingredients: ['玫瑰水 10ml', '石榴汁 30ml', '檸檬汁 15ml', '氣泡水 120ml', '玫瑰花瓣裝飾'],
    method: 'Build',
    glass: 'Wine Glass',
    flavor: ['花香', '優雅', '輕盈'],
    description: '粉紅色的浪漫飲品，玫瑰與石榴的花果交織',
    difficulty: 1,
  },
  {
    id: 12,
    emoji: '🍏',
    nameEn: 'Green Detox',
    nameZh: '綠色排毒',
    category: '草本健康',
    ingredients: ['蘋果汁 90ml', '菠菜一把', '生薑 1cm', '檸檬汁 15ml', '蜂蜜 10ml'],
    method: 'Blend',
    glass: 'Collins',
    flavor: ['清新', '健康', '微辣'],
    description: '滿滿綠色能量的健康飲品，排毒養身的最佳選擇',
    difficulty: 1,
  },
  {
    id: 13,
    emoji: '🫐',
    nameEn: 'Blueberry Shrub Fizz',
    nameZh: '藍莓醋飲',
    category: '氣泡系',
    ingredients: ['藍莓灌木醋（shrub）45ml', '氣泡水 150ml', '萊姆汁 15ml'],
    method: 'Build',
    glass: 'Highball',
    flavor: ['酸甜', '莓果', '清爽'],
    description: '以醋飲為基底的創新氣泡飲，酸甜平衡的大人味',
    difficulty: 1,
  },
  {
    id: 14,
    emoji: '🍫',
    nameEn: 'Chocolate Mint Dream',
    nameZh: '薄荷巧克力夢',
    category: '奶系濃郁',
    ingredients: ['巧克力醬 30ml', '薄荷糖漿 15ml', '牛奶 120ml', '鮮奶油 30ml'],
    method: 'Shake',
    glass: 'Coupe',
    flavor: ['巧克力', '薄荷', '甜蜜'],
    description: '如同液態甜點般的享受，巧克力與薄荷的經典搭配',
    difficulty: 1,
  },
  {
    id: 15,
    emoji: '🫚',
    nameEn: 'Turmeric Golden Tonic',
    nameZh: '薑黃黃金補品',
    category: '草本健康',
    ingredients: ['薑黃粉 1/2茶匙', '生薑汁 15ml', '蜂蜜 20ml', '檸檬汁 20ml', '通寧水 150ml'],
    method: 'Build',
    glass: 'Highball',
    flavor: ['辛辣', '健康', '氣泡'],
    description: '黃金色的健康飲品，薑黃的抗發炎功效搭配通寧水的苦甜',
    difficulty: 1,
  },
  {
    id: 16,
    emoji: '🍑',
    nameEn: 'Peach Bellini',
    nameZh: '無酒精蜜桃貝里尼',
    category: '花香果香',
    ingredients: ['白桃泥 60ml', '檸檬汁 10ml', '糖漿 10ml', '氣泡水 120ml'],
    method: 'Build',
    glass: 'Flute',
    flavor: ['蜜桃', '清甜', '優雅'],
    description: '威尼斯 Harry\'s Bar 經典的零酒精版，蜜桃的優雅香氣',
    difficulty: 1,
  },
  {
    id: 17,
    emoji: '🍉',
    nameEn: 'Watermelon Agua Fresca',
    nameZh: '西瓜清涼飲',
    category: '柑橘清爽',
    ingredients: ['西瓜汁 150ml', '萊姆汁 20ml', '薄荷 3片', '鹽少許'],
    method: 'Build',
    glass: 'Highball',
    flavor: ['清涼', '水果', '夏日'],
    description: '墨西哥傳統消暑飲品，西瓜的天然甜度加一抹鹽提味',
    difficulty: 1,
  },
  {
    id: 18,
    emoji: '🌶️',
    nameEn: 'Spicy Ginger Punch',
    nameZh: '辛辣薑汁潘趣',
    category: '氣泡系',
    ingredients: ['薑汁 30ml', '萊姆汁 20ml', '蜂蜜 25ml', '辣椒片 2片', '蘇打水 120ml'],
    method: 'Build',
    glass: 'Rocks',
    flavor: ['辛辣', '刺激', '暖身'],
    description: '薑的溫暖與辣椒的刺激感，冬天暖身的最佳夥伴',
    difficulty: 1,
  },
  {
    id: 19,
    emoji: '🥑',
    nameEn: 'Avocado Smoothie Cocktail',
    nameZh: '酪梨奶昔調酒',
    category: '奶系濃郁',
    ingredients: ['酪梨 1/2顆', '椰奶 60ml', '蜂蜜 20ml', '萊姆汁 15ml', '冰塊'],
    method: 'Blend',
    glass: 'Rocks',
    flavor: ['滑順', '健康', '熱帶'],
    description: '酪梨的綿密口感搭配椰奶，健康又滿足的綠色飲品',
    difficulty: 1,
  },
  {
    id: 20,
    emoji: '🌸',
    nameEn: 'Cherry Blossom Tonic',
    nameZh: '櫻花通寧',
    category: '花香果香',
    ingredients: ['櫻花糖漿 25ml', '檸檬汁 15ml', '通寧水 150ml', '鹽漬櫻花裝飾'],
    method: 'Build',
    glass: 'Highball',
    flavor: ['花香', '微苦', '日系'],
    description: '日本春天的風味，櫻花的淡雅與通寧水的微苦完美平衡',
    difficulty: 1,
  },
]

const BENEFITS = [
  {
    icon: '💪',
    title: '健康',
    description: '零酒精、低熱量，享受調酒樂趣的同時照顧身體健康',
  },
  {
    icon: '🤝',
    title: '包容',
    description: '無論是指定駕駛、孕期、宗教信仰或個人選擇，每個人都值得一杯好飲品',
  },
  {
    icon: '🎨',
    title: '創意',
    description: '沒有酒精的限制，反而能探索更多食材組合與風味可能性',
  },
  {
    icon: '🌍',
    title: '全場合',
    description: '從商務午餐到家庭聚會，Mocktail 適合任何時間、任何場合',
  },
]

const TIPS = [
  {
    title: '善用醋飲（Shrub）',
    content: '水果醋飲能提供類似酒精的複雜度與深度，是 Mocktail 的秘密武器。自製只需水果＋糖＋醋，靜置一週即可。',
  },
  {
    title: '茶的無限可能',
    content: '冷泡茶是絕佳的 Mocktail 基底——伯爵茶帶柑橘調、茉莉花茶帶花香、焙茶帶烘烤感，每種茶都能創造不同風味。',
  },
  {
    title: '好冰很重要',
    content: '使用大塊透明冰塊能減緩融化速度，避免飲品被稀釋。在家可用保溫杯或矽膠模具製作。',
  },
  {
    title: '苦精的妙用',
    content: '幾滴 Angostura 或 Peychaud\'s 苦精（酒精含量極微）就能增添巨大的風味複雜度。完全不想用酒精也可選擇無酒精苦精。',
  },
  {
    title: '質感升級',
    content: '蛋白或鷹嘴豆水（aquafaba）能創造絲滑泡沫；椰奶增添奶油感；氣泡水帶來活力——質感是好喝的關鍵。',
  },
  {
    title: '裝飾不馬虎',
    content: '一片脫水柑橘輪、一枝新鮮迷迭香、一朵食用花——視覺效果讓 Mocktail 的體驗感大幅提升。',
  },
]

/* ─── Component ─── */
export default function MocktailsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('全部')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filtered =
    activeCategory === '全部'
      ? MOCKTAILS
      : MOCKTAILS.filter((m) => m.category === activeCategory)

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      {/* ── Back Link ── */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors duration-300"
      >
        ← 返回首頁
      </Link>

      {/* ── Page Header ── */}
      <header className="mt-8 mb-10 animate-fade-in-up">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
          Mocktail Lounge
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-4">
          🧉 無酒精調酒
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
          零酒精、全風味——獻給每一位不喝酒也想享受調酒藝術的你
        </p>
        <p className="text-text-secondary text-sm leading-relaxed max-w-3xl mt-3">
          無論你是指定駕駛、孕期媽咪、因宗教或健康原因不飲酒，或純粹享受不含酒精的生活方式——每一個選擇都值得被尊重。
          Mocktail 證明了：好喝的飲品，不需要酒精來定義。
        </p>
        <div className="divider-amber mt-6" />
      </header>

      {/* ── Category Filter Tabs ── */}
      <nav className="mb-10 animate-fade-in-up-delay-1" aria-label="頁面內導覽">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`
                px-4 py-2 rounded-sm font-mono text-xs tracking-wider uppercase transition-all duration-300 border
                ${
                  activeCategory === cat.label
                    ? 'bg-neon-amber text-bg-primary border-neon-amber shadow-[0_0_12px_var(--shadow-neon-amber)]'
                    : 'bg-transparent text-charcoal-300 border-charcoal-700 hover:border-neon-amber hover:text-neon-amber'
                }
              `}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] text-charcoal-500 mt-3">
          顯示 {filtered.length} / {MOCKTAILS.length} 款 Mocktail
        </p>
      </nav>

      {/* ── Recipe Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 animate-fade-in-up-delay-2">
        {/* 卡片標題為 h3；沒有這個 h2，層級會從 h1 直接跳到 h3 */}
        <h2 className="sr-only">無酒精調飲列表</h2>
        {filtered.map((mocktail) => (
          <MocktailCard
            key={mocktail.id}
            mocktail={mocktail}
            expanded={expandedId === mocktail.id}
            onToggle={() =>
              setExpandedId(expandedId === mocktail.id ? null : mocktail.id)
            }
          />
        ))}
      </section>

      {/* ── Why Mocktails ── */}
      <section className="mb-20 animate-fade-in-up">
        <h2 className="font-display text-2xl md:text-3xl text-gradient-amber mb-2">
          為什麼選擇 Mocktail？
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          Why choose a Mocktail?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="glass-card p-6 hover:border-neon-amber transition-colors duration-300"
            >
              <span className="text-3xl mb-4 block">{b.icon}</span>
              <h3 className="font-display text-lg text-neon-amber mb-2">
                {b.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tips Section ── */}
      <section className="mb-20 animate-fade-in-up">
        <h2 className="font-display text-2xl md:text-3xl text-gradient-amber mb-2">
          Mocktail 製作技巧
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          Tips &amp; Techniques
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="glass-card p-6 hover:border-neon-amber transition-colors duration-300"
            >
              <h3 className="font-display text-base text-neon-amber mb-3">
                {tip.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {tip.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-8 border-t border-charcoal-700">
        <p className="font-mono text-[11px] text-charcoal-500 tracking-wider">
          MIXMASTER · MOCKTAIL LOUNGE · 零酒精、全風味
        </p>
      </footer>
    </main>
  )
}

/* ─── Recipe Card ─── */
function MocktailCard({
  mocktail,
  expanded,
  onToggle,
}: {
  mocktail: Mocktail
  expanded: boolean
  onToggle: () => void
}) {
  const categoryIcon =
    CATEGORIES.find((c) => c.label === mocktail.category)?.icon ?? ''

  return (
    <div className="glass-card p-6 hover:border-neon-amber transition-colors duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{mocktail.emoji}</span>
        <span className="font-mono text-[10px] px-2 py-1 rounded-sm bg-charcoal-700/50 text-charcoal-300 border border-charcoal-700">
          {categoryIcon} {mocktail.category}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-display text-lg text-neon-amber mb-1">
        {mocktail.nameZh}
      </h3>
      <p className="font-mono text-[11px] text-charcoal-500 tracking-wide mb-3">
        {mocktail.nameEn}
      </p>

      {/* Method & Glass Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="font-mono text-[10px] px-2 py-1 rounded-sm border border-neon-amber/30 text-neon-amber/80">
          🔧 {mocktail.method}
        </span>
        <span className="font-mono text-[10px] px-2 py-1 rounded-sm border border-neon-amber/30 text-neon-amber/80">
          🥃 {mocktail.glass}
        </span>
        <span className="font-mono text-[10px] px-2 py-1 rounded-sm border border-neon-amber/30 text-neon-amber/80">
          {'⭐'.repeat(mocktail.difficulty)} {mocktail.difficulty === 1 ? 'Easy' : 'Medium'}
        </span>
      </div>

      {/* Flavor tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {mocktail.flavor.map((f) => (
          <span
            key={f}
            className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-neon-amber/10 text-neon-amber/70 border border-neon-amber/20"
          >
            {f}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed mb-4 flex-grow">
        {mocktail.description}
      </p>

      {/* Expand / Collapse */}
      <button
        onClick={onToggle}
        className="btn-neon-amber w-full text-center text-xs py-2"
      >
        {expanded ? '收起 ▲' : '查看配方 ▼'}
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-charcoal-700 animate-fade-in-up">
          <h4 className="font-mono text-xs text-neon-amber tracking-wider uppercase mb-3">
            材料 Ingredients
          </h4>
          <ul className="space-y-1.5 mb-4">
            {mocktail.ingredients.map((ing, i) => (
              <li
                key={i}
                className="font-mono text-xs text-text-secondary flex items-start gap-2"
              >
                <span className="text-neon-amber/60 mt-0.5">◆</span>
                {ing}
              </li>
            ))}
          </ul>
          <div className="flex gap-4 font-mono text-[11px] text-charcoal-500">
            <span>做法：{mocktail.method}</span>
            <span>杯型：{mocktail.glass}</span>
          </div>
        </div>
      )}
    </div>
  )
}
