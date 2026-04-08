'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────────────────
   Distillation & Barrel Science — 蒸餾與木桶科學
   ────────────────────────────────────────────────────────── */

type TabKey = 'fundamentals' | 'stills' | 'barrels' | 'special' | 'water'

const tabs: { key: TabKey; zh: string; en: string }[] = [
  { key: 'fundamentals', zh: '蒸餾原理', en: 'Fundamentals' },
  { key: 'stills',       zh: '蒸餾器型態', en: 'Still Types' },
  { key: 'barrels',      zh: '木桶科學', en: 'Barrel Science' },
  { key: 'special',      zh: '特殊陳年', en: 'Special Aging' },
  { key: 'water',        zh: '水源與降度', en: 'Water & Proofing' },
]

/* ── 蒸餾原理 ───────────────────────────────────────────── */
function FundamentalsContent() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-xl text-text-warm mb-2">
          蒸餾的本質
          <span className="font-mono text-xs text-charcoal-500 ml-2">The Essence of Distillation</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          蒸餾是利用不同物質沸點差異來分離混合物的技術。乙醇（酒精）的沸點為 78.37°C，水的沸點為 100°C。
          當加熱含有酒精的液體時，酒精會比水更早蒸發，收集並冷凝這些蒸汽即可得到酒精濃度更高的液體。
          但蒸餾不僅僅是「提高酒精度」——它更是對風味的精煉與重塑。數百種揮發性化合物
          （醛類、酯類、酸類、高級醇）各有不同的沸點，蒸餾師透過精準的溫度控制來決定保留哪些、
          捨棄哪些，這也是為什麼蒸餾被稱為「藝術」的原因。
        </p>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-xl text-text-warm mb-3">
          三段切割 Cuts
          <span className="font-mono text-xs text-charcoal-500 ml-2">Heads / Hearts / Tails</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          壺式蒸餾中，蒸餾液依序分為三個階段，每個階段含有不同的化學化合物。蒸餾師必須精準判斷
          「切割點」（Cut Points），決定從哪一刻開始收集心段精華，又在哪一刻停止。切割的時機直接左右了
          最終烈酒的風格——早切得到更輕盈純淨的酒體，晚切則保留更多風味物質但也伴隨更多雜質。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-bg-tertiary border border-charcoal-700 hover:border-neon-amber transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-neon-amber font-bold text-lg">01</span>
              <h4 className="text-text-warm font-medium">頭段 Foreshots / Heads</h4>
            </div>
            <p className="font-mono text-xs text-charcoal-500 mb-2">沸點 &lt; 78°C · 酒精度最高</p>
            <p className="text-text-secondary text-sm leading-relaxed">
              最先蒸出的液體，含有甲醇（Methanol, 有毒）、乙醛（Acetaldehyde）及揮發性酯類。
              氣味刺鼻、帶有指甲油般的溶劑感。此段必須完全捨棄——甲醇即使微量也可能損害視神經。
              頭段通常僅佔蒸餾液總量的 1–3%。
            </p>
          </div>
          <div className="p-5 bg-bg-tertiary border-2 border-neon-amber/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-neon-amber font-bold text-lg">02</span>
              <h4 className="text-text-warm font-medium">心段 Hearts</h4>
            </div>
            <p className="font-mono text-xs text-neon-amber mb-2">沸點 78–82°C · 精華所在</p>
            <p className="text-text-secondary text-sm leading-relaxed">
              蒸餾師的目標——乙醇為主體，伴隨適量的酯類（果香）、些許的高級醇（口感體積）
              及微量的酸類（風味深度）。心段的收取比例因風格而異：蘇格蘭麥芽威士忌通常收取 15–25%，
              干邑白蘭地約 30%，伏特加則追求極窄的心段以獲得最大純淨度。
              心段的品質取決於蒸餾速度——緩慢蒸餾產生更純淨、更精緻的心段。
            </p>
          </div>
          <div className="p-5 bg-bg-tertiary border border-charcoal-700 hover:border-neon-amber transition-colors duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-neon-amber font-bold text-lg">03</span>
              <h4 className="text-text-warm font-medium">尾段 Feints / Tails</h4>
            </div>
            <p className="font-mono text-xs text-charcoal-500 mb-2">沸點 &gt; 82°C · 酒精度漸降</p>
            <p className="text-text-secondary text-sm leading-relaxed">
              高沸點化合物開始出現——杂醇油（Fusel Oils, 帶有溶劑、油脂感）、重酯類、
              含硫化合物。少量的尾段可增加酒體的厚度與複雜度，但過多會帶來不愉快的油膩感與苦味。
              部分蒸餾廠會將頭段與尾段混回下一批蒸餾液中重新蒸餾（Recycling），
              最大化原料利用率。
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-3">
          回流與銅的角色
          <span className="font-mono text-xs text-charcoal-500 ml-2">Reflux & Copper</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-text-secondary">
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-2">回流 Reflux</span>
            <p className="leading-relaxed">
              蒸汽在上升過程中接觸到較冷的蒸餾器壁面時，部分蒸汽會凝結並流回鍋中重新蒸餾——
              這就是「回流」。回流越多，最終產品越純淨、越輕盈。蒸餾器的頸部越長越細，
              回流就越多（如 Glenmorangie 擁有蘇格蘭最高的蒸餾器頸部 5.14 公尺）。
              反之，矮胖的蒸餾器回流少，產出的酒體更厚重、更具個性（如 Lagavulin）。
            </p>
          </div>
          <div>
            <span className="font-mono text-neon-amber text-xs block mb-2">銅 Copper</span>
            <p className="leading-relaxed">
              所有高品質蒸餾器都使用銅製造，這不僅是傳統——銅具有關鍵的化學功能。
              銅會與蒸汽中的含硫化合物（硫化氫、二甲基硫醚）發生反應，
              將這些帶有臭蛋、橡膠等不愉快氣味的化合物轉化為無害的硫化銅沉澱，
              從而「淨化」蒸餾液的風味。蒸汽接觸銅的面積越大、時間越長，
              淨化效果越好、風味越清新。這就是為什麼不鏽鋼蒸餾器在頸部仍會使用銅製內襯或銅網。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 蒸餾器型態 ─────────────────────────────────────────── */
function StillsContent() {
  const stills = [
    {
      name: '壺式蒸餾器',
      en: 'Pot Still',
      desc: '最古老的蒸餾器設計，本質是一個巨大的銅壺。液體在壺底加熱，蒸汽上升通過天鵝頸（Lyne Arm），匯入冷凝器（Condenser）凝結為液體。壺式蒸餾是「分批蒸餾」（Batch Distillation）——每次蒸餾一批酒液，蒸餾完畢後必須清空、重新添料。',
      pros: '保留最多的風味化合物（醇類、酯類、酸類），產出的烈酒個性鮮明、風味複雜。蘇格蘭單一麥芽威士忌、干邑白蘭地、愛爾蘭壺式蒸餾威士忌都使用壺式蒸餾。每座蒸餾廠的壺式蒸餾器形狀都獨一無二，是風格的「指紋」。',
      cons: '效率低——通常需要二次蒸餾（蘇格蘭）或三次蒸餾（愛爾蘭）才能達到所需的酒精度。每批蒸餾需數小時，人力與能源成本高。',
      shapes: '洋蔥型（Onion Shape, 飽滿厚重）→ 球型（Ball Shape, 額外回流）→ 燈籠型（Lantern Shape, 優雅複雜）→ 高瘦型（Tall Slender, 輕盈純淨）',
    },
    {
      name: '柱式連續蒸餾器',
      en: 'Column / Continuous Still',
      desc: '又稱「科菲蒸餾器」（Coffey Still，由 Aeneas Coffey 於 1831 年專利），由兩根或多根高大的銅柱組成，內部設有數十層「蒸餾板」（Plate）。酒液從頂部注入，蒸汽從底部上升。液體在每一層蒸餾板上被蒸汽加熱，酒精蒸發上升，殘液下降。每一層板等同於一次蒸餾，因此一根 40 層板的柱式蒸餾器等於連續進行 40 次蒸餾。',
      pros: '可連續運作（不需分批），效率極高。能產出非常高酒精度（95%+ ABV）的中性烈酒。適合生產伏特加、穀物威士忌、工業蘭姆酒等大宗產品。成本效益最佳。',
      cons: '過度純化會失去原料風味特徵。高純度代表「中性」，不一定代表品質更好——差異在於目的。',
      shapes: '分析柱（Analyser，分離酒精）+ 精餾柱（Rectifier，進一步純化）為經典雙柱設計。現代穀物威士忌蒸餾廠可能使用 3–5 根柱。',
    },
    {
      name: '混合式蒸餾器',
      en: 'Hybrid Still',
      desc: '結合壺式蒸餾的風味複雜度與柱式蒸餾的效率。基底為壺式蒸餾器，頸部加裝若干蒸餾板（Column Attachment）或填充有銅片的「催化柱」。蒸餾師可以選擇使用或繞過柱式部分，靈活控制產出的酒精度與風味濃度。',
      pros: '適合精釀烈酒蒸餾廠（Craft Distillery），一台設備可生產多種風格的烈酒。從風味濃厚的壺式蒸餾到接近中性的高酒精度，都能在同一台設備上實現。',
      cons: '操作複雜度高，需要蒸餾師具備豐富的經驗來決定不同產品的最佳設定。設備成本介於壺式與柱式之間。',
      shapes: '常見於美國精釀蒸餾廠、台灣新興威士忌蒸餾廠（如噶瑪蘭）及琴酒蒸餾廠。',
    },
  ]

  const special = [
    { name: 'Charentais 夏朗德壺', region: '干邑', desc: '法國干邑專用的小型銅壺蒸餾器。容量僅 25 公石（2,500 升），以直火（Direct Fire）加熱。法規要求必須使用此型蒸餾器進行兩次蒸餾。小容量確保了蒸汽與銅的充分接觸，直火加熱產生微焦的穀物風味（梅納反應），是干邑獨特風味的來源之一。' },
    { name: 'Coffey Still 科菲蒸餾器', region: '日本・愛爾蘭', desc: '原始的雙柱連續蒸餾器設計。日本 Nikka 的宮城峽蒸餾廠保留了 1960 年代從蘇格蘭引進的 Coffey Still，是世界上僅存的仍在生產的原型之一。用於生產「Coffey Grain」與「Coffey Malt」系列——風味比現代柱式蒸餾器更為豐富。' },
    { name: 'Lomond Still 洛蒙德壺', region: '蘇格蘭', desc: '壺式蒸餾器的變體，頸部內裝有可調節角度的銅板。藉由改變銅板角度來控制回流量，從而在同一台蒸餾器上生產不同風格的原酒。Scapa 蒸餾廠曾使用此設計，Loch Lomond 蒸餾廠目前仍在使用。' },
    { name: '兜釜（甑） Kabutogama', region: '日本燒酎', desc: '日本傳統燒酎使用的蒸餾設備。蒸汽通過「蛇管」（Ja-no-me, 蛇管冷凝器）冷凝。分為常壓蒸餾（帶來更多穀物風味、旨味）與減壓蒸餾（更清爽輕盈的風格）。芋燒酎（以地瓜為原料）的獨特風味高度依賴常壓蒸餾。' },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {stills.map((s) => (
          <div key={s.en} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
            <h3 className="font-display text-xl text-text-warm mb-1">{s.name}</h3>
            <p className="font-mono text-sm text-neon-amber tracking-wider mb-3">{s.en}</p>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">{s.desc}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-mono text-xs text-green-400 block mb-1">✓ 優勢 Pros</span>
                <p className="text-text-secondary leading-relaxed">{s.pros}</p>
              </div>
              <div>
                <span className="font-mono text-xs text-red-400 block mb-1">✗ 限制 Cons</span>
                <p className="text-text-secondary leading-relaxed">{s.cons}</p>
              </div>
            </div>
            <div className="mt-3 font-mono text-xs text-charcoal-500 leading-relaxed">
              📐 {s.shapes}
            </div>
          </div>
        ))}
      </div>

      <div className="divider-amber" />
      <h3 className="font-display text-xl text-text-warm mb-4 mt-8">
        經典蒸餾器設計
        <span className="font-mono text-xs text-charcoal-500 ml-2">Iconic Designs</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {special.map((s) => (
          <div key={s.name} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
            <h4 className="text-text-warm font-medium mb-0.5">{s.name}</h4>
            <p className="font-mono text-[10px] text-neon-amber mb-2">📍 {s.region}</p>
            <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 木桶科學 ───────────────────────────────────────────── */
function BarrelsContent() {
  const oakTypes = [
    {
      name: '法國橡木 French Oak',
      species: 'Quercus robur / Quercus petraea',
      forests: 'Limousin（大孔隙、高單寧）· Tronçais（緊密紋理、細膩優雅）· Allier · Vosges · Nevers',
      flavor: '細膩的香草與丁香、奶油質地、肉桂與肉荳蔻的辛香料感、絲綢般的單寧。法國橡木的木紋更緊密，單寧釋放更緩慢、更優雅。',
      usage: '干邑白蘭地（法規指定）、布根地葡萄酒、蘇格蘭威士忌（雪莉桶多使用歐洲橡木）、頂級波爾多紅酒。一支法國橡木桶的成本約為美國橡木桶的 3–5 倍。',
    },
    {
      name: '美國白橡木 American White Oak',
      species: 'Quercus alba',
      forests: 'Missouri · Minnesota · Kentucky · Oregon',
      flavor: '明顯的香草（Vanillin 含量高出法國橡木 2–3 倍）、椰子、焦糖太妃糖、奶油糖果。木紋較粗大，風味物質釋放速度快，風格比法國橡木更為奔放直接。',
      usage: '波本威士忌（法規要求全新炭化美國白橡木桶）、西班牙 Rioja 紅酒（傳統使用美國橡木）、蘇格蘭威士忌（波本桶為最常見的熟成桶，佔 90% 以上）。因美國波本法規要求使用新桶，大量的二手波本桶流向蘇格蘭和全球各地。',
    },
    {
      name: '日本水楢 Mizunara',
      species: 'Quercus mongolica var. crispula',
      forests: '北海道 · 東北地方 · 長野',
      flavor: '獨一無二的檀香（Sandalwood）、椰子、東方香料（肉桂、丁香）、線香（Incense）的香氣。口感帶有蜂蜜與柑橘皮的甜潤感。水楢的風味至少需要 15–20 年的熟成才能充分展現。',
      usage: '極為稀有且昂貴。水楢木材多孔、容易漏液，製桶困難，且生長緩慢（可用的樹木需 200 年以上樹齡）。主要用於日本威士忌的高年份限量酒款，如 Yamazaki Mizunara Cask。近年蘇格蘭部分酒廠也開始實驗水楢桶過桶熟成。',
    },
    {
      name: '歐洲橡木（雪莉桶） European Oak',
      species: 'Quercus robur',
      forests: '西班牙 Galicia · 葡萄牙',
      flavor: '深色乾果（無花果、棗子、葡萄乾）、黑巧克力、核桃、肉桂、丁香。單寧感比法國橡木更為強勁粗獷，帶有明顯的辛香料刺激感。',
      usage: '雪莉酒熟成（Oloroso 與 PX 雪莉桶尤為搶手）。雪莉桶熟成的蘇格蘭威士忌（如 Macallan Sherry Oak 系列）風味濃郁複雜，顏色深紅如琥珀，是威士忌市場上最受追捧的桶型之一。',
    },
  ]

  const charLevels = [
    { level: '#1 Light', temp: '約 200°C · 15 秒', flavor: '輕微的烤麵包、淡香草、少量焦糖。香氣最為含蓄，適合不想讓木桶風味壓過原酒的釀酒師。' },
    { level: '#2 Medium', temp: '約 230°C · 30 秒', flavor: '明顯的香草與焦糖、太妃糖、輕微的煙燻。最常見的炙烤等級，平衡了木桶風味與原酒個性。' },
    { level: '#3 Medium Heavy', temp: '約 250°C · 35 秒', flavor: '強烈的焦糖化（Caramelization）、巧克力、蜜餞。木材中的半纖維素大量轉化為糖類。波本威士忌最常見的炙烤等級。' },
    { level: '#4 Heavy (Alligator)', temp: '約 280°C · 55 秒', flavor: '表面呈鱷魚皮般的深裂紋。強烈的煙燻、咖啡、黑巧克力、焦化糖。炭化層同時作為「活性碳過濾器」吸附原酒中的雜質。也稱為「鱷魚炭化」（Alligator Char）。' },
  ]

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-lg text-text-warm mb-2">
          木桶的風味貢獻
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          業界普遍認為，蘇格蘭威士忌 60–70% 的風味來自木桶熟成。木桶是一個活的化學反應器——
          木材中的化合物（木質素 Lignin → 香草醛 Vanillin；半纖維素 Hemicellulose → 焦糖；
          單寧 Tannin → 結構與色澤；木質內酯 Oak Lactone → 椰子/奶油）會隨時間緩慢溶入酒液。
          同時，木材的微量透氣性（「呼吸」）讓氧氣與酒液交互作用，促進酯化反應（產生果香）、
          乙醛聚合（增加複雜度）及硫化物消散（去除雜味）。
        </p>
      </div>

      {/* 橡木品種 */}
      <div className="space-y-4">
        {oakTypes.map((o) => (
          <div key={o.name} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
            <h3 className="font-display text-lg text-text-warm mb-0.5">{o.name}</h3>
            <p className="font-mono text-xs text-charcoal-500 italic mb-3">{o.species}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary">
              <div>
                <span className="font-mono text-xs text-neon-amber block mb-1">產地林區 Forests</span>
                <p className="leading-relaxed">{o.forests}</p>
              </div>
              <div>
                <span className="font-mono text-xs text-neon-amber block mb-1">風味特徵 Flavor</span>
                <p className="leading-relaxed">{o.flavor}</p>
              </div>
              <div>
                <span className="font-mono text-xs text-neon-amber block mb-1">主要用途 Usage</span>
                <p className="leading-relaxed">{o.usage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 炙烤等級 */}
      <div>
        <div className="divider-amber mb-8" />
        <h3 className="font-display text-xl text-text-warm mb-2">
          炙烤等級 Char Levels
          <span className="font-mono text-xs text-charcoal-500 ml-2">Toasting & Charring</span>
        </h3>
        <p className="text-text-muted text-sm mb-6">
          「烘烤」（Toasting）與「炙烤」（Charring）是兩個不同的工藝。烘烤以較低溫度緩慢加熱，
          促進木材中的化學轉化；炙烤則以高溫短時間燃燒桶內壁，形成一層焦炭。
        </p>
        <div className="space-y-3">
          {charLevels.map((c) => (
            <div key={c.level} className="glass-card p-5 hover:border-neon-amber transition-colors duration-300">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h4 className="text-text-warm font-medium">{c.level}</h4>
                <span className="font-mono text-xs text-charcoal-500">{c.temp}</span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{c.flavor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 桶次 */}
      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-3">
          桶次與風味強度
          <span className="font-mono text-xs text-charcoal-500 ml-2">Fill Strength</span>
        </h3>
        <div className="grid grid-cols-4 gap-3 text-center font-mono text-xs">
          <div className="p-3 bg-bg-tertiary border border-neon-amber/50">
            <div className="text-neon-amber font-bold mb-1">First Fill</div>
            <div className="text-charcoal-500">風味最濃烈</div>
            <div className="text-text-secondary text-[10px] mt-1">100% 風味貢獻</div>
          </div>
          <div className="p-3 bg-bg-tertiary border border-charcoal-700">
            <div className="text-text-warm font-bold mb-1">Second Fill</div>
            <div className="text-charcoal-500">約 50–60%</div>
            <div className="text-text-secondary text-[10px] mt-1">溫和的木桶影響</div>
          </div>
          <div className="p-3 bg-bg-tertiary border border-charcoal-700">
            <div className="text-text-warm font-bold mb-1">Third Fill</div>
            <div className="text-charcoal-500">約 20–30%</div>
            <div className="text-text-secondary text-[10px] mt-1">讓原酒本色展現</div>
          </div>
          <div className="p-3 bg-bg-tertiary border border-charcoal-700">
            <div className="text-text-warm font-bold mb-1">Refill</div>
            <div className="text-charcoal-500">&lt; 10%</div>
            <div className="text-text-secondary text-[10px] mt-1">幾乎僅提供氧化環境</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 特殊陳年技法 ───────────────────────────────────────── */
function SpecialContent() {
  const techniques = [
    {
      name: '索雷拉系統',
      en: 'Solera System',
      desc: '源自西班牙雪莉酒的動態陳年系統。由多層橡木桶堆疊而成——最底層（Solera）存放最老的酒，最上層（Criadera）存放最新的酒。取酒時從底層抽取（通常不超過 1/3），再從上一層補充，層層遞補。這使得系統中永遠混合著不同年份的酒液，成品風味極度一致且複雜。',
      examples: '雪莉酒（Fino/Amontillado/Oloroso）、蘭姆酒（Ron Zacapa 23, Diplomático）、白蘭地（部分 Brandy de Jerez）。',
    },
    {
      name: '過桶陳年',
      en: 'Cask Finish / Wood Finish',
      desc: '先在一種木桶中完成主要熟成，然後轉移到另一種木桶中進行「收尾」（Finish），賦予額外的風味層次。過桶時間通常為 3–12 個月，足以添加新風味但不至於壓過原本的個性。這是現代威士忌最流行的創新手法。',
      examples: 'Glenmorangie 是過桶先驅——Quinta Ruban（波特桶收尾）、Nectar d\'Òr（甜酒桶收尾）、Lasanta（雪莉桶收尾）。Balvenie DoubleWood（波本桶→雪莉桶）。',
    },
    {
      name: 'STR 工法',
      en: 'Shave, Toast, Re-char',
      desc: 'Jim Swan 博士發明的木桶翻新技術。將使用過的橡木桶內壁刮除（Shave）一層木材露出新鮮木質，再重新烘烤（Toast）分解木材中的化合物，最後輕度炙烤（Re-char）形成新的活性碳層。STR 工法讓舊桶獲得近似新桶的風味貢獻能力，同時保留了前一任內容物的微量風味印記。台灣噶瑪蘭威士忌大量使用 STR 處理的紅酒舊桶，並以此贏得多項國際大獎。',
      examples: '噶瑪蘭威士忌 Vinho Barrique 系列、Amrut（印度威士忌）。',
    },
    {
      name: '海洋熟成',
      en: 'Ocean Aging',
      desc: '將橡木桶放置在海邊倉庫或甲至船上，讓海洋環境影響熟成過程。海風的鹽分透過木桶微孔滲入酒液，賦予獨特的鹹鮮感（Salinity）；海浪的搖晃加速了酒液與木桶的交互作用；沿海地區高濕度的環境減緩了酒精的蒸發（與蘇格蘭高地乾燥倉庫減少水分蒸發相反），使酒精度隨時間降低，口感更為柔順。',
      examples: 'Talisker（Isle of Skye 海邊倉庫）、Bowmore（Islay 島海平面倉庫）、Jefferson\'s Ocean（船上熟成波本）、噶瑪蘭（亞熱帶海洋性氣候）。',
    },
    {
      name: '高海拔 / 極端氣候熟成',
      en: 'High Altitude / Extreme Climate Aging',
      desc: '在高海拔或極端氣候條件下熟成烈酒。高海拔地區的大日夜溫差（如安地斯山脈、台灣山區）導致木桶劇烈的「呼吸」——白天木材膨脹、酒液被推入木材纖維；夜晚收縮、酒液帶著木質風味被擠回。這種劇烈的溫差循環大幅加速了熟成進程——台灣噶瑪蘭的 4 年威士忌常被品評認為擁有蘇格蘭 12–15 年的成熟度。',
      examples: '噶瑪蘭（台灣，年均溫 25–30°C）、Amrut（印度班加羅爾，年均溫 28°C）、Kavalan 南投酒廠。天使份額（Angel\'s Share，蒸發損耗）在熱帶氣候可達每年 8–12%（蘇格蘭僅 2%）。',
    },
  ]

  return (
    <div className="space-y-6">
      {techniques.map((t) => (
        <div key={t.en} className="glass-card p-6 hover:border-neon-amber transition-colors duration-300">
          <h3 className="font-display text-xl text-text-warm mb-1">{t.name}</h3>
          <p className="font-mono text-sm text-neon-amber tracking-wider mb-3">{t.en}</p>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">{t.desc}</p>
          <div className="p-3 bg-bg-tertiary border border-charcoal-700">
            <span className="font-mono text-xs text-charcoal-500">代表案例 ›</span>
            <p className="text-text-secondary text-sm mt-1">{t.examples}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── 水源與降度 ─────────────────────────────────────────── */
function WaterContent() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-neon-amber-glow">
        <h3 className="font-display text-xl text-text-warm mb-2">
          水——看不見的第二原料
          <span className="font-mono text-xs text-charcoal-500 ml-2">The Invisible Ingredient</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          在烈酒的生產中，水扮演著三個關鍵角色：（1）製程用水（Process Water）——浸泡穀物、製作酒母；
          （2）冷卻用水（Cooling Water）——冷凝蒸餾蒸汽；（3）降度用水（Reduction / Proofing Water）——
          蒸餾後以水稀釋至裝瓶酒精度。其中，降度用水直接混入最終產品，其品質對口感影響最為深遠。
          這就是為什麼幾乎所有蒸餾廠都強調自己的水源——從蘇格蘭高地的泥炭溪流到日本的地下溶岩水，
          水的礦物質組成就是風味的隱形簽名。
        </p>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-3">
          水源類型與風味影響
          <span className="font-mono text-xs text-charcoal-500 ml-2">Water Sources</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h4 className="text-text-warm font-medium mb-2">泉水 / 井水 Spring & Well</h4>
            <p className="text-text-secondary leading-relaxed">
              地下岩層自然過濾的水源，礦物質含量因地質而異。穿越花崗岩的水質偏軟（低礦物質），
              口感柔順乾淨；穿越石灰岩的水質偏硬（高鈣鎂），口感帶有礦物質的「骨感」與結構。
              蘇格蘭 Speyside 的泉水經過花崗岩過濾，賦予該區威士忌柔和的口感基調。
            </p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h4 className="text-text-warm font-medium mb-2">溪水 / 河水 Stream & River</h4>
            <p className="text-text-secondary leading-relaxed">
              地表水源，可能流經泥炭層而攜帶腐殖質，呈現茶褐色（如 Islay 島蒸餾廠的水源），
              為酒液增添微妙的泥土與有機風味。但地表水受季節與降雨影響大，水質穩定性不如地下水。
              許多蒸餾廠同時使用地表水（製程）與地下水（降度），兼顧取量與品質。
            </p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h4 className="text-text-warm font-medium mb-2">冰川水 Glacial Water</h4>
            <p className="text-text-secondary leading-relaxed">
              經過數千年冰川過濾的水源，礦物質含量極低（幾乎是純水），口感極度柔滑中性。
              冰島的 Reyka Vodka 使用冰川水降度，賦予其標誌性的絲滑口感。
              部分日本威士忌蒸餾廠也使用經火山岩層過濾的地下伏流水，含有豐富的天然礦物質。
            </p>
          </div>
          <div className="p-4 bg-bg-tertiary border border-charcoal-700">
            <h4 className="text-text-warm font-medium mb-2">逆滲透水 RO Water</h4>
            <p className="text-text-secondary leading-relaxed">
              經過逆滲透膜過濾去除幾乎所有礦物質的純水。大型商業蒸餾廠可能使用 RO 水確保品質一致性，
              然後再添加特定礦物質配方還原所需的水質特性。這是科技與效率的選擇，
              但被傳統派認為失去了「風土」的概念。
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-3">
          加水降度 Proofing
          <span className="font-mono text-xs text-charcoal-500 ml-2">Dilution to Bottle Strength</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-4">
          蒸餾出的原酒酒精度通常在 60–70% ABV，而大多數烈酒的裝瓶酒精度為 40–46% ABV。
          加水降度看似簡單，實則有許多需要注意的科學細節。
        </p>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="flex gap-4 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0 w-20">溫度效應</span>
            <p className="leading-relaxed">酒精與水混合是放熱反應——加水後液溫會升高。降度應在 15–20°C 的環境中分次、緩慢進行，讓分子有時間重新排列。急速加水可能導致乳化（Louching，出現白濁）。</p>
          </div>
          <div className="flex gap-4 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0 w-20">休息時間</span>
            <p className="leading-relaxed">降度後的酒液需要「休息」（Marrying/Resting）數週到數月，讓水分子與酒精分子及風味化合物重新達到穩定的分子間平衡。未經充分休息的酒液口感會顯得「分離」——水味與酒精味各說各話。</p>
          </div>
          <div className="flex gap-4 items-start">
            <span className="font-mono text-neon-amber flex-shrink-0 w-20">桶強裝瓶</span>
            <p className="leading-relaxed">「Cask Strength」（桶強）裝瓶是指不加水降度，直接以桶中酒精度裝瓶（通常 50–65% ABV）。桶強威士忌保留了最完整的風味濃度與質地，飲者可以自行決定加水量。品飲桶強酒時，建議先純飲感受原始風味，再逐滴加水觀察香氣的開展與口感的變化。</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg text-text-warm mb-3">
          品飲加水的科學
          <span className="font-mono text-xs text-charcoal-500 ml-2">Adding Water When Tasting</span>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          2017 年瑞典林奈大學（Linnaeus University）的研究發表在《Scientific Reports》上，
          解釋了為什麼加水能「開放」威士忌的風味。研究發現，關鍵風味分子「愈創木酚」（Guaiacol，
          賦予煙燻與泥煤風味）在高酒精度時傾向與乙醇分子結合沉入液體深處；加水稀釋至 46% 以下後，
          乙醇-水的分子簇重新排列，將愈創木酚推向液面，使其更容易揮發進入品飲者的鼻腔。
          這也是為什麼許多品酒師建議先在純飲後添加一兩滴水，而非一開始就大量加水——
          「讓酒告訴你它需要多少水」。
        </p>
      </div>
    </div>
  )
}

/* ── Content Map & Page ─────────────────────────────────── */
const contentMap: Record<TabKey, () => React.JSX.Element> = {
  fundamentals: FundamentalsContent,
  stills: StillsContent,
  barrels: BarrelsContent,
  special: SpecialContent,
  water: WaterContent,
}

export default function DistillationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('fundamentals')
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
            Distillation & Barrel Science
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
            蒸餾與木桶科學
          </h1>
          <p className="text-text-secondary max-w-3xl">
            從蒸餾器的物理化學到橡木桶的風味煉金術——深入理解烈酒風味誕生的每一個環節。
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
