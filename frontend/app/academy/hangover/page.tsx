'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AcademyTracker from '../../../components/AcademyTracker'

/* ──────────────────────────────────────────────────────────
   Hangover Prevention & Myth Busters — 宿醉防治指南
   ────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: 'science',   label: '宿醉科學',   en: 'Science' },
  { id: 'before',    label: '飲前準備',   en: 'Before' },
  { id: 'during',    label: '飲中策略',   en: 'During' },
  { id: 'after',     label: '飲後恢復',   en: 'After' },
  { id: 'myths',     label: '迷思破解',   en: 'Myths' },
  { id: 'drinks',    label: '標準飲品',   en: 'Drinks' },
  { id: 'warning',   label: '危險信號',   en: 'Warning' },
]

/* ── Section 2: Before Drinking ───────────────────────────── */
const beforeTips = [
  {
    icon: '🍽️',
    title: '飽腹進食 (Eat Before Drinking)',
    desc: '飲酒前至少 30 分鐘進食高蛋白、高脂肪食物。食物會減緩胃排空速度（Gastric Emptying），讓酒精更慢進入小腸——吸收速度可降低 30–50%。推薦食物：堅果、酪梨、橄欖油義大利麵、鮭魚。',
  },
  {
    icon: '💧',
    title: '預先補水 500ml (Pre-Hydrate)',
    desc: '飲酒前 1 小時飲用至少 500ml 水。酒精是強效利尿劑——每飲用 1g 酒精，身體會額外排出約 10ml 水分。預先建立水分儲備，可有效緩衝脫水效應。',
  },
  {
    icon: '💊',
    title: '補充 B 群與維生素 C (B & C Vitamins)',
    desc: '酒精代謝會大量消耗 B1（硫胺素）、B6、B12 和維生素 C。飲酒前補充一顆綜合 B 群 + 500mg 維生素 C，為身體建立營養緩衝。注意：這不是免死金牌，只是減輕損傷。',
  },
  {
    icon: '🥛',
    title: '牛奶或優格 (Milk or Yogurt)',
    desc: '乳製品能在胃壁形成一層保護膜，減緩酒精對胃黏膜的直接刺激。優格中的益生菌還有助於維持腸道菌群平衡——酒精會破壞腸道屏障，引發發炎反應。',
  },
  {
    icon: '🚫',
    title: '絕對避免空腹 (Never Drink on Empty)',
    desc: '空腹飲酒是宿醉的最大催化劑。空腹時酒精在 15–30 分鐘內幾乎完全吸收，血液酒精濃度（BAC）峰值可比飽腹時高出 3 倍。這不只是宿醉問題——更是急性酒精中毒的風險因素。',
  },
]

/* ── Section 3: While Drinking ────────────────────────────── */
const duringTips = [
  {
    icon: '🚰',
    title: '1:1 補水法則 (The 1:1 Water Rule)',
    desc: '每喝一杯酒，就喝一杯等量的水。這是最簡單有效的防宿醉策略——既能減緩飲酒速度，又能對抗脫水。在酒吧點水完全不丟臉，真正的行家都這麼做。',
  },
  {
    icon: '⏱️',
    title: '控制飲酒節奏 (Pace Yourself)',
    desc: '人體肝臟每小時只能代謝約 7–10g 純酒精（約等於一個標準飲品）。超過這個速度，酒精就會在血液中累積。建議每小時不超過一個標準飲品，給肝臟足夠的處理時間。',
  },
  {
    icon: '🥃',
    title: '選擇淺色烈酒 (Choose Light Spirits)',
    desc: '同族物（Congeners）是發酵副產物，是加劇宿醉的元兇之一。深色酒款（波本威士忌、白蘭地、深色蘭姆酒）含有大量同族物。伏特加和琴酒的同族物含量最低——如果你容易宿醉，選擇透明烈酒。',
  },
  {
    icon: '🔀',
    title: '避免混飲 (Don\'t Mix Drinks)',
    desc: '混合不同種類的酒會引入多種同族物，增加肝臟的代謝負擔。此外，頻繁換酒讓你更難追蹤實際攝入量。選定一種酒，整晚堅持——你的明天會感謝你。',
  },
  {
    icon: '🍬',
    title: '警惕高糖調酒 (Watch Sugar Content)',
    desc: '高糖飲品（Margarita、Piña Colada、甜味利口酒）會掩蓋酒精感，讓你不知不覺喝更多。更糟糕的是，糖分會加速酒精吸收，同時酒精和果糖競爭肝臟代謝通道，延長兩者在體內的停留時間。',
  },
  {
    icon: '📝',
    title: '追蹤飲酒量 (Track Your Intake)',
    desc: '用手機備忘錄或 App 記錄每杯酒的時間和份量。大多數人嚴重低估自己的飲酒量——研究顯示平均低估 30–40%。了解自己的極限，設定上限（建議男性每晚 ≤4 標準飲品，女性 ≤3）。',
  },
]

/* ── Section 4: After Drinking ────────────────────────────── */
const afterTips = [
  {
    icon: '🌙',
    title: '睡前補水 (Hydrate Before Bed)',
    desc: '睡前慢慢喝完 500–750ml 的水（一次灌太快會引起噁心）。在床頭再放一瓶水——你半夜很可能會被渴醒。加入少許海鹽或電解質粉效果更佳。',
  },
  {
    icon: '🍌',
    title: '補充電解質 (Replenish Electrolytes)',
    desc: '酒精利尿作用會帶走大量鉀、鈉、鎂等電解質。香蕉（富含鉀）、椰子水（天然電解質飲料）、或運動飲料都是好選擇。避免能量飲料——咖啡因會加劇脫水。',
  },
  {
    icon: '😴',
    title: '優先保證睡眠 (Prioritize Sleep)',
    desc: '酒精會嚴重干擾 REM 快速動眼期睡眠——即使睡了 8 小時，睡眠品質也大打折扣。盡可能延長睡眠時間，不要設鬧鐘。黑暗、涼爽的環境有助於身體修復。',
  },
  {
    icon: '🍳',
    title: '隔日早餐：雞蛋+吐司+蜂蜜 (Morning Recovery Meal)',
    desc: '雞蛋含有半胱氨酸（Cysteine），能幫助分解宿醉元兇乙醛。吐司提供容易消化的碳水化合物，穩定血糖。蜂蜜含有果糖，可加速酒精代謝。這三樣是科學支持的宿醉早餐組合。',
  },
  {
    icon: '🚿',
    title: '冷水澡的迷思 (Cold Shower Myth)',
    desc: '冷水澡可以讓你「清醒」，但不會加速酒精代謝——它只是透過刺激交感神經讓你暫時更警覺。事實上，酒後洗澡有風險：酒精擴張血管 + 熱水可能導致血壓驟降暈倒。如果要洗，用溫水且時間別太長。',
  },
]

/* ── Section 5: Myth Busters ──────────────────────────────── */
const myths = [
  {
    verdict: false,
    claim: '「以毒攻毒」隔天再喝一杯就好 (Hair of the Dog)',
    truth: '這只是延遲宿醉，不是治癒。你在宿醉時再喝酒，等於讓肝臟重新開始代謝循環——暫時抑制了戒斷症狀，但酒精完全代謝後宿醉會加倍回來。長期這樣做是酒精依賴（Alcohol Dependence）的危險信號。',
  },
  {
    verdict: false,
    claim: '喝咖啡能解宿醉 (Coffee Cures Hangovers)',
    truth: '咖啡因是興奮劑，能暫時緩解宿醉的疲倦感和頭痛，但它同時也是利尿劑——會加劇脫水，而脫水正是宿醉的主因之一。咖啡給你的只是「感覺好了」的錯覺，實際上可能讓身體狀況更糟。如果要喝，控制在一杯以內，並搭配大量的水。',
  },
  {
    verdict: false,
    claim: '催吐可以減輕宿醉 (Vomiting Helps)',
    truth: '在你「感覺喝多了」的時候，大部分酒精已經被小腸吸收進入血液。催吐無法清除血液中的酒精，反而會損傷食道（胃酸腐蝕）、造成電解質嚴重失衡、甚至有吸入性肺炎的風險。永遠不要刻意催吐。',
  },
  {
    verdict: false,
    claim: '「先啤後烈更安全」(Beer Before Liquor)',
    truth: '經典的 "Beer before liquor, never been sicker; liquor before beer, you\'re in the clear" 完全是迷思。2019 年劍橋大學的隨機對照試驗（RCT）明確證實：決定宿醉嚴重程度的是酒精總攝入量和個人體質，與飲酒順序無關。',
  },
  {
    verdict: true,
    claim: '深色酒宿醉更嚴重 (Dark Spirits = Worse Hangover)',
    truth: '這是真的！2010 年《Alcoholism: Clinical and Experimental Research》期刊的研究顯示：波本威士忌（Bourbon）的同族物含量是伏特加（Vodka）的 37 倍。飲用波本的受試者在宿醉嚴重程度、睡眠品質、認知表現各方面都明顯更差。如果你易宿醉，選伏特加而非波本。',
  },
  {
    verdict: false,
    claim: '解酒藥真的有效 (Hangover Pills Work)',
    truth: '市面上大多數「解酒丸」缺乏嚴謹的臨床證據。部分產品含有 DHM（二氫楊梅素）或 NAC（N-乙醯半胱氨酸），在動物實驗中顯示了一些潛力，但人體試驗結果不一致。目前沒有任何 FDA 或同等級監管機構認證的「解酒藥」。最有效的防宿醉措施永遠是——少喝。',
  },
  {
    verdict: true,
    claim: '吃東西能減緩醉意 (Food Slows Intoxication)',
    truth: '完全正確。食物（尤其是蛋白質和脂肪）會延緩胃排空（Gastric Emptying），讓酒精更慢進入小腸被吸收。有食物的胃可以讓血液酒精濃度（BAC）的峰值降低約 30–50%，達到峰值的時間也更晚。這就是為什麼「飲前進食」是第一條建議。',
  },
  {
    verdict: false,
    claim: '運動流汗能排酒精 (Sweating It Out)',
    truth: '汗液中的酒精含量極低——人體約 90–95% 的酒精由肝臟代謝，只有 2–5% 通過汗液、尿液、呼吸排出。宿醉時劇烈運動反而危險：脫水加劇、心率已經偏高、協調能力下降增加受傷風險。如果要動，輕度散步就好。',
  },
]

/* ── Section 6: Standard Drinks Table ─────────────────────── */
const standardDrinks = [
  { name: '啤酒 (Beer)',           vol: '350ml', abv: '5%',  pure: '14g',   std: '1.0' },
  { name: '紅酒 (Red Wine)',       vol: '150ml', abv: '13%', pure: '15.6g', std: '1.1' },
  { name: '清酒 (Sake)',           vol: '180ml', abv: '15%', pure: '21.6g', std: '1.5' },
  { name: '烈酒 (Spirits)',        vol: '45ml',  abv: '40%', pure: '14.4g', std: '1.0' },
  { name: 'Margarita',            vol: '200ml', abv: '13%', pure: '20.8g', std: '1.5' },
  { name: 'Long Island Iced Tea', vol: '250ml', abv: '22%', pure: '44g',   std: '3.1' },
]

/* ── Section 7: Warning Signs ─────────────────────────────── */
const warningCards = [
  {
    level: 'amber' as const,
    icon: '🟡',
    title: '何時應該停止飲酒 (When to Stop)',
    signs: [
      '言語開始含糊不清（Slurred Speech）',
      '協調能力明顯下降、走路不穩',
      '判斷力減退——覺得「再喝一杯也沒關係」',
      '視覺模糊或出現複視',
      '情緒變化劇烈（突然暴怒或哭泣）',
      '感到噁心或頭暈',
    ],
  },
  {
    level: 'red' as const,
    icon: '🔴',
    title: '酒精中毒症狀——立即求救 (Alcohol Poisoning)',
    signs: [
      '意識混亂或完全失去意識、無法被喚醒',
      '嘔吐不止（尤其是昏迷狀態下嘔吐——窒息風險極高）',
      '呼吸頻率低於每分鐘 8 次，或呼吸間隔超過 10 秒',
      '皮膚冰冷、蒼白或發紫（尤其指甲和嘴唇）',
      '體溫過低（Hypothermia）',
      '癲癇發作（Seizures）',
    ],
  },
  {
    level: 'red' as const,
    icon: '🚨',
    title: '緊急處理與聯繫方式 (Emergency Contacts)',
    signs: [
      '台灣急救電話：119',
      '毒藥物諮詢中心：(02) 2871-7121',
      '安心專線（心理支持）：1925',
      '讓患者保持側臥（Recovery Position），防止嘔吐物阻塞呼吸道',
      '不要讓醉酒者獨處——持續觀察至少 6 小時',
      '不要嘗試用咖啡、冷水或食物「解酒」——直接送醫',
    ],
  },
]

/* ══════════════════════════════════════════════════════════════
   Page Component
   ══════════════════════════════════════════════════════════════ */

export default function HangoverGuidePage() {
  const [activeSection, setActiveSection] = useState('science')

  useEffect(() => {
    const handleScroll = () => {
      const offsets = SECTIONS.map(s => {
        const el = document.getElementById(s.id)
        return { id: s.id, top: el ? el.getBoundingClientRect().top : Infinity }
      })
      const current = offsets.reduce((closest, s) =>
        Math.abs(s.top - 80) < Math.abs(closest.top - 80) ? s : closest
      )
      setActiveSection(current.id)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="hangover" />

      {/* ── Section Nav (sticky) ──────────────────────────── */}
      <nav className="sticky top-16 z-30 bg-bg-secondary/90 backdrop-blur-md border-b border-charcoal-700">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto scrollbar-hide py-2">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded font-mono text-xs transition-colors duration-200 ${
                activeSection === s.id
                  ? 'bg-neon-amber/20 text-neon-amber border border-neon-amber/40'
                  : 'text-charcoal-500 hover:text-text-warm border border-transparent'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Hero / Header ─────────────────────────────────── */}
      <section className="px-6 pt-20 pb-8 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors inline-flex items-center gap-1 mb-8"
        >
          ← 返回學院 Back to Academy
        </Link>

        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in-up">
          Hangover Prevention Guide
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-4 animate-fade-in-up">
          💊 宿醉防治指南
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed max-w-3xl animate-fade-in-up">
          理性飲酒、科學預防——讓每次品飲都是美好體驗
        </p>

        {/* Responsible Drinking Disclaimer */}
        <div className="mt-8 glass-card p-6 border-l-4 border-neon-amber animate-fade-in-up">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <h3 className="font-display text-base text-neon-amber mb-1">
                負責任飲酒聲明 (Responsible Drinking Disclaimer)
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                本指南旨在提供科學資訊，幫助讀者做出更明智的飲酒決定。
                <strong className="text-text-warm">預防宿醉最有效的方法永遠是適量飲酒或不飲酒。</strong>
                {' '}未滿法定飲酒年齡者請勿飲酒。孕婦、服藥者、肝臟疾病患者應完全避免酒精。
                如果您認為自己可能有酒精依賴問題，請立即尋求專業醫療協助。
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-amber max-w-6xl mx-auto" />

      {/* ── S1: The Science of Hangovers ──────────────────── */}
      <section id="science" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in-up">
          The Science of Hangovers
        </p>
        <h2 className="font-display text-3xl text-gradient-amber mb-8 animate-fade-in-up">
          宿醉的科學
        </h2>

        {/* Metabolic Pathway Diagram */}
        <div className="glass-card p-8 mb-8 animate-fade-in-up overflow-x-auto">
          <h3 className="font-display text-lg text-text-warm mb-6">
            酒精代謝路徑 <span className="font-mono text-xs text-charcoal-500 ml-2">Metabolic Pathway</span>
          </h3>
          <div className="flex items-center justify-start gap-0 min-w-[640px]">
            {/* Ethanol */}
            <div className="flex flex-col items-center">
              <div className="bg-neon-amber/15 border border-neon-amber/50 rounded-lg px-5 py-3 text-center">
                <span className="font-display text-lg text-neon-amber block">乙醇</span>
                <span className="font-mono text-xs text-charcoal-300">Ethanol</span>
              </div>
            </div>
            {/* Arrow 1 */}
            <div className="flex flex-col items-center px-2">
              <span className="font-mono text-xs text-neon-cyan mb-1">ADH 酶</span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-neon-amber to-red-500 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-red-500" />
              </div>
            </div>
            {/* Acetaldehyde */}
            <div className="flex flex-col items-center">
              <div className="bg-red-500/15 border border-red-500/50 rounded-lg px-5 py-3 text-center">
                <span className="font-display text-lg text-red-400 block">乙醛</span>
                <span className="font-mono text-xs text-charcoal-300">Acetaldehyde</span>
                <span className="block font-mono text-[10px] text-red-400 mt-1">⚠️ 有毒！</span>
              </div>
            </div>
            {/* Arrow 2 */}
            <div className="flex flex-col items-center px-2">
              <span className="font-mono text-xs text-neon-cyan mb-1">ALDH 酶</span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-red-500 to-green-500 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-green-500" />
              </div>
            </div>
            {/* Acetic Acid */}
            <div className="flex flex-col items-center">
              <div className="bg-green-500/15 border border-green-500/50 rounded-lg px-5 py-3 text-center">
                <span className="font-display text-lg text-green-400 block">醋酸</span>
                <span className="font-mono text-xs text-charcoal-300">Acetic Acid</span>
              </div>
            </div>
            {/* Arrow 3 */}
            <div className="flex flex-col items-center px-2">
              <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-neon-cyan relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-neon-cyan" />
              </div>
            </div>
            {/* CO2 + H2O */}
            <div className="flex flex-col items-center">
              <div className="bg-neon-cyan/10 border border-neon-cyan/40 rounded-lg px-5 py-3 text-center">
                <span className="font-display text-lg text-neon-cyan block">CO₂ + H₂O</span>
                <span className="font-mono text-xs text-charcoal-300">無害</span>
              </div>
            </div>
          </div>
          <p className="text-text-muted text-xs font-mono mt-4">
            乙醛（Acetaldehyde）是宿醉的主要元兇——比酒精本身毒性高 10–30 倍。ALDH 酶活性不足者（亞洲人約 36%）代謝更慢，宿醉更嚴重。
          </p>
        </div>

        {/* Science Detail Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-2xl mb-3 block">💧</span>
            <h4 className="font-display text-base text-text-warm mb-2">
              脫水機制 <span className="font-mono text-xs text-charcoal-500 ml-1">Dehydration</span>
            </h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              酒精會抑制抗利尿激素（Vasopressin / ADH）的分泌，導致腎臟回收水分的能力大幅下降。
              飲用 250ml 酒精飲料可導致排出 800–1000ml 尿液。這種淨水分流失造成頭痛、口渴、疲勞——宿醉的核心症狀。
            </p>
          </div>

          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className="text-2xl mb-3 block">🧪</span>
            <h4 className="font-display text-base text-text-warm mb-2">
              同族物效應 <span className="font-mono text-xs text-charcoal-500 ml-1">Congeners</span>
            </h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              同族物（Congeners）是發酵與蒸餾過程中產生的副產物——包括甲醇、丙酮、丹寧、組胺等數百種化合物。
              深色酒款含量遠高於透明酒款。波本威士忌的同族物含量是伏特加的 37 倍——這就是為什麼喝波本的宿醉通常比伏特加嚴重。
            </p>
          </div>

          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <span className="text-2xl mb-3 block">🛌</span>
            <h4 className="font-display text-base text-text-warm mb-2">
              睡眠干擾 <span className="font-mono text-xs text-charcoal-500 ml-1">Sleep Disruption</span>
            </h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              酒精雖然有助於入睡（鎮靜作用），但會嚴重干擾 REM 快速動眼期——這是大腦進行記憶鞏固和情緒修復的關鍵睡眠階段。
              酒後睡眠的後半段尤其破碎，頻繁醒來，導致即使「睡夠」了仍感到疲憊和認知遲鈍。
            </p>
          </div>
        </div>
      </section>

      <div className="divider-amber max-w-6xl mx-auto" />

      {/* ── S2: Before Drinking ───────────────────────────── */}
      <section id="before" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in-up">
          Before Drinking
        </p>
        <h2 className="font-display text-3xl text-gradient-amber mb-8 animate-fade-in-up">
          飲前準備
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beforeTips.map((tip, i) => (
            <div
              key={tip.title}
              className="glass-card p-6 hover:border-neon-amber transition-colors duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl mb-3 block">{tip.icon}</span>
              <h4 className="font-display text-base text-text-warm mb-2">{tip.title}</h4>
              <p className="text-text-secondary text-sm leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-amber max-w-6xl mx-auto" />

      {/* ── S3: While Drinking ────────────────────────────── */}
      <section id="during" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in-up">
          While Drinking
        </p>
        <h2 className="font-display text-3xl text-gradient-amber mb-8 animate-fade-in-up">
          飲中策略
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {duringTips.map((tip, i) => (
            <div
              key={tip.title}
              className="glass-card p-6 hover:border-neon-amber transition-colors duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl mb-3 block">{tip.icon}</span>
              <h4 className="font-display text-base text-text-warm mb-2">{tip.title}</h4>
              <p className="text-text-secondary text-sm leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-amber max-w-6xl mx-auto" />

      {/* ── S4: After Drinking ────────────────────────────── */}
      <section id="after" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in-up">
          After Drinking
        </p>
        <h2 className="font-display text-3xl text-gradient-amber mb-8 animate-fade-in-up">
          飲後恢復
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {afterTips.map((tip, i) => (
            <div
              key={tip.title}
              className="glass-card p-6 hover:border-neon-amber transition-colors duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-3xl mb-3 block">{tip.icon}</span>
              <h4 className="font-display text-base text-text-warm mb-2">{tip.title}</h4>
              <p className="text-text-secondary text-sm leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-amber max-w-6xl mx-auto" />

      {/* ── S5: Myth Busters ──────────────────────────────── */}
      <section id="myths" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in-up">
          Myth Busters
        </p>
        <h2 className="font-display text-3xl text-gradient-amber mb-8 animate-fade-in-up">
          迷思破解
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {myths.map((myth, i) => (
            <div
              key={myth.claim}
              className={`glass-card p-6 animate-fade-in-up border-l-4 ${
                myth.verdict
                  ? 'border-l-green-500 hover:border-green-500/60'
                  : 'border-l-red-500 hover:border-red-500/60'
              } transition-colors duration-300`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className={`text-2xl flex-shrink-0 ${myth.verdict ? 'text-green-400' : 'text-red-400'}`}>
                  {myth.verdict ? '✅' : '❌'}
                </span>
                <div>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded-sm ${
                    myth.verdict
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {myth.verdict ? '✓ TRUE — 這是真的' : '✗ FALSE — 這是假的'}
                  </span>
                </div>
              </div>
              <h4 className="font-display text-base text-text-warm mb-2">{myth.claim}</h4>
              <p className="text-text-secondary text-sm leading-relaxed">{myth.truth}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-amber max-w-6xl mx-auto" />

      {/* ── S6: Standard Drinks Table ─────────────────────── */}
      <section id="drinks" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in-up">
          Standard Drinks Reference
        </p>
        <h2 className="font-display text-3xl text-gradient-amber mb-4 animate-fade-in-up">
          標準飲品對照表
        </h2>
        <p className="text-text-secondary text-sm mb-8 animate-fade-in-up">
          一個標準飲品（Standard Drink）≈ 14g 純酒精。了解每杯酒的實際酒精含量，才能有效控制攝入量。
        </p>

        <div className="glass-card p-2 md:p-6 overflow-x-auto animate-fade-in-up">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-700">
                <th className="text-left font-mono text-xs text-neon-amber py-3 px-3">飲品</th>
                <th className="text-center font-mono text-xs text-neon-amber py-3 px-3">容量</th>
                <th className="text-center font-mono text-xs text-neon-amber py-3 px-3">ABV</th>
                <th className="text-center font-mono text-xs text-neon-amber py-3 px-3">純酒精量</th>
                <th className="text-center font-mono text-xs text-neon-amber py-3 px-3">標準飲品數</th>
              </tr>
            </thead>
            <tbody>
              {standardDrinks.map((d) => (
                <tr key={d.name} className="border-b border-charcoal-800 hover:bg-charcoal-800/50 transition-colors">
                  <td className="py-3 px-3 font-display text-text-warm">{d.name}</td>
                  <td className="py-3 px-3 text-center font-mono text-text-secondary">{d.vol}</td>
                  <td className="py-3 px-3 text-center font-mono text-text-secondary">{d.abv}</td>
                  <td className="py-3 px-3 text-center font-mono text-text-secondary">{d.pure}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`font-mono font-semibold px-2 py-0.5 rounded-sm ${
                      parseFloat(d.std) >= 2
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : parseFloat(d.std) >= 1.5
                        ? 'bg-neon-amber/15 text-neon-amber border border-neon-amber/30'
                        : 'bg-green-500/15 text-green-400 border border-green-500/30'
                    }`}>
                      {d.std}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 glass-card p-4 border-neon-cyan/30 bg-neon-cyan/5 animate-fade-in-up">
          <p className="text-text-secondary text-xs font-mono leading-relaxed">
            <span className="text-neon-cyan">💡 PRO TIP：</span>
            Long Island Iced Tea 看似溫和但含有 3.1 個標準飲品——等於一次喝了三杯烈酒。
            雞尾酒的酒精含量往往比你想像的高得多，請務必查看實際成分。
          </p>
        </div>
      </section>

      <div className="divider-amber max-w-6xl mx-auto" />

      {/* ── S7: Warning Signs ─────────────────────────────── */}
      <section id="warning" className="px-6 py-16 max-w-6xl mx-auto scroll-mt-28">
        <p className="font-mono text-red-400 text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in-up">
          Warning Signs
        </p>
        <h2 className="font-display text-3xl text-red-400 mb-8 animate-fade-in-up">
          ⚠️ 危險信號
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {warningCards.map((card, i) => (
            <div
              key={card.title}
              className={`glass-card p-6 animate-fade-in-up ${
                card.level === 'red'
                  ? 'border-2 border-red-500/50 bg-red-500/5'
                  : 'border-2 border-neon-amber/50 bg-neon-amber/5'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{card.icon}</span>
                <h4 className={`font-display text-base ${
                  card.level === 'red' ? 'text-red-400' : 'text-neon-amber'
                }`}>
                  {card.title}
                </h4>
              </div>
              <ul className="space-y-2">
                {card.signs.map((sign) => (
                  <li
                    key={sign}
                    className={`flex items-start gap-2 text-sm leading-relaxed ${
                      card.level === 'red' ? 'text-red-300/80' : 'text-neon-amber/80'
                    }`}
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current" />
                    <span className="text-text-secondary">{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Emergency CTA */}
        <div className="mt-8 glass-card p-6 border-2 border-red-500 text-center animate-fade-in-up">
          <p className="font-display text-xl text-red-400 mb-2">
            🚨 酒精中毒是醫療緊急事件
          </p>
          <p className="text-text-secondary text-sm mb-4">
            如果有人出現上述紅色警告症狀——<strong className="text-red-400">不要猶豫，立即撥打 119</strong>。
            等待救護車時讓患者保持側臥（Recovery Position），確保呼吸道暢通。
          </p>
          <span className="font-mono text-3xl text-red-400 tracking-widest">119</span>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-6xl mx-auto text-center">
        <div className="divider-amber mb-10" />
        <p className="text-text-muted text-sm mb-4">
          本頁資訊僅供教育用途，不構成醫療建議。如有健康疑慮請諮詢醫療專業人員。
        </p>
        <Link href="/academy" className="btn-neon-amber px-6 py-2 rounded text-sm">
          ← 返回調酒學院
        </Link>
      </section>
    </main>
  )
}
