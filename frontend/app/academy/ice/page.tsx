'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const sections = [
  { id: 'science', label: '🔬 冰的科學' },
  { id: 'types', label: '🧊 冰塊類型' },
  { id: 'techniques', label: '🛠️ 製冰技法' },
  { id: 'flavor', label: '🎯 冰與風味' },
  { id: 'tips', label: '💡 Pro Tips' },
] as const

interface IceType {
  emoji: string
  name: string
  engName: string
  size?: string
  usage: string
  pros: string
  method: string
  glass: string
}

const iceTypes: IceType[] = [
  {
    emoji: '🔮',
    name: '大冰球',
    engName: 'Large Ice Sphere',
    size: '直徑 6-7cm',
    usage: 'Old Fashioned, Whisky on the Rocks',
    pros: '最慢融化、最少稀釋、視覺震撼',
    method: '專用冰球模具或日式手切',
    glass: 'Rocks Glass',
  },
  {
    emoji: '🧊',
    name: '大方冰',
    engName: 'Large Cube',
    size: '5cm 見方',
    usage: 'Negroni, 任何需要慢稀釋的短飲',
    pros: '穩定融化速率、易製作',
    method: '矽膠模具，定向冷凍法',
    glass: 'Rocks Glass, DOF',
  },
  {
    emoji: '💎',
    name: '標準冰塊',
    engName: 'Standard Cubes',
    size: '2.5-3cm',
    usage: 'Highball, 搖盪用冰、大部分調酒',
    pros: '多功能、易取得',
    method: '一般製冰機或冰盒',
    glass: 'Highball, Collins',
  },
  {
    emoji: '❄️',
    name: '碎冰',
    engName: 'Crushed Ice',
    usage: 'Julep, Cobbler, Swizzle, Tiki 調酒',
    pros: '極快冷卻、增加稀釋、創造雪泥質感',
    method: 'Lewis Bag + 木槌，或碎冰機',
    glass: 'Julep Cup, Tiki Mug',
  },
  {
    emoji: '🗡️',
    name: '冰矛',
    engName: 'Ice Spear / Collins Spear',
    usage: 'Collins, Highball, 長飲',
    pros: '完美配合長杯型、慢融化、美觀',
    method: '長條矽膠模具',
    glass: 'Collins Glass, Highball',
  },
  {
    emoji: '💠',
    name: '鑽石冰',
    engName: 'Diamond Ice',
    usage: '高端威士忌服務、展示型調酒',
    pros: '多面折射光線、緩慢融化、極致美學',
    method: '日式手切冰技法',
    glass: 'Rocks Glass',
  },
  {
    emoji: '🌊',
    name: '冰磚',
    engName: 'Block Ice',
    usage: 'Punch Bowl, 大型批次調酒',
    pros: '極慢融化、適合大量服務',
    method: '大型容器冷凍',
    glass: 'Punch Bowl',
  },
  {
    emoji: '🫧',
    name: '空心冰球',
    engName: 'Hollow Ice Sphere',
    usage: 'Espresso Martini 表演、高端服務',
    pros: '可在球內填入調酒，敲破後釋出',
    method: '氣球法或專用模具',
    glass: '各式',
  },
]

interface DilutionRow {
  type: string
  min1: string
  min3: string
  min5: string
  min10: string
}

const dilutionData: DilutionRow[] = [
  { type: '大冰球', min1: '3%', min3: '8%', min5: '12%', min10: '18%' },
  { type: '大方冰', min1: '4%', min3: '10%', min5: '15%', min10: '22%' },
  { type: '標準冰塊', min1: '6%', min3: '15%', min5: '22%', min10: '35%' },
  { type: '碎冰', min1: '12%', min3: '28%', min5: '40%', min10: '55%' },
  { type: '冰矛', min1: '3%', min3: '9%', min5: '13%', min10: '20%' },
]

interface TempRow {
  drink: string
  temp: string
  note: string
}

const tempData: TempRow[] = [
  { drink: 'Stirred 短飲 (Martini)', temp: '-2°C ~ 0°C', note: '冰冷銳利' },
  { drink: 'Shaken 短飲 (Daiquiri)', temp: '-4°C ~ -1°C', note: '極冷、有稀釋' },
  { drink: 'Highball 長飲', temp: '2°C ~ 5°C', note: '清爽持久' },
  { drink: 'On the Rocks', temp: '0°C ~ 4°C', note: '隨時間變化' },
  { drink: 'Tiki / Crushed Ice', temp: '-2°C ~ 2°C', note: '快速冷卻' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function IceEncyclopediaPage() {
  const [activeSection, setActiveSection] = useState<string>('science')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const scrollTo = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* Intersection Observer for active section tracking */
  useEffect(() => {
    const ids = sections.map((s) => s.id)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-12 max-w-6xl mx-auto text-center">
        <Link
          href="/academy"
          className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-8"
        >
          ← 返回學院
        </Link>

        <p className="font-mono text-neon-cyan text-xs tracking-[0.3em] uppercase mb-4 animate-fade-in">
          THE ART OF ICE
        </p>

        <h1
          className={`font-display text-5xl md:text-6xl text-gradient-amber leading-tight mb-6 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          🧊 冰塊百科
        </h1>

        <p className="text-text-secondary max-w-2xl mx-auto text-lg animate-fade-in-up">
          冰塊不只是冷卻工具——它是調酒中最被低估的材料
        </p>

        <div className="divider-amber mx-auto mt-10 mb-2" />
      </section>

      {/* ── Sticky Section Nav ───────────────────────────────── */}
      <nav className="sticky top-16 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-charcoal-800" aria-label="頁面內導覽">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto py-2 scrollbar-hide">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-mono text-xs transition-all duration-300 ${
                activeSection === s.id
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40'
                  : 'text-charcoal-500 hover:text-text-primary border border-transparent'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-24">
        {/* ── Section 1: Science ─────────────────────────────── */}
        <section id="science" className="pt-16 pb-12">
          <SectionHeader
            emoji="🔬"
            title="冰的科學"
            eng="The Science of Ice"
          />

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <ScienceCard
              index={0}
              title="水質對冰的影響"
              content={
                <>
                  <strong className="text-neon-cyan">過濾水</strong> 是最佳選擇——去除氯氣與礦物質，
                  冰塊乾淨透明。<strong className="text-neon-cyan">自來水</strong> 含氯及雜質，
                  冰塊白濁有異味。<strong className="text-neon-cyan">蒸餾水</strong> 最純，
                  但缺乏礦物質，凍結後質地偏軟。理想做法：使用家用濾水器過濾的冷水。
                </>
              }
            />

            <ScienceCard
              index={1}
              title="透明冰 (Clear Ice) 的秘密"
              content={
                <>
                  混濁冰的白色來自被<strong className="text-neon-cyan">困住的氣泡</strong>
                  與溶解雜質。這些氣泡會增加表面積，加速融化。透明冰密度更高、結構更緊密，
                  因此融化速率更慢、稀釋更少。視覺上也更顯專業與精緻。
                </>
              }
            />

            <ScienceCard
              index={2}
              title="融化速率與表面積"
              content={
                <>
                  冰的融化遵循一個物理定律：
                  <strong className="text-neon-cyan">體積越大，表面積與體積的比值越小，融化越慢</strong>。
                  球體是所有形狀中表面積比最小的——這就是為什麼大冰球在 On the Rocks 中表現最佳。
                  碎冰的總表面積最大，所以融化最快。
                </>
              }
            />

            <ScienceCard
              index={3}
              title="稀釋度 (Dilution) — 隱藏的材料"
              content={
                <>
                  調酒師不會說「加冰」，而是思考「需要多少稀釋」。
                  <strong className="text-neon-cyan">適當的稀釋可以打開風味</strong>——
                  就像威士忌加幾滴水一樣。過多稀釋則會稀薄口感。攪拌 (Stir) 約產生 20-25% 稀釋，
                  搖盪 (Shake) 約 25-30%。冰的選擇直接決定了稀釋的速度與總量。
                </>
              }
            />
          </div>
        </section>

        {/* ── Section 2: Ice Types ───────────────────────────── */}
        <section id="types" className="pt-16 pb-12">
          <SectionHeader
            emoji="🧊"
            title="冰塊類型"
            eng="Ice Types"
          />

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {iceTypes.map((ice, i) => (
              <IceCard key={ice.engName} ice={ice} index={i} />
            ))}
          </div>
        </section>

        {/* ── Section 3: Techniques ──────────────────────────── */}
        <section id="techniques" className="pt-16 pb-12">
          <SectionHeader
            emoji="🛠️"
            title="製冰技法"
            eng="Ice Making Techniques"
          />

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <TechniqueCard
              index={0}
              title="定向冷凍法"
              eng="Directional Freezing"
              steps={[
                '準備一個保冷箱（隔熱容器），不加蓋',
                '裝入過濾水至容器的 2/3 高度',
                '放入冰箱冷凍庫 24-36 小時',
                '水會從頂部開始結冰，將氣泡與雜質推向底部',
                '取出後切掉底部混濁的 1/3',
                '上方的透明冰塊即可切割使用',
              ]}
            />

            <TechniqueCard
              index={1}
              title="日式手切冰"
              eng="Japanese Hand-Cut Ice"
              steps={[
                '從大冰塊（定向冷凍或購買）開始',
                '使用冰鑿 (Ice Pick) 沿著紋路劈開分塊',
                '用刀具修整基本形狀',
                '以旋轉削切法將方冰雕成球形',
                '過程需保持冰塊乾燥，工作快速',
                '日本酒吧視此為一種藝術表演',
              ]}
            />

            <TechniqueCard
              index={2}
              title="Lewis Bag 碎冰法"
              eng="Lewis Bag Method"
              steps={[
                '將冰塊放入 Lewis Bag（帆布袋）',
                '帆布會吸收多餘水分',
                '使用木槌 (Mallet) 敲碎至所需大小',
                '碎冰質地均勻且較乾燥',
                '適合 Julep、Cobbler、Swizzle 等調酒',
                '比機器碎冰更能控制顆粒大小',
              ]}
            />

            <TechniqueCard
              index={3}
              title="家用透明冰技巧"
              eng="Home Clear Ice Hack"
              steps={[
                '將過濾水煮沸一次，放涼',
                '再次煮沸以去除溶解氣體',
                '倒入隔熱容器中（保溫瓶、保冷箱皆可）',
                '不加蓋，放入冷凍庫',
                '冷凍 18-24 小時（不要完全凍透）',
                '取出後分切，享受接近專業級的透明冰',
              ]}
            />
          </div>
        </section>

        {/* ── Section 4: Ice & Flavor ────────────────────────── */}
        <section id="flavor" className="pt-16 pb-12">
          <SectionHeader
            emoji="🎯"
            title="冰與風味的關係"
            eng="Ice & Flavor Interaction"
          />

          {/* Dilution Table */}
          <div className="mt-10">
            <h3 className="font-display text-xl text-text-primary mb-4">
              稀釋率對比 <span className="text-charcoal-500 font-mono text-sm">(Dilution Rate Comparison)</span>
            </h3>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-charcoal-700">
                      <th className="text-left px-5 py-4 font-mono text-neon-cyan text-xs tracking-wider">冰塊類型</th>
                      <th className="text-center px-5 py-4 font-mono text-neon-cyan text-xs tracking-wider">1 分鐘</th>
                      <th className="text-center px-5 py-4 font-mono text-neon-cyan text-xs tracking-wider">3 分鐘</th>
                      <th className="text-center px-5 py-4 font-mono text-neon-cyan text-xs tracking-wider">5 分鐘</th>
                      <th className="text-center px-5 py-4 font-mono text-neon-cyan text-xs tracking-wider">10 分鐘</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dilutionData.map((row, i) => (
                      <tr
                        key={row.type}
                        className={`border-b border-charcoal-800 transition-colors hover:bg-neon-cyan/5 ${
                          i % 2 === 0 ? 'bg-bg-secondary/30' : ''
                        }`}
                      >
                        <td className="px-5 py-3 font-medium text-text-primary">{row.type}</td>
                        <td className="text-center px-5 py-3 text-text-secondary">{row.min1}</td>
                        <td className="text-center px-5 py-3 text-text-secondary">{row.min3}</td>
                        <td className="text-center px-5 py-3 text-neon-amber font-mono">{row.min5}</td>
                        <td className="text-center px-5 py-3 text-text-secondary">{row.min10}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-5 py-3 text-charcoal-500 text-xs font-mono border-t border-charcoal-800">
                * 數據為室溫 (22°C) 下 240ml 液體中的近似值，實際結果因環境而異
              </p>
            </div>
          </div>

          {/* Temperature Table */}
          <div className="mt-10">
            <h3 className="font-display text-xl text-text-primary mb-4">
              最佳服務溫度 <span className="text-charcoal-500 font-mono text-sm">(Ideal Serving Temperature)</span>
            </h3>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-charcoal-700">
                      <th className="text-left px-5 py-4 font-mono text-neon-cyan text-xs tracking-wider">調酒類型</th>
                      <th className="text-center px-5 py-4 font-mono text-neon-cyan text-xs tracking-wider">溫度範圍</th>
                      <th className="text-left px-5 py-4 font-mono text-neon-cyan text-xs tracking-wider">口感特徵</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempData.map((row, i) => (
                      <tr
                        key={row.drink}
                        className={`border-b border-charcoal-800 transition-colors hover:bg-neon-cyan/5 ${
                          i % 2 === 0 ? 'bg-bg-secondary/30' : ''
                        }`}
                      >
                        <td className="px-5 py-3 font-medium text-text-primary">{row.drink}</td>
                        <td className="text-center px-5 py-3 font-mono text-neon-amber">{row.temp}</td>
                        <td className="px-5 py-3 text-text-secondary">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Stir vs Shake */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 border-l-2 border-l-neon-amber">
              <h4 className="font-display text-lg text-neon-amber mb-3">🥄 攪拌 (Stirring)</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-neon-amber mt-0.5">▸</span>
                  <span>稀釋率約 <strong className="text-text-primary">20-25%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-amber mt-0.5">▸</span>
                  <span>冰塊接觸溫和，融化較慢</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-amber mt-0.5">▸</span>
                  <span>保持酒體的絲滑質感 (Silky Texture)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-amber mt-0.5">▸</span>
                  <span>適合：烈酒為主的調酒（Martini, Manhattan, Negroni）</span>
                </li>
              </ul>
            </div>

            <div className="glass-card p-6 border-l-2 border-l-neon-cyan">
              <h4 className="font-display text-lg text-neon-cyan mb-3">🍸 搖盪 (Shaking)</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan mt-0.5">▸</span>
                  <span>稀釋率約 <strong className="text-text-primary">25-30%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan mt-0.5">▸</span>
                  <span>冰塊劇烈撞擊，碎裂後融化快速</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan mt-0.5">▸</span>
                  <span>產生微小氣泡，帶來輕盈口感 (Aeration)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-cyan mt-0.5">▸</span>
                  <span>適合：含果汁 / 蛋白的調酒（Sour, Daiquiri, Margarita）</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Section 5: Pro Tips ────────────────────────────── */}
        <section id="tips" className="pt-16 pb-12">
          <SectionHeader
            emoji="💡"
            title="Pro Tips"
            eng="Professional Advice"
          />

          <div className="grid gap-6 mt-10">
            <ProTipCard
              index={0}
              title="為何酒吧用的冰比家用的好？"
              items={[
                '商用製冰機使用循環水系統，水在結冰時不斷流動，氣泡被排出',
                '製冰溫度控制精確（通常 -12°C 至 -8°C），結冰速度慢而均勻',
                '使用過濾水系統，去除氯氣、礦物質與有機物',
                '冰塊從模具中脫模後會經過 Tempering（回溫靜置），讓冰塊更不易碎裂',
              ]}
            />

            <ProTipCard
              index={1}
              title="如何在家製作接近酒吧品質的冰？"
              items={[
                '使用 Brita 等家用濾水壺過濾自來水',
                '定向冷凍法是最有效的透明冰技巧——用保冷箱，不加蓋',
                '冷凍時間 24-30 小時，不要完全凍透（底部保留液態水）',
                '切割時使用鋸齒刀或熱水浸泡法分切',
                '切好的冰塊可以放入密封袋中保存，防止沾染冰箱異味',
              ]}
            />

            <ProTipCard
              index={2}
              title="冰的保存：避免冰箱異味吸附"
              items={[
                '冰塊是天然的氣味吸附劑——暴露的冰會吸收冰箱裡的所有味道',
                '製作完成後立即移入密封袋或密封容器中',
                '冰箱中放置小蘇打盒可減少異味',
                '使用前聞一下冰塊——如果有異味就不要使用',
                '最佳做法：調酒前 30 分鐘才從冷凍庫取出，讓冰塊稍微回溫至 -5°C 左右',
              ]}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionHeader({ emoji, title, eng }: { emoji: string; title: string; eng: string }) {
  return (
    <div className="animate-fade-in-up">
      <p className="font-mono text-neon-cyan text-xs tracking-[0.3em] uppercase mb-2">{eng}</p>
      <h2 className="font-display text-3xl md:text-4xl text-gradient-amber leading-tight">
        {emoji} {title}
      </h2>
      <div className="divider-amber mt-4" />
    </div>
  )
}

function ScienceCard({
  index,
  title,
  content,
}: {
  index: number
  title: string
  content: React.ReactNode
}) {
  const delayClass =
    index === 0
      ? 'animate-fade-in-up'
      : index === 1
        ? 'animate-fade-in-up-delay-1'
        : index === 2
          ? 'animate-fade-in-up-delay-2'
          : 'animate-fade-in-up-delay-3'

  return (
    <div className={`glass-card p-6 hover:border-neon-cyan/40 transition-colors duration-300 ${delayClass}`}>
      <h3 className="font-display text-lg text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{content}</p>
    </div>
  )
}

function IceCard({ ice, index }: { ice: IceType; index: number }) {
  const delayClass =
    index % 4 === 0
      ? 'animate-fade-in-up'
      : index % 4 === 1
        ? 'animate-fade-in-up-delay-1'
        : index % 4 === 2
          ? 'animate-fade-in-up-delay-2'
          : 'animate-fade-in-up-delay-3'

  return (
    <div
      className={`glass-card p-6 hover:border-neon-cyan/40 transition-all duration-300 group ${delayClass}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">{ice.emoji}</span>
        <div>
          <h3 className="font-display text-lg text-text-primary group-hover:text-neon-cyan transition-colors">
            {ice.name}
          </h3>
          <p className="font-mono text-xs text-charcoal-500">
            {ice.engName}
            {ice.size && <span className="ml-2 text-neon-cyan/70">({ice.size})</span>}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5 text-sm">
        <div className="flex items-start gap-2">
          <span className="font-mono text-xs text-neon-amber min-w-[3.5rem]">用途</span>
          <span className="text-text-secondary">{ice.usage}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-xs text-neon-amber min-w-[3.5rem]">優點</span>
          <span className="text-text-secondary">{ice.pros}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-xs text-neon-amber min-w-[3.5rem]">製作</span>
          <span className="text-text-secondary">{ice.method}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-xs text-neon-amber min-w-[3.5rem]">杯型</span>
          <span className="font-mono text-xs text-neon-cyan/80">{ice.glass}</span>
        </div>
      </div>
    </div>
  )
}

function TechniqueCard({
  index,
  title,
  eng,
  steps,
}: {
  index: number
  title: string
  eng: string
  steps: string[]
}) {
  const delayClass =
    index % 4 === 0
      ? 'animate-fade-in-up'
      : index % 4 === 1
        ? 'animate-fade-in-up-delay-1'
        : index % 4 === 2
          ? 'animate-fade-in-up-delay-2'
          : 'animate-fade-in-up-delay-3'

  return (
    <div className={`glass-card p-6 hover:border-neon-cyan/40 transition-colors duration-300 ${delayClass}`}>
      <h3 className="font-display text-lg text-text-primary mb-1">{title}</h3>
      <p className="font-mono text-xs text-charcoal-500 mb-4">{eng}</p>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
            <span className="font-mono text-xs text-neon-cyan bg-neon-cyan/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ProTipCard({
  index,
  title,
  items,
}: {
  index: number
  title: string
  items: string[]
}) {
  const delayClass =
    index === 0
      ? 'animate-fade-in-up'
      : index === 1
        ? 'animate-fade-in-up-delay-1'
        : 'animate-fade-in-up-delay-2'

  return (
    <div className={`glass-card p-6 hover:border-neon-amber/40 transition-colors duration-300 ${delayClass}`}>
      <h3 className="font-display text-lg text-neon-amber mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="text-neon-amber mt-0.5">▸</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
