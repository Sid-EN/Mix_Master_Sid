'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────────────────
   Sake & Plum Wine Encyclopedia — 清酒與梅酒百科
   ────────────────────────────────────────────────────────── */

type TabKey = 'brewing' | 'grades' | 'tasting' | 'umeshu' | 'cocktails'

const tabs: { key: TabKey; zh: string; en: string }[] = [
  { key: 'brewing',   zh: '清酒釀造', en: 'Brewing' },
  { key: 'grades',    zh: '等級分類', en: 'Grades' },
  { key: 'tasting',   zh: '清酒品鑑', en: 'Tasting' },
  { key: 'umeshu',    zh: '梅酒百科', en: 'Umeshu' },
  { key: 'cocktails', zh: '調酒應用', en: 'Cocktails' },
]

/* ── 清酒釀造 ───────────────────────────────────────────── */
function BrewingContent() {
  const steps = [
    {
      step: '01',
      name: '精米 Seimai',
      en: 'Rice Polishing',
      desc: '清酒的一切從精米開始。玄米（Brown Rice）的外層富含蛋白質、脂肪與礦物質，這些成分在發酵時會產生雜味。精米步合（Seimaibuai）表示碾磨後殘留的米芯比例——精米步合 60% 表示磨去了外層 40%，僅保留 60% 的米芯。磨得越多，風味越純淨精緻，但原料損耗也越大，這就是大吟釀價格高昂的原因之一。頂級酒款的精米步合可低至 23%（如「獺祭 磨き二割三分」），僅保留米粒的最核心部分。',
    },
    {
      step: '02',
      name: '洗米・浸漬 Senmai & Shinseki',
      en: 'Washing & Soaking',
      desc: '精米後的白米需經過精確的洗米與浸漬。洗米去除表面殘留的米糠；浸漬則讓米粒吸收適當水分，為接下來的蒸米做準備。吸水量的控制以秒計算——高精白米的浸漬時間可能僅有數十秒，因為米芯的澱粉結構更脆弱、更容易吸水。杜氏（Toji，首席釀酒師）會以手感判斷米粒的含水狀態，這是無法被機器完全取代的經驗判斷。',
    },
    {
      step: '03',
      name: '蒸米 Mushimai',
      en: 'Steaming',
      desc: '使用大型蒸米機（甑, Koshiki）將浸漬好的米以蒸汽加熱 40–60 分鐘。蒸米而非煮米的關鍵在於——蒸出的米「外硬內軟」（外はサバけ、内はひねり），外層不黏手方便製麴時麴菌附著，內部柔軟則有利於糊化澱粉被酶分解。蒸好的米依用途分配：約 20% 用於製麴、約 70% 用於發酵投料（掛米）、約 10% 用於酒母。',
    },
    {
      step: '04',
      name: '製麴 Seikiku',
      en: 'Koji Making',
      desc: '製麴是清酒釀造中最關鍵也最耗費心力的步驟，常被稱為「一麴、二酛、三造り」（麴最重要，其次是酒母，第三才是醪的管理）。在溫度與濕度嚴格控制的麴室（Kojimuro, 30–36°C）中，將黃麴菌（Aspergillus oryzae）的孢子撒布在蒸米上，經過約 48 小時的培養，麴菌菌絲深入米粒內部，分泌出將澱粉分解為葡萄糖的糖化酶（Amylase）。麴的品質直接決定了清酒的風味基調——「突破精」（菌絲深入的麴）適合釀造味道濃醇的酒，「總破精」（表面均勻覆蓋的麴）則適合輕快纖細的風格。杜氏在夜間每隔數小時就需進入麴室翻動、調整溫濕度，常連續工作 48 小時不休息。',
    },
    {
      step: '05',
      name: '酒母 Shubo / Moto',
      en: 'Yeast Starter',
      desc: '酒母是培養大量健康酵母菌的「種子液」。將蒸米、米麴、水與酵母菌混合在小型容器中，讓酵母在安全的高酸度環境中大量繁殖。酒母的製作方法有兩大流派：速釀酛（Sokujo-moto）使用乳酸添加快速建立酸度保護，約兩週即可完成；生酛（Kimoto）則依靠空氣中的天然乳酸菌自然產酸，需時 4 週以上，風味更為複雜厚實。山廢（Yamahai）是生酛的簡化版，省略了費力的「山卸」（磨碎米粒）操作，但保留了自然乳酸發酵的特色，風味通常帶有獨特的酸味與濃厚的旨味（Umami）。',
    },
    {
      step: '06',
      name: '醪 Moromi（並行複發酵）',
      en: 'Main Fermentation (Multiple Parallel)',
      desc: '這是清酒獨一無二的核心技術——並行複發酵（Multiple Parallel Fermentation, MPF）。在同一個發酵槽中，兩個生化反應同時進行：（1）麴菌的酵素將澱粉分解為葡萄糖（糖化）；（2）酵母菌將葡萄糖轉化為酒精（發酵）。這兩個過程在同一個容器中「並行」且「同時」發生，是地球上最精密的酒精飲料發酵方式。糖化的速率控制了發酵的速率，使酵母不會因一次性接觸過高濃度的糖分而「中毒」死亡（啤酒和葡萄酒不具備這個特性），因此清酒的原酒可達到 20% ABV 以上——是所有釀造酒中最高的。發酵過程採用「三段仕込」（三階段投料法）：添（Soe）→ 仲（Naka）→ 留（Tome），將蒸米與麴分批加入，讓酵母有時間適應逐漸增加的體積。整個發酵歷時 18–32 天，溫度控制在 8–18°C（吟釀類更低至 5–10°C 以產生更多果香酯類）。',
    },
    {
      step: '07',
      name: '壓搾・過濾・殺菌 Joso / Roka / Hi-ire',
      en: 'Pressing, Filtering & Pasteurization',
      desc: '發酵完成的醪經過壓搾分離酒液與酒粕（Kasu, 可用於醃漬或烹飪）。傳統的「槽搾り」（Fune-shibori, 木槽壓搾法）出酒緩慢但品質最佳；「袋吊り」（Fukuro-tsuri, 袋吊法）更是僅靠重力讓酒液自然滴下，產量極少，通常僅用於出品大會或限量酒款。壓搾後的清酒經過過濾去除殘餘固體，再以約 65°C 的低溫進行一次或兩次火入れ（Hi-ire, 巴斯德殺菌），殺死殘存的酵母與酶，穩定酒質。「生酒」（Namazake）跳過殺菌步驟，保留活性酵母帶來的鮮爽感，但需要冷藏保存。',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-xl text-text-warm mb-2">
          並行複發酵——清酒獨有的魔法
          <span className="font-mono text-xs text-charcoal-500 ml-2">Multiple Parallel Fermentation</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          清酒是世界上唯一採用「並行複發酵」技術的主流酒類。葡萄酒是單發酵（糖到酒精）；啤酒是先糖化再發酵的
          逐步發酵。唯有清酒，在同一個容器中同時進行糖化與發酵——麴菌持續將澱粉拆解為糖，酵母持續將糖轉化為
          酒精。這種精密的平衡使清酒原酒能達到 18–20% ABV，是釀造酒之最高紀錄。
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s) => (
          <div key={s.step} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
            <div className="flex items-start gap-4 mb-3">
              <div className="flex-shrink-0 w-12 h-12 border-2 border-neon-amber flex items-center justify-center">
                <span className="font-mono text-neon-amber text-sm font-bold">{s.step}</span>
              </div>
              <div>
                <h4 className="font-display text-lg text-text-warm">{s.name}</h4>
                <p className="font-mono text-xs text-charcoal-500 tracking-wider">{s.en}</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 等級分類 ───────────────────────────────────────────── */
function GradesContent() {
  const grades = [
    {
      name: '大吟釀',
      en: 'Daiginjo',
      seimaibuai: '≤ 50%',
      alcohol: '可添加',
      flavor: '華麗的果香與花香，口感極為精緻輕盈。蘋果、哈密瓜、白桃、茉莉花等香氣層層疊疊。是清酒藝術的最高表現。',
      note: '添加少量釀造酒精可以萃取更多香氣成分（酯類），使香味更為華麗。',
    },
    {
      name: '純米大吟釀',
      en: 'Junmai Daiginjo',
      seimaibuai: '≤ 50%',
      alcohol: '不可添加',
      flavor: '純米系的最高等級，兼具大吟釀的華麗香氣與純米的米味厚度。口感豐腴卻不失優雅，餘韻悠長。許多酒迷認為這是清酒的終極形態。',
      note: '100% 米、米麴、水釀造，展現最純粹的原料個性。',
    },
    {
      name: '吟釀',
      en: 'Ginjo',
      seimaibuai: '≤ 60%',
      alcohol: '可添加',
      flavor: '吟釀等級開始展現「吟釀香」（Ginjo-ka）——低溫長時間發酵產生的果香酯類化合物（乙酸異戊酯→蘋果香；己酸乙酯→哈密瓜香）。風格清新芳醇。',
      note: '低溫發酵（5-10°C）是產生吟釀香的關鍵技術。',
    },
    {
      name: '純米吟釀',
      en: 'Junmai Ginjo',
      seimaibuai: '≤ 60%',
      alcohol: '不可添加',
      flavor: '純米系吟釀，果香與米的旨味平衡最好的類型。適合搭配各類日式料理，溫度適應範圍廣（冷飲至微溫皆宜）。日常飲用的高品質選擇。',
      note: '許多精釀酒藏的主力商品，CP 值最高的等級。',
    },
    {
      name: '特別純米',
      en: 'Tokubetsu Junmai',
      seimaibuai: '≤ 60% 或特殊製法',
      alcohol: '不可添加',
      flavor: '「特別」表示有超越基本純米規格的特殊之處——可能是更高的精米步合、使用特殊酒米品種或獨特釀造法。風味通常比普通純米更為精緻，帶有清晰的米味旨味與舒適的酸度。',
      note: '酒標上通常會標示其「特別」之處。',
    },
    {
      name: '純米',
      en: 'Junmai',
      seimaibuai: '無特定限制',
      alcohol: '不可添加',
      flavor: '最能展現「米味」的類型。飽滿的旨味（Umami）、溫潤的口感、適中的酸度。冷飲、常溫、溫燗皆宜，是最萬用的清酒風格。生酛/山廢製法的純米酒更帶有濃厚的乳酸風味與複雜度。',
      note: '2004 年法規修改後取消了精米步合 70% 以下的限制。',
    },
    {
      name: '本釀造',
      en: 'Honjozo',
      seimaibuai: '≤ 70%',
      alcohol: '可添加（≤ 10%）',
      flavor: '添加少量釀造酒精使口感更為輕快乾爽。是入門清酒的好選擇，價格親民且風格多元。適合溫燗飲用，加溫後會展現更多穀物與堅果的暖調風味。',
      note: '釀造酒精添加量不得超過白米重量的 10%。',
    },
  ]

  const riceTypes = [
    { name: '山田錦', en: 'Yamada Nishiki', origin: '兵庫縣', desc: '酒米之王。心白（Shinpaku，米粒中心的白色不透明澱粉核心）大且明確，蛋白質含量低，是釀造大吟釀的首選。全日本超過 60% 的特定名稱酒使用山田錦。' },
    { name: '五百萬石', en: 'Gohyakumangoku', origin: '新潟縣', desc: '北陸地區的代表品種。心白較小，適合釀造口感淡麗辛口（乾爽）的清酒，是新潟「端麗辛口」風格的基石。不太適合高度精白（50% 以下容易碎裂）。' },
    { name: '美山錦', en: 'Miyama Nishiki', origin: '長野縣', desc: '寒冷地區的優質品種，耐寒性極佳。釀出的清酒風格清新，帶有明確的酸度與輕快的口感，適合吟釀等級。' },
    { name: '雄町', en: 'Omachi', origin: '岡山縣', desc: '最古老的酒米品種之一（1859 年發現），是山田錦的祖先。稻穗極長容易倒伏，栽培困難。釀出的酒風格豐腴飽滿，帶有野性的旨味與深厚的層次，被愛好者稱為「雄町ロマン」（Omachi Romance）。' },
    { name: '愛山', en: 'Aiyama', origin: '兵庫縣', desc: '極為稀少的夢幻酒米。大粒、心白大，但栽培與精米都極為困難。釀出的清酒甜潤華麗，帶有蜂蜜、花香與獨特的妖豔感。僅有少數酒藏使用。' },
  ]

  return (
    <div className="space-y-8">
      {/* 等級表 */}
      <div>
        <h3 className="font-display text-xl text-text-warm mb-4">
          特定名稱酒分類
          <span className="font-mono text-xs text-charcoal-500 ml-2">Tokutei Meishoshu Classification</span>
        </h3>
        <div className="space-y-4">
          {grades.map((g) => (
            <div key={g.en} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h4 className="font-display text-lg text-text-warm">{g.name}</h4>
                <span className="font-mono text-sm text-neon-amber tracking-wider">{g.en}</span>
                <span className="font-mono text-xs text-charcoal-500 border border-charcoal-700 px-2 py-0.5">
                  精米 {g.seimaibuai}
                </span>
                <span className={`font-mono text-xs px-2 py-0.5 ${
                  g.alcohol === '不可添加'
                    ? 'text-green-400 border border-green-400/30'
                    : 'text-charcoal-500 border border-charcoal-700'
                }`}>
                  醸造酒精 {g.alcohol}
                </span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed mb-2">{g.flavor}</p>
              <p className="font-mono text-xs text-charcoal-500 leading-relaxed">💡 {g.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 酒米品種 */}
      <div>
        <div className="divider-amber mb-8" />
        <h3 className="font-display text-xl text-text-warm mb-2">
          酒造好適米
          <span className="font-mono text-xs text-charcoal-500 ml-2">Sake Rice Varieties</span>
        </h3>
        <p className="text-text-muted text-sm mb-6">
          「酒造好適米」是專門為釀造清酒培育的稻米品種，與食用米最大的差異在於擁有更大的「心白」（Shinpaku）。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riceTypes.map((r) => (
            <div key={r.en} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
              <h4 className="font-display text-base text-text-warm mb-0.5">{r.name}</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-neon-amber">{r.en}</span>
                <span className="font-mono text-[10px] text-charcoal-500">📍 {r.origin}</span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 日本酒度 */}
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-lg text-text-warm mb-2">
          日本酒度 SMV
          <span className="font-mono text-xs text-charcoal-500 ml-2">Sake Meter Value (Nihonshu-do)</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-3">
          日本酒度（SMV）是衡量清酒甘辛度的標準指標。以 4°C 的純水比重為基準（±0），
          數值為正（+）表示比重低於水（含糖少→傾向辛口/乾爽），數值為負（-）表示比重高於水（含糖多→傾向甘口/甜潤）。
          但 SMV 只是參考，實際甘辛感受還受酸度與胺基酸度的影響——高酸度會讓甘口酒喝起來更乾爽。
        </p>
        <div className="grid grid-cols-5 gap-2 font-mono text-xs text-center">
          <div className="p-2 bg-bg-tertiary border border-charcoal-700">
            <div className="text-neon-amber font-bold">-6 以下</div>
            <div className="text-charcoal-500 mt-1">大甘口</div>
          </div>
          <div className="p-2 bg-bg-tertiary border border-charcoal-700">
            <div className="text-neon-amber font-bold">-2 ~ -5</div>
            <div className="text-charcoal-500 mt-1">甘口</div>
          </div>
          <div className="p-2 bg-bg-tertiary border border-charcoal-700">
            <div className="text-neon-amber font-bold">-1 ~ +1</div>
            <div className="text-charcoal-500 mt-1">中間</div>
          </div>
          <div className="p-2 bg-bg-tertiary border border-charcoal-700">
            <div className="text-neon-amber font-bold">+2 ~ +5</div>
            <div className="text-charcoal-500 mt-1">辛口</div>
          </div>
          <div className="p-2 bg-bg-tertiary border border-charcoal-700">
            <div className="text-neon-amber font-bold">+6 以上</div>
            <div className="text-charcoal-500 mt-1">大辛口</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 清酒品鑑 ───────────────────────────────────────────── */
function TastingContent() {
  const temps = [
    { name: '雪冷え',  en: 'Yukibie',   temp: '5°C',   desc: '雪般冰冷。香氣收斂，口感清冽如泉水。適合大吟釀類的華麗酒款，低溫能讓果香在口中慢慢綻放。過冷可能掩蓋風味細節，建議在入口後讓酒液在口中停留數秒回溫。' },
    { name: '花冷え',  en: 'Hanabie',    temp: '10°C',  desc: '花瓣般的涼爽。這是大多數吟釀酒的最佳品飲溫度。果香與花香表現完美，口感爽淨，酸度明亮。從冰箱取出後放置 5–10 分鐘即可達到此溫度。' },
    { name: '涼冷え',  en: 'Suzubie',    temp: '15°C',  desc: '涼爽宜人。香氣開始開展，米的旨味漸漸浮現。純米吟釀在此溫度展現最佳平衡——果香不搶風頭，米味也未完全退場。' },
    { name: '常温',    en: 'Jō-on',      temp: '20°C',  desc: '室溫飲用。所有的風味要素——米味、酸度、旨味、苦味——均衡呈現。最適合品評清酒的「真實面貌」，也是最適合配餐飲用的溫度。純米酒在此溫度最為出色。' },
    { name: '日向燗',  en: 'Hinata-kan', temp: '30°C',  desc: '陽光般的微溫。香氣開始舒展開來，口感變得柔和圓潤。開始感受到溫酒的魅力。適合本釀造與純米酒。' },
    { name: '人肌燗',  en: 'Hitohada',   temp: '35°C',  desc: '體溫般的溫度。米的甘甜與旨味明顯增強，口感如絲綢般滑順。生酛/山廢系的清酒在此溫度展現迷人的乳酸風味與複雜度。這是最「治癒」的飲用溫度。' },
    { name: '上燗',    en: 'Jō-kan',     temp: '45°C',  desc: '明顯的溫熱感。香氣以穀物、栗子、堅果調為主。酸度更加突出，與油脂豐滿的料理（如烤魚、天婦羅）搭配絕佳。純米酒和本釀造在此溫度達到另一個風味高峰。' },
    { name: '熱燗',    en: 'Atsu-kan',   temp: '50°C',  desc: '熱飲。風味奔放，酒精感明顯但被米的甜味包裹。適合體格強健的純米酒或本釀造。寒冬夜晚搭配關東煮（Oden）是日本人的終極暖心組合。注意：不建議將吟釀酒加熱至此溫度。' },
  ]

  const vessels = [
    { name: '猪口 Ochoko', desc: '最傳統的清酒小杯，容量約 45–60ml。陶瓷材質最常見，窄口設計集中香氣，適合品評與搭餐。不同窯燒的猪口本身就是日本陶藝文化的縮影。' },
    { name: '德利 Tokkuri', desc: '酒壺，容量 180ml（一合）或 360ml（二合）。陶瓷或玻璃材質。窄頸設計有助於控制倒酒量，也能在燗酒時熱水浴中快速均勻加溫。' },
    { name: '升 Masu', desc: '傳統的方形木杯，容量 180ml（一合）。以日本扁柏（ヒノキ, Hinoki）製成，帶有清新的木香。慶典場合使用，象徵「滿溢」的吉祥意涵。部分居酒屋會將猪口放入升中，倒酒至溢出——表示店家大方好客。' },
    { name: '葡萄酒杯 Wine Glass', desc: '大吟釀用葡萄酒杯品飲正日益流行。廣口杯（如 Burgundy 杯型）能讓吟釀香充分展開，搖杯後的香氣複雜度令人驚嘆。RIEDEL 和 Kimoto Glass 都有推出清酒專用杯型。' },
  ]

  return (
    <div className="space-y-8">
      {/* 溫度帶 */}
      <div>
        <h3 className="font-display text-xl text-text-warm mb-2">
          清酒溫度帶
          <span className="font-mono text-xs text-charcoal-500 ml-2">Temperature Spectrum</span>
        </h3>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          清酒的獨特之處在於品飲溫度範圍極廣——從 5°C 到 55°C 都有其最佳表現。
          日本人為每個溫度帶賦予了詩意的名稱，每個溫度帶都能讓同一款酒展現截然不同的面貌。
        </p>
        <div className="space-y-3">
          {temps.map((t) => (
            <div key={t.en} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h4 className="font-display text-base text-text-warm">{t.name}</h4>
                <span className="font-mono text-xs text-neon-amber">{t.en}</span>
                <span className="font-mono text-xs text-neon-cyan border border-neon-cyan/30 px-2 py-0.5">
                  {t.temp}
                </span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 酒器 */}
      <div>
        <div className="divider-amber mb-8" />
        <h3 className="font-display text-xl text-text-warm mb-2">
          酒器指南
          <span className="font-mono text-xs text-charcoal-500 ml-2">Sake Vessels</span>
        </h3>
        <p className="text-text-muted text-sm mb-6">
          酒器的材質、形狀與容量都會影響品飲體驗。選擇正確的酒器是品鑑清酒的重要一環。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vessels.map((v) => (
            <div key={v.name} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
              <h4 className="font-display text-base text-text-warm mb-2">{v.name}</h4>
              <p className="text-text-secondary text-sm leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 品鑑流程 */}
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-lg text-text-warm mb-3">
          品鑑四步驟
          <span className="font-mono text-xs text-charcoal-500 ml-2">Tasting Protocol</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">01 — 外觀 Appearance</span>
            <p className="leading-relaxed">觀察透明度、色澤（無色→淡黃→琥珀）、黏度。生酒通常帶有微濁的光澤，陳年酒會呈現深琥珀色。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">02 — 上立ち香 Uwadachi-ka</span>
            <p className="leading-relaxed">不搖杯直接嗅聞的香氣。吟釀酒此時應能感受到果香（蘋果、哈密瓜、梨子）與花香（茉莉、百合）。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">03 — 含み香 Fukumi-ka</span>
            <p className="leading-relaxed">入口後從口腔傳至鼻腔的逆行香氣（Retronasal）。這是體驗米味旨味、乳酸風味與穀物調性的關鍵階段。</p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-1">04 — 餘韻 Finish</span>
            <p className="leading-relaxed">吞嚥後風味的持續時間與演變。優質清酒的餘韻乾淨俐落（「キレ」Kire），不留殘味。大吟釀的餘韻則如水彩般透明漸層消散。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 梅酒百科 ───────────────────────────────────────────── */
function UmeshuContent() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-display text-xl text-text-warm mb-2">
          梅酒概論
          <span className="font-mono text-xs text-charcoal-500 ml-2">Umeshu Overview</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          梅酒（Umeshu）是以未熟青梅（Ume, 日本杏 Prunus mume）浸漬於酒精基底（通常為白色蒸餾酒「ホワイトリカー」White Liquor，
          35% ABV）中，加入糖類製成的利口酒。它不是「發酵」產物，而是「浸漬萃取」——梅子的有機酸（檸檬酸、蘋果酸）、
          果膠、酚類化合物與香氣成分隨時間溶入酒液，與糖類交互作用，形成獨特的酸甜風味。
        </p>
        <p className="text-text-secondary text-sm leading-relaxed mt-2">
          在日本，家庭自釀梅酒是每年六月的季節風物詩。超市在梅雨季（「梅」雨＝梅子成熟的雨季）前會設立專區，
          販售青梅、冰糖與大型玻璃罐（果實酒瓶），每個家庭都有自己傳承的黃金比例。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h4 className="text-text-warm font-medium mb-1">南高梅 Nanko-ume</h4>
          <p className="font-mono text-xs text-charcoal-500 mb-2">📍 和歌山縣 — 梅酒之王</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            日本最高級的梅品種，果實碩大（直徑 3–4cm）、果肉厚實、種核小。果皮薄而柔軟，
            浸漬時能快速釋出風味。製成的梅酒色澤透亮如琥珀，風味濃郁圓潤，帶有明確的杏桃、
            蜂蜜與花香。和歌山縣佔全日本南高梅產量的 65% 以上，「紀州梅」是品質的代名詞。
          </p>
        </div>
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h4 className="text-text-warm font-medium mb-1">古城梅 Kojo-ume</h4>
          <p className="font-mono text-xs text-charcoal-500 mb-2">📍 和歌山縣 — 青梅首選</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            果實較南高梅小，但果肉紮實、酸度較高，特別適合製作梅酒。比南高梅更耐浸漬，
            不易過軟崩解。製成的梅酒風格清爽、酸度明亮，帶有清新的青草與柑橘調性，
            是講求「酸甜平衡」的梅酒愛好者首選。
          </p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-3">
          製作黃金比例
          <span className="font-mono text-xs text-charcoal-500 ml-2">Classic Recipe Ratio</span>
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-bg-tertiary border border-charcoal-700 text-center">
            <div className="font-mono text-2xl text-neon-amber font-bold">1 kg</div>
            <div className="text-text-secondary text-sm mt-1">青梅</div>
            <div className="font-mono text-[10px] text-charcoal-500">Green Ume</div>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700 text-center">
            <div className="font-mono text-2xl text-neon-amber font-bold">1.8 L</div>
            <div className="text-text-secondary text-sm mt-1">基底酒</div>
            <div className="font-mono text-[10px] text-charcoal-500">White Liquor 35%</div>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700 text-center">
            <div className="font-mono text-2xl text-neon-amber font-bold">500–800g</div>
            <div className="text-text-secondary text-sm mt-1">冰糖</div>
            <div className="font-mono text-[10px] text-charcoal-500">Rock Sugar</div>
          </div>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          經典配方為 1:1.8:0.5–0.8（梅:酒:糖）。糖量越少越辛口，500g 適合偏好酸味的飲者；
          800g 則偏甜潤。冰糖（Rock Sugar）比白砂糖更佳，因為它溶解緩慢，讓萃取過程更溫和均勻。
          基底酒也可用白蘭地（風味更華麗）、琴酒（草本清新）或日本燒酎（旨味更重）替代。
        </p>
      </div>

      <div className="glass-card p-6">
        <h4 className="text-text-warm font-medium mb-3">熟成與陳年風味演變</h4>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="flex gap-3 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0">3 個月</span>
            <p className="leading-relaxed">開始可飲，但風味尚未整合。梅子的青澀感明顯，酸度較突出，甜味與酒精感分離。可用於調酒但不建議純飲。</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0">6 個月</span>
            <p className="leading-relaxed">風味開始圓潤，酸甜平衡改善。梅子的果香開始融入酒液，出現杏桃與蜜餞的風味。此時建議取出梅子，避免過度萃取苦澀。</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0">1 年</span>
            <p className="leading-relaxed">經典熟成期。風味飽滿圓潤，酸甜完美平衡，口感絲滑。琥珀色澤加深，帶有蜂蜜、焦糖的暖調。純飲加冰的最佳時機。</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0">3–5 年</span>
            <p className="leading-relaxed">深度陳年。色澤呈深琥珀至紅銅色。風味極為複雜——焦糖、太妃糖、乾果、微妙的木質調。口感如蜂蜜般濃稠，餘韻悠長。如同陳年雪莉酒的質地。</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h4 className="text-text-warm font-medium mb-2">商業品牌精選</h4>
          <p className="text-text-secondary text-sm leading-relaxed">
            CHOYA 蝶矢（日本最大梅酒品牌）、明利酒類 百年梅酒（糖少偏辛口）、
            梅乃宿 あらごし梅酒（果肉型）、中野 BC 紀州梅酒（和歌山產）、
            鶴梅（大吟釀基底的頂級梅酒）。
          </p>
        </div>
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h4 className="text-text-warm font-medium mb-2">進階基底酒選擇</h4>
          <p className="text-text-secondary text-sm leading-relaxed">
            白蘭地基底：果香華麗、風味複雜；日本燒酎基底：旨味濃厚、適合配餐；
            威士忌基底：煙燻木質、適合秋冬；琴酒基底：草本清新、適合調酒應用。
          </p>
        </div>
        <div className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
          <h4 className="text-text-warm font-medium mb-2">飲用方式</h4>
          <p className="text-text-secondary text-sm leading-relaxed">
            純飲加冰（On the Rocks）、梅酒蘇打（Umeshu Soda，1:2 比例）、
            梅酒熱飲（お湯割り Hot Water，1:1，冬季暖心飲法）、
            冷凍梅酒（Frozen Umeshu，冷凍後呈雪泥狀）。
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── 調酒應用 ───────────────────────────────────────────── */
function CocktailsContent() {
  const cocktails = [
    {
      name: 'Sake Martini',
      nameZh: '清酒馬丁尼',
      ingredients: '清酒 60ml · Dry Vermouth 15ml · 柚子皮',
      method: 'Stir 攪拌法',
      desc: '以吟釀等級清酒取代部分琴酒或伏特加，輕搖或攪拌後倒入冰鎮 Martini 杯，以柚子皮扭轉裝飾。口感比傳統 Martini 更為柔和、帶有清雅的米香與柚子精油的芬芳。適合不喜歡高酒精度調酒的飲者。',
    },
    {
      name: 'Umeshu Sour',
      nameZh: '梅酒酸酒',
      ingredients: '梅酒 60ml · 新鮮檸檬汁 20ml · 蛋白 · 苦精少許',
      method: 'Dry Shake + Shake',
      desc: '先乾搖（不加冰）乳化蛋白質，再加冰搖盪後雙重過濾倒入 Coupe 杯。梅酒本身的酸甜度加上檸檬汁的鮮爽，蛋白提供絲滑泡沫。是展示梅酒調酒潛力的最佳入門作品。',
    },
    {
      name: 'Sakura Spring',
      nameZh: '櫻花春意',
      ingredients: '純米酒 45ml · 接骨木花利口酒 20ml · 氣泡水 · 櫻花鹽漬裝飾',
      method: 'Build 直調法',
      desc: '在 Highball 杯中先加冰，依序倒入清酒與接骨木花利口酒，最後緩慢加入氣泡水並輕拉一下。以鹽漬櫻花瓣裝飾——鹽漬花瓣在碳酸中會緩慢展開，視覺效果如同瓶中花開。清新花香與米味的完美融合，是春季限定的夢幻飲品。',
    },
    {
      name: 'Ume Old Fashioned',
      nameZh: '梅酒老派',
      ingredients: '日本威士忌 45ml · 梅酒 15ml · 苦精 2 dash · 梅子裝飾',
      method: 'Build 直調法',
      desc: '在 Rocks 杯中以大冰球或方形冰塊降溫，將威士忌、梅酒與苦精直接在杯中攪拌。梅酒取代了傳統 Old Fashioned 中的糖漿角色，提供了酸甜度與果香。以漬梅子或柑橘皮裝飾。日式洋酒文化的經典融合。',
    },
    {
      name: 'Tokyo Drift',
      nameZh: '東京甩尾',
      ingredients: '琴酒 30ml · 柚子清酒 30ml · 生薑糖漿 10ml · 蘇打水',
      method: 'Shake + Top',
      desc: '搖盪琴酒、柚子清酒與生薑糖漿後倒入 Collins 杯，加上蘇打水。薑的辛辣、柚子的清苦、琴酒的杜松子與清酒的米香形成多層次的風味旅程。是完美的餐前開胃飲品。',
    },
    {
      name: 'Plum Negroni',
      nameZh: '梅酒內格羅尼',
      ingredients: '琴酒 30ml · 梅酒 20ml · Campari 15ml · Sweet Vermouth 15ml',
      method: 'Stir 攪拌法',
      desc: '以梅酒替換部分 Sweet Vermouth，在攪拌杯中加冰攪拌後倒入 Rocks 杯搭配大冰球。梅酒的酸甜柔化了 Campari 的苦韻，同時增添了獨特的東亞果香層次。以柚子皮或乾燥梅片裝飾。',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-lg text-text-warm mb-2">
          東方風味 × 西方技法
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          清酒與梅酒在調酒中正迅速崛起。清酒的低酒精度（15–17% ABV）使其成為降低調酒酒精強度的優雅選擇，
          同時帶來西方烈酒所缺乏的旨味（Umami）維度。梅酒的天然酸甜度可替代糖漿與柑橘汁的角色，
          簡化配方同時增添風味深度。全球頂尖酒吧如東京的 Bar High Five、新加坡的 Jigger & Pony
          都在菜單中融入了清酒元素。
        </p>
      </div>

      <div className="space-y-4">
        {cocktails.map((c) => (
          <div key={c.name} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h4 className="font-display text-lg text-text-warm">{c.nameZh}</h4>
              <span className="font-mono text-sm text-neon-amber">{c.name}</span>
              <span className="font-mono text-xs text-charcoal-500 border border-charcoal-700 px-2 py-0.5">
                {c.method}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {c.ingredients.split(' · ').map((ing) => (
                <span key={ing} className="font-mono text-xs px-2.5 py-1 bg-bg-tertiary border border-charcoal-700 text-text-secondary">
                  {ing}
                </span>
              ))}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Content Map & Page ─────────────────────────────────── */
const contentMap: Record<TabKey, () => React.JSX.Element> = {
  brewing: BrewingContent,
  grades: GradesContent,
  tasting: TastingContent,
  umeshu: UmeshuContent,
  cocktails: CocktailsContent,
}

export default function SakePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('brewing')
  const Content = contentMap[activeTab]

  return (
    <main className="min-h-screen bg-bg-primary">
      <section className="px-6 pt-20 pb-8 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回學院
        </Link>
        <div className="mt-8">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            Sake & Umeshu Encyclopedia
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
            清酒與梅酒百科
          </h1>
          <p className="text-text-secondary max-w-3xl">
            從精米到並行複發酵——探索日本千年釀酒智慧，品味東亞風味的極致表現。
          </p>
        </div>
      </section>

      <section className="px-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-1 border-b border-charcoal-700 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 font-sans text-sm transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-neon-amber text-neon-amber'
                  : 'border-transparent text-charcoal-500 hover:text-text-secondary'
              }`}
            >
              {tab.zh}
              <span className="font-mono text-xs ml-1.5 opacity-60">{tab.en}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-6xl mx-auto animate-fade-in" key={activeTab}>
        <Content />
      </section>
    </main>
  )
}
