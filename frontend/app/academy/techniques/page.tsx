'use client'

import { useState } from 'react'
import Link from 'next/link'
import AcademyTracker from '../../../components/AcademyTracker'

/* ================================================================
   Data — 基礎技法 (1-6) + 進階技法 (7-10)
   ================================================================ */

interface Step {
  title: string
  desc: string
  emoji: string
  tip?: string
}

interface Technique {
  id: string
  icon: string
  title: string
  en: string
  difficulty: number
  color: string
  tools: { emoji: string; name: string }[]
  intro: string
  steps: Step[]
  mistakes: string[]
  recipes: string[]
  category: 'basic' | 'advanced'
}

const techniques: Technique[] = [
  /* ── 1. 搖盪法 Shake ──────────────────────────────────────── */
  {
    id: 'shake',
    icon: '🍸',
    title: '搖盪法',
    en: 'Shake',
    difficulty: 2,
    color: '#F5A623',
    tools: [
      { emoji: '🥤', name: 'Boston Shaker' },
      { emoji: '🔧', name: 'Hawthorne Strainer' },
      { emoji: '🥄', name: 'Jigger 量酒器' },
    ],
    intro:
      '搖盪法是最常見的調酒技法，透過劇烈搖晃讓材料在極短時間內充分混合、冷卻並產生適當的稀釋與口感。含有果汁、糖漿、蛋白或乳製品的配方幾乎都使用搖盪法。',
    steps: [
      {
        title: '量取材料',
        desc: '使用 Jigger 精確量取每一種材料，依序倒入 Boston Shaker 的玻璃杯（或小錫杯）中。先倒入成本較低的材料，萬一出錯可減少浪費。',
        emoji: '📏',
        tip: '量取黏稠糖漿時，可用吧叉匙輔助刮除殘留，確保分量準確。',
      },
      {
        title: '加入冰塊至杯口',
        desc: '將冰塊填滿至杯口約八分滿。冰塊應選用硬質大冰塊（而非碎冰），以控制稀釋速度。冰塊總表面積越大，冷卻越快但稀釋也越快。',
        emoji: '🧊',
        tip: '使用冷凍庫中靜置超過 24 小時的「乾冰塊」，表面更乾燥、稀釋率更低。',
      },
      {
        title: '扣上鋼杯密封',
        desc: '將大錫杯以約 45 度角扣在玻璃杯上，用掌根輕拍錫杯底部使其密封。確認無縫隙後，可稍微旋轉 10 度加強密封。',
        emoji: '🔒',
        tip: '密封時不要太用力拍擊，否則之後拆開會很困難。',
      },
      {
        title: '雙手握持搖盪',
        desc: '一手握住錫杯底部，另一手扣住玻璃杯底部，將雪克杯翻轉（錫杯朝上避免漏液）。以前後水平方向搖動 10–15 秒，節奏穩定有力。',
        emoji: '💪',
        tip: '搖盪軌跡呈橢圓形效果最佳。避免上下搖動——那只會讓手臂更酸，卻不會更有效率。',
      },
      {
        title: '觀察外壁結霜',
        desc: '當錫杯外壁出現均勻的白色結霜時，代表內部溫度已降至約 -5°C，此時即可停止搖盪。這是判斷搖盪完成的最佳視覺指標。',
        emoji: '❄️',
        tip: '夏天濕度高時結霜更快、更明顯；冬天乾燥時可能需要多搖 2–3 秒。',
      },
      {
        title: '拆開雪克杯',
        desc: '以掌根輕敲錫杯與玻璃杯的接合處側面，利用槓桿原理鬆開密封。避免朝自己或客人的方向施力。',
        emoji: '🫳',
        tip: '若卡住，可用熱水沖錫杯外壁，利用金屬膨脹係數差異鬆開。',
      },
      {
        title: '使用濾冰器過濾倒入杯中',
        desc: '將 Hawthorne Strainer 放在錫杯口，以食指控制彈簧間隙大小，將酒液過濾倒入已冰鎮的杯中。如需更清澈的質感，可加上 Fine Mesh Strainer 進行雙重過濾。',
        emoji: '🫗',
        tip: '倒酒時保持穩定的流速，避免空氣混入導致氣泡過多。',
      },
    ],
    mistakes: [
      '密封不緊導致搖盪時液體噴濺——拍合後務必確認無縫隙',
      '搖盪時間過長（超過 20 秒）導致過度稀釋，酒味寡淡',
      '使用碎冰搖盪，冷卻速度過快、稀釋難以控制',
      '搖完後從玻璃杯出酒——應從錫杯出酒，因為冰塊卡在錫杯中更方便過濾',
    ],
    recipes: ['Daiquiri', 'Whiskey Sour', 'Margarita'],
    category: 'basic',
  },

  /* ── 2. 攪拌法 Stir ───────────────────────────────────────── */
  {
    id: 'stir',
    icon: '🥃',
    title: '攪拌法',
    en: 'Stir',
    difficulty: 3,
    color: '#00FFFF',
    tools: [
      { emoji: '🫙', name: 'Mixing Glass 攪拌杯' },
      { emoji: '🥄', name: 'Bar Spoon 吧叉匙' },
      { emoji: '🔧', name: 'Julep Strainer' },
    ],
    intro:
      '攪拌法用於透明烈酒基底的調酒，保持酒液清澈、絲滑的質感，同時達到冷卻與稀釋的效果。為什麼不用搖的？因為搖盪會混入大量空氣氣泡，破壞純淨烈酒的透明度與口感。',
    steps: [
      {
        title: '冰鎮攪拌杯',
        desc: '在攪拌杯中放入冰塊，加入少許水，攪拌 10 秒後倒掉融水。這個步驟確保杯壁溫度降低，讓正式攪拌時稀釋率更可控。',
        emoji: '🧊',
        tip: '跳過冰鎮步驟的話，前 10 秒的攪拌幾乎都在「暖杯」而非冷卻酒液。',
      },
      {
        title: '量取材料倒入',
        desc: '使用 Jigger 精確量取所有材料，按配方順序倒入攪拌杯。先倒入苦精等少量材料，再倒入基酒。',
        emoji: '📏',
      },
      {
        title: '加入新鮮冰塊',
        desc: '倒掉冰鎮用的融水後，加入新鮮大冰塊至杯口約七分滿。冰塊應高出液面，確保所有酒液都被冰塊包圍。',
        emoji: '🧊',
        tip: '使用方形大冰塊，表面積與體積比最小，稀釋最可控。',
      },
      {
        title: '以吧叉匙攪拌 30–40 圈',
        desc: '以拇指、食指、中指夾住匙柄螺旋處，利用手指滾動（而非手腕旋轉）帶動冰塊沿杯壁平穩滑動。每圈速度一致，約 30–40 圈。',
        emoji: '🌀',
        tip: '正確的攪拌幾乎無聲——如果聽到冰塊碰撞杯壁，代表手法需要調整。',
      },
      {
        title: '使用隔冰器過濾出酒',
        desc: '將 Julep Strainer 凸面朝下放入攪拌杯，傾斜杯身將酒液穩定倒入已冰鎮的杯中。',
        emoji: '🫗',
        tip: '攪拌法調酒的理想稀釋率約 20–25%，可通過比較攪拌前後的重量來精確測量。',
      },
    ],
    mistakes: [
      '攪拌速度太快導致冰塊碎裂，酒液產生碎冰屑而混濁',
      '使用手腕大幅度旋轉而非手指滾動，失去控制力',
      '攪拌不足（低於 25 圈）——酒液未充分冷卻，口感刺激',
      '攪拌過度（超過 50 圈）——過度稀釋，烈酒風味被淡化',
    ],
    recipes: ['Martini', 'Manhattan', 'Negroni'],
    category: 'basic',
  },

  /* ── 3. 直調法 Build ──────────────────────────────────────── */
  {
    id: 'build',
    icon: '🥂',
    title: '直調法',
    en: 'Build',
    difficulty: 1,
    color: '#F5A623',
    tools: [
      { emoji: '🥃', name: '服務杯 Serving Glass' },
      { emoji: '🥄', name: 'Bar Spoon 吧叉匙' },
    ],
    intro:
      '直調法是最簡單的調酒技法——直接在服務杯中完成所有操作。特別適用於含有碳酸飲料的 Highball 類調酒，因為搖盪或過度攪拌都會讓氣泡消失。',
    steps: [
      {
        title: '冰鎮杯具',
        desc: '在杯中放滿冰塊或將杯子放入冷凍庫 10 分鐘。冰鎮過的杯壁能減緩冰塊融化速度。',
        emoji: '🧊',
      },
      {
        title: '加入基酒與材料',
        desc: '量取基酒倒入杯中，接著加入糖漿、果汁等非碳酸材料。碳酸飲料永遠最後加入。',
        emoji: '🍶',
        tip: '先加基酒再加冰，讓酒液先沉入杯底，有助於最終攪拌時的均勻混合。',
      },
      {
        title: '加入冰塊',
        desc: '填入冰塊至杯口。Highball 杯建議使用長條柱狀冰塊，融化慢、美觀且不佔太多空間。',
        emoji: '🧊',
      },
      {
        title: '加入碳酸飲料',
        desc: '沿杯壁緩緩倒入通寧水、蘇打水或薑汁汽水，保留最多的氣泡。絕對不要從高處直接灌入。',
        emoji: '🫧',
        tip: '碳酸飲料從冰箱拿出後立即使用，室溫飲料氣泡含量更低。',
      },
      {
        title: '輕柔攪拌一圈',
        desc: '用吧叉匙從杯底輕輕挑起一次（lift and stir），讓材料微微混合即可。過度攪拌會讓碳酸消散。',
        emoji: '🥄',
        tip: '只需要一到兩圈！Highball 的靈魂就是那股綿密的氣泡感。',
      },
    ],
    mistakes: [
      '碳酸飲料太早加入，後續攪拌導致氣泡完全消失',
      '攪拌太多圈——一到兩圈足矣',
      '使用溫度不夠低的杯子，冰塊快速融化導致酒味稀薄',
    ],
    recipes: ['Gin & Tonic', 'Highball', 'Cuba Libre'],
    category: 'basic',
  },

  /* ── 4. 擲壺法 Roll / Throw ──────────────────────────────── */
  {
    id: 'roll',
    icon: '🫗',
    title: '擲壺法',
    en: 'Roll / Throw',
    difficulty: 4,
    color: '#9B59B6',
    tools: [
      { emoji: '🥤', name: '兩個錫杯 Two Tins' },
      { emoji: '🔧', name: 'Hawthorne Strainer' },
    ],
    intro:
      '擲壺法（又稱拋接法）是在兩個容器之間反覆倒酒的技法，讓酒液在空氣中流動以獲得柔和的充氣感，同時避免搖盪法帶來的過度稀釋與劇烈乳化。這是製作 Bloody Mary 的經典手法。',
    steps: [
      {
        title: '準備兩個容器',
        desc: '通常使用兩個 Boston Shaker 錫杯，或一個錫杯加一個攪拌杯。在其中一個容器中加入所有材料與冰塊。',
        emoji: '🥤',
      },
      {
        title: '裝上隔冰器',
        desc: '在裝有冰塊的容器上放上 Hawthorne Strainer，防止冰塊在傾倒時掉出。',
        emoji: '🔧',
      },
      {
        title: '高位傾倒至另一容器',
        desc: '舉高裝有酒液的容器，讓酒液從高處以細長流柱倒入下方的空容器。兩容器間距離約 30–50 公分。',
        emoji: '⬇️',
        tip: '開始時距離短一些（20 公分），熟練後再逐漸加大距離以增加表演效果。',
      },
      {
        title: '反覆來回 4–6 次',
        desc: '將酒液在兩容器間來回傾倒 4–6 次。每次傾倒都讓酒液與空氣接觸，產生微妙的氧化與充氣。',
        emoji: '🔄',
        tip: '次數越多，充氣感越明顯，但溫度也會略微上升（因為脫離冰塊接觸）。',
      },
      {
        title: '倒入服務杯',
        desc: '完成擲壺後，將酒液最終過濾倒入裝有新鮮冰塊的服務杯中。',
        emoji: '🫗',
      },
    ],
    mistakes: [
      '距離太遠導致酒液噴濺——循序漸進增加距離',
      '傾倒速度太快，液柱太粗，無法有效充氣',
      '忘記使用隔冰器，冰塊跟著酒液一起倒出',
    ],
    recipes: ['Bloody Mary', 'Ramos Gin Fizz（初步混合）', 'Café de Olla Cocktail'],
    category: 'basic',
  },

  /* ── 5. 搗壓法 Muddle ─────────────────────────────────────── */
  {
    id: 'muddle',
    icon: '🌿',
    title: '搗壓法',
    en: 'Muddle',
    difficulty: 2,
    color: '#00FFFF',
    tools: [
      { emoji: '🪵', name: 'Muddler 搗碎棒' },
      { emoji: '🥤', name: 'Shaker 或杯具' },
    ],
    intro:
      '搗壓法透過物理壓力釋放新鮮食材中的精油、果汁與香氣分子。關鍵在於力度控制——薄荷葉只需輕壓釋放精油，而萊姆角則需要較大的力道榨出果汁。',
    steps: [
      {
        title: '將食材放入容器底部',
        desc: '將需要搗壓的水果、香草或糖塊放入搖酒器或杯子底部。可先加入少許糖漿作為潤滑。',
        emoji: '🫙',
      },
      {
        title: '判斷食材類型決定力度',
        desc: '香草類（薄荷、羅勒）只需輕壓 3–5 下釋放精油；柑橘類（萊姆、檸檬）需要較大力壓榨果汁；漿果類需中等力度壓破表皮。',
        emoji: '🤔',
        tip: '薄荷的精油在葉面，輕壓即可釋放；過度搗碎會破壞葉脈釋放苦澀單寧。',
      },
      {
        title: '以旋壓方式搗碎',
        desc: '握住搗碎棒，以穩定的向下壓力配合輕微旋轉的方式搗壓。不需要像搗蒜一樣猛力捶打。',
        emoji: '🔄',
      },
      {
        title: '檢查搗壓成果',
        desc: '薄荷應呈現微微破損但仍保持完整的葉形；萊姆角應已擠出大部分果汁；糖塊應完全溶解於液體中。',
        emoji: '👀',
        tip: '如果薄荷變成深綠色糊狀，就搗過頭了。',
      },
      {
        title: '加入其餘材料繼續調製',
        desc: '搗壓完成後，按照配方加入其餘材料和冰塊，繼續進行搖盪或直調。',
        emoji: '➡️',
      },
    ],
    mistakes: [
      '暴力搗碎薄荷導致苦味——輕壓即可，聞到香氣就夠了',
      '搗壓柑橘時連皮白色髓部都壓碎，產生強烈苦味',
      '搗壓後不過濾，殘渣影響口感與視覺',
    ],
    recipes: ['Mojito', 'Old Fashioned', 'Caipirinha'],
    category: 'basic',
  },

  /* ── 6. 分層法 Layer / Float ──────────────────────────────── */
  {
    id: 'layer',
    icon: '🌈',
    title: '分層法',
    en: 'Layer / Float',
    difficulty: 4,
    color: '#9B59B6',
    tools: [
      { emoji: '🥄', name: 'Bar Spoon 吧叉匙' },
      { emoji: '🥃', name: '直杯或 Shot Glass' },
    ],
    intro:
      '分層法利用不同材料的比重（Specific Gravity）差異，讓液體自然形成視覺層次。比重越大的材料越沉底。核心原則：糖漿（~1.3）> 利口酒（~1.1）> 果汁（~1.0）> 烈酒（~0.9）。',
    steps: [
      {
        title: '了解比重順序',
        desc: '從重到輕排列你的材料：石榴糖漿（1.30+）→ 咖啡利口酒（1.15）→ 愛爾蘭奶酒（1.05）→ 烈酒（0.91–0.95）。越甜含糖越高的材料比重越大。',
        emoji: '⚖️',
        tip: '不確定比重時，用兩個小杯做測試——將少量 A 液滴入 B 液表面，觀察是否浮起。',
      },
      {
        title: '倒入最重的材料',
        desc: '先將比重最大的材料（通常是糖漿或甜利口酒）直接倒入杯底。',
        emoji: '⬇️',
      },
      {
        title: '將吧叉匙背面抵住杯壁',
        desc: '拿起吧叉匙，將匙背（凸面朝上）輕輕貼在杯壁內側，匙面幾乎碰到前一層液面。',
        emoji: '🥄',
      },
      {
        title: '沿匙背緩緩倒入下一層',
        desc: '以極慢的速度，讓液體沿著吧叉匙的背面滑入杯中。液體接觸到下層表面時會自然散開形成新的一層。',
        emoji: '🫗',
        tip: '倒越慢越好。如果兩層混在一起，代表倒太快或材料的比重差異不夠大。',
      },
      {
        title: '重複直到完成所有層次',
        desc: '逐層由重到輕加入所有材料。每層之間可稍微等待幾秒讓液面穩定。',
        emoji: '🌈',
      },
    ],
    mistakes: [
      '材料溫度差異太大——冷液體倒入熱液體會產生對流，破壞分層',
      '倒入速度太快——液體衝破下層表面，兩層混合',
      '比重順序搞錯——輕的材料沉不下去，反而會浮在已有的層上面',
    ],
    recipes: ['B-52', 'Pousse Café', 'Tequila Sunrise（漸層）'],
    category: 'basic',
  },

  /* ── 7. 乾搖法 Dry Shake ──────────────────────────────────── */
  {
    id: 'dry-shake',
    icon: '🥚',
    title: '乾搖法',
    en: 'Dry Shake',
    difficulty: 3,
    color: '#F5A623',
    tools: [
      { emoji: '🥤', name: 'Boston Shaker' },
      { emoji: '🔧', name: 'Hawthorne Strainer' },
      { emoji: '🧲', name: 'Strainer Spring（彈簧）' },
    ],
    intro:
      '乾搖法是專為含有蛋白（蛋清）或水性鮮奶油的調酒設計的進階搖盪技法。先不加冰搖盪讓蛋白充分乳化形成穩定泡沫，再加冰搖盪冷卻。這樣能獲得更厚實綿密的泡沫層。',
    steps: [
      {
        title: '加入所有材料（不加冰）',
        desc: '將蛋白、基酒、果汁、糖漿等所有材料倒入搖酒器中。此時不加任何冰塊。',
        emoji: '🥚',
      },
      {
        title: '放入彈簧作為攪拌球',
        desc: '從 Hawthorne Strainer 上取下彈簧，放入搖酒器中。彈簧在搖盪時能打散蛋白纖維，加速乳化效果。',
        emoji: '🧲',
        tip: '沒有備用彈簧的話，一顆乾淨的小冰塊也可以短暫替代（但效果較差）。',
      },
      {
        title: '乾搖 15–20 秒',
        desc: '密封搖酒器，大力搖盪 15–20 秒。因為沒有冰塊的低溫，蛋白蛋白質更容易展開並形成穩定的氣泡結構。',
        emoji: '💪',
        tip: '乾搖時容器內壓力會增大（蛋白釋放氣體），小心拆開時不要朝人。',
      },
      {
        title: '加入冰塊進行濕搖',
        desc: '打開搖酒器，加入滿滿的冰塊，重新密封。再搖盪 10–15 秒至外壁結霜。',
        emoji: '🧊',
      },
      {
        title: '雙重過濾倒入杯中',
        desc: '使用 Hawthorne Strainer 加 Fine Mesh Strainer 雙重過濾，讓泡沫順滑地流入杯中，形成厚實的白色泡沫層。',
        emoji: '🫗',
        tip: '倒完後等待 30 秒讓泡沫浮起穩定，再用苦精或香料在泡沫表面作裝飾。',
      },
    ],
    mistakes: [
      '省略乾搖步驟直接加冰搖——泡沫薄且不穩定，30 秒內就消散',
      '乾搖時間不足（少於 10 秒）——蛋白未充分乳化',
      '使用不新鮮的蛋白——起泡力差且有腥味',
    ],
    recipes: ['Whiskey Sour（含蛋白版）', 'Ramos Gin Fizz', 'Pisco Sour'],
    category: 'advanced',
  },

  /* ── 8. 油脂洗滌 Fat Washing ──────────────────────────────── */
  {
    id: 'fat-wash',
    icon: '🧈',
    title: '油脂洗滌',
    en: 'Fat Washing',
    difficulty: 5,
    color: '#00FFFF',
    tools: [
      { emoji: '🫙', name: '密封玻璃罐' },
      { emoji: '🧊', name: '冷凍庫' },
      { emoji: '🔧', name: '咖啡濾紙 / Cheesecloth' },
    ],
    intro:
      '油脂洗滌是將油脂的風味注入烈酒的進階技法。原理是油脂中的脂溶性風味分子溶入酒精，然後透過冷凍使油脂凝固並分離，留下帶有油脂風味但無油膩口感的澄清酒液。',
    steps: [
      {
        title: '選擇油脂並融化',
        desc: '常用選項：培根油脂（煎培根後收集）、棕色奶油（Brown Butter）、椰子油、芝麻油等。固態油脂需先加熱融化至液態。',
        emoji: '🍳',
        tip: '油脂比例建議為每 750ml 烈酒使用 30–45ml 油脂。過多會讓酒過於油膩。',
      },
      {
        title: '將油脂與烈酒混合',
        desc: '在密封玻璃罐中混合溫熱的液態油脂與室溫烈酒。蓋緊後輕輕搖晃使兩者接觸。',
        emoji: '🫙',
      },
      {
        title: '室溫靜置浸漬',
        desc: '放置在室溫環境 4–8 小時（培根油脂約 4 小時即可，奶油建議 6–8 小時）。期間可偶爾輕搖一次。',
        emoji: '⏳',
        tip: '浸漬時間越長風味越濃，但超過 12 小時可能出現不悅的脂肪氧化味。',
      },
      {
        title: '冷凍至油脂凝固',
        desc: '將混合液放入冷凍庫至少 4 小時（建議過夜）。油脂會在表面凝固成一層固態白膜，而含有風味的酒液則維持液態。',
        emoji: '🧊',
      },
      {
        title: '去除凝固油脂',
        desc: '取出後用湯匙剝除表面凝固的油脂層。',
        emoji: '🫳',
      },
      {
        title: '過濾至澄清',
        desc: '用咖啡濾紙或 Cheesecloth 過濾酒液 2–3 次，去除所有殘留的細小油脂顆粒，直到酒液完全澄清。',
        emoji: '☕',
        tip: '耐心過濾是成功的關鍵。第一次過濾最慢，之後會越來越快。',
      },
    ],
    mistakes: [
      '油脂溫度過高（超過 60°C）倒入酒精——可能產生危險蒸氣',
      '冷凍時間不足，油脂未完全凝固就急著過濾',
      '過濾不徹底，殘留油脂讓最終調酒表面浮油',
    ],
    recipes: ['Benton\'s Old Fashioned（培根波本）', 'Brown Butter Martini', 'Coconut Rum Daiquiri'],
    category: 'advanced',
  },

  /* ── 9. 煙燻 Smoking ─────────────────────────────────────── */
  {
    id: 'smoke',
    icon: '💨',
    title: '煙燻',
    en: 'Smoking',
    difficulty: 4,
    color: '#9B59B6',
    tools: [
      { emoji: '🔫', name: 'Smoking Gun 煙燻槍' },
      { emoji: '🪵', name: '木屑 Wood Chips' },
      { emoji: '🔔', name: 'Cloche 玻璃罩' },
    ],
    intro:
      '煙燻技法為調酒增添迷人的木質煙燻風味與戲劇性的視覺效果。可使用煙燻槍精確控制煙量，或以火炬炙燒木片在玻璃杯上方產生煙霧。不同木屑帶來不同風味：Cherry（甜）、Hickory（強烈）、Applewood（柔和果香）。',
    steps: [
      {
        title: '選擇木屑類型',
        desc: 'Cherry 櫻桃木帶甜味，適合威士忌類；Applewood 蘋果木柔和，適合琴酒或伏特加基底；Hickory 山胡桃木煙味最強，適合 Mezcal 類。也可使用肉桂棒、茶葉等替代品。',
        emoji: '🪵',
      },
      {
        title: '準備杯具與煙燻槍',
        desc: '將木屑放入煙燻槍的燃燒室。準備好服務杯——可先倒扣杯子在平面上，留出進煙口。',
        emoji: '🔧',
      },
      {
        title: '點燃木屑注入煙霧',
        desc: '點燃煙燻槍，讓煙霧通過導管進入倒扣的杯子中或覆蓋有 Cloche 的杯具下方。灌煙 5–10 秒即可。',
        emoji: '🔥',
        tip: '煙霧量不需太多——輕薄的一層就足夠。過多煙霧反而讓酒嘗起來像煙灰。',
      },
      {
        title: '靜置讓煙霧附著',
        desc: '讓煙霧在密封的空間中靜置 30–60 秒，使煙味粒子附著在杯壁或酒液表面。',
        emoji: '⏳',
      },
      {
        title: '倒入調酒並呈現',
        desc: '翻正杯子（或掀開 Cloche），立即倒入已調製好的酒液。煙霧散出的瞬間就是最佳的上桌時機。',
        emoji: '✨',
        tip: 'Cloche 呈現法更具戲劇性——在客人面前掀開玻璃罩，煙霧緩緩散出。',
      },
    ],
    mistakes: [
      '煙燻過度——酒嘗起來像壁爐灰而非優雅的木質香',
      '使用含有化學處理的木屑——務必使用食品級木屑',
      '煙霧流失過快——密封不良導致風味無法附著',
    ],
    recipes: ['Smoked Old Fashioned', 'Mezcal Negroni（煙燻版）', 'Penicillin（煙燻版）'],
    category: 'advanced',
  },

  /* ── 10. 澄清法 Clarification ─────────────────────────────── */
  {
    id: 'clarify',
    icon: '🔬',
    title: '澄清法',
    en: 'Clarification',
    difficulty: 5,
    color: '#00FFFF',
    tools: [
      { emoji: '🥛', name: '全脂牛奶' },
      { emoji: '🔧', name: '咖啡濾紙 / Cheesecloth' },
      { emoji: '🫙', name: '大容器 × 2' },
    ],
    intro:
      '澄清法將渾濁的調酒轉化為水晶般透明的液體，同時保留原有風味。最經典的是牛奶澄清法（Milk Punch Clarification）：利用牛奶蛋白遇酸凝結的特性，將酒中的懸浮物質一同包裹沉澱，過濾後留下清澈酒液。',
    steps: [
      {
        title: '調製「母液」',
        desc: '按照配方將所有調酒材料（烈酒、柑橘汁、糖漿、茶等）混合在一個大容器中。配方需包含酸性成分（柑橘汁），因為酸是觸發牛奶凝結的關鍵。',
        emoji: '🫙',
      },
      {
        title: '加入全脂牛奶',
        desc: '在另一個容器中量取全脂牛奶（比例約為總酒液的 10–15%）。將酸性母液「緩慢」倒入牛奶中（不是反過來），讓牛奶蛋白遇酸自然凝結。',
        emoji: '🥛',
        tip: '一定是酒液倒入牛奶！反過來的話凝乳效果很差。',
      },
      {
        title: '等待凝結',
        desc: '靜置 1–2 小時。牛奶會形成大量的白色凝乳（Curd），這些凝乳會吸附酒液中的渾濁物質、果肉纖維和部分單寧。',
        emoji: '⏳',
        tip: '可以放入冰箱靜置過夜，凝結更完全。',
      },
      {
        title: '過濾凝乳',
        desc: '用 Cheesecloth 或咖啡濾紙覆蓋在容器上，慢慢將混合液倒入過濾。第一次過濾的液體可能仍然渾濁——將其再次倒回凝乳上方重複過濾。',
        emoji: '☕',
      },
      {
        title: '反覆過濾直到清澈',
        desc: '通常需要過濾 3–5 次。凝乳本身會形成天然的濾層，每次過濾都會更清澈。最終液體應如清水般透明，但嘗起來保有完整的調酒風味。',
        emoji: '✨',
        tip: '整個過程耗時但值得。澄清後的酒液可在冰箱保存數週不變質。',
      },
    ],
    mistakes: [
      '牛奶倒入酒液（順序錯誤）——凝結效果大幅降低',
      '使用脫脂牛奶——脂肪含量不足，凝乳質量差',
      '過濾時擠壓凝乳想加速——這會把渾濁物質擠回酒液中',
      '母液中缺少酸性成分——沒有酸就無法觸發牛奶凝結',
    ],
    recipes: ['Clarified Milk Punch', 'Crystal Clear Margarita', 'Transparent Piña Colada'],
    category: 'advanced',
  },
]

/* ================================================================
   Component
   ================================================================ */

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Difficulty ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'text-neon-amber' : 'text-charcoal-600'}>
          ★
        </span>
      ))}
    </span>
  )
}

export default function TechniquesPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = techniques.filter((t) => t.category === activeTab)

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="techniques" />

      {/* ── Header ──────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-12 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回學院
        </Link>
        <div className="mt-8">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3 animate-fade-in">
            Technique Tutorials
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2 animate-fade-in">
            調酒技法圖解
          </h1>
          <p className="text-text-secondary max-w-3xl animate-fade-in">
            從基礎搖盪到進階澄清，每一種技法都有詳細的步驟拆解、專家提示與常見錯誤警示。
            <br />
            <span className="text-text-muted text-sm">
              Step-by-step visual guides for every cocktail-making technique.
            </span>
          </p>
        </div>
      </section>

      {/* ── Tab Bar ─────────────────────────────────────── */}
      <section className="px-6 max-w-6xl mx-auto">
        <div className="flex gap-2 mb-10">
          <button
            onClick={() => { setActiveTab('basic'); setExpandedId(null) }}
            className={`px-5 py-2.5 font-mono text-sm tracking-wider transition-all duration-300 border ${
              activeTab === 'basic'
                ? 'border-neon-amber text-neon-amber bg-neon-amber/10 shadow-neon-amber'
                : 'border-charcoal-700 text-charcoal-500 hover:text-text-warm hover:border-charcoal-500'
            }`}
          >
            基礎技法 Basics（1–6）
          </button>
          <button
            onClick={() => { setActiveTab('advanced'); setExpandedId(null) }}
            className={`px-5 py-2.5 font-mono text-sm tracking-wider transition-all duration-300 border ${
              activeTab === 'advanced'
                ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10 shadow-neon-cyan'
                : 'border-charcoal-700 text-charcoal-500 hover:text-text-warm hover:border-charcoal-500'
            }`}
          >
            進階技法 Advanced（7–10）
          </button>
        </div>
      </section>

      {/* ── Technique Cards ─────────────────────────────── */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="space-y-6">
          {filtered.map((t, idx) => {
            const isExpanded = expandedId === t.id
            const globalIndex = activeTab === 'basic' ? idx + 1 : idx + 7

            return (
              <div key={t.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                {/* ── Collapsed Card Header ── */}
                <button
                  onClick={() => toggle(t.id)}
                  className={`w-full text-left glass-card p-6 md:p-8 group transition-all duration-300 ${
                    isExpanded ? 'border-l-2' : 'hover:border-neon-amber'
                  }`}
                  style={isExpanded ? { borderLeftColor: t.color } : undefined}
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    {/* Number */}
                    <div
                      className="shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center border font-mono text-lg md:text-xl font-bold"
                      style={{ borderColor: t.color, color: t.color }}
                    >
                      {String(globalIndex).padStart(2, '0')}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-3xl">{t.icon}</span>
                        <h2 className="font-display text-xl md:text-2xl text-text-warm group-hover:text-neon-amber transition-colors">
                          {t.title}
                        </h2>
                        <span className="font-mono text-xs text-charcoal-500">{t.en}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-charcoal-500">難度</span>
                          <StarRating rating={t.difficulty} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {t.tools.map((tool) => (
                            <span
                              key={tool.name}
                              className="font-mono text-xs bg-bg-tertiary border border-charcoal-700 text-text-secondary px-2 py-0.5 rounded-sm"
                            >
                              {tool.emoji} {tool.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                        {t.intro}
                      </p>
                    </div>

                    {/* Expand chevron */}
                    <div
                      className={`shrink-0 font-mono text-charcoal-500 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </div>
                  </div>
                </button>

                {/* ── Expanded Content ── */}
                {isExpanded && (
                  <div className="mt-1 space-y-8 pl-4 md:pl-10 animate-fade-in">
                    {/* Intro */}
                    <div className="glass-card p-6 border-l-2" style={{ borderLeftColor: t.color }}>
                      <p className="text-text-secondary text-sm leading-relaxed">{t.intro}</p>
                    </div>

                    {/* Steps */}
                    <div>
                      <h3 className="font-display text-lg text-text-warm mb-4">
                        步驟拆解{' '}
                        <span className="font-mono text-xs text-charcoal-500 ml-2">
                          Steps ({t.steps.length})
                        </span>
                      </h3>

                      <div className="relative pl-8">
                        {/* Vertical connecting line */}
                        <div
                          className="absolute left-3 top-0 bottom-0 w-px"
                          style={{ backgroundColor: t.color, opacity: 0.3 }}
                        />

                        <div className="space-y-4">
                          {t.steps.map((step, si) => (
                            <div key={si} className="relative">
                              {/* Progress dot */}
                              <div
                                className="absolute -left-8 top-5 w-6 h-6 flex items-center justify-center border-2 bg-bg-primary z-10 text-[10px] font-mono font-bold"
                                style={{ borderColor: t.color, color: t.color }}
                              >
                                {si + 1}
                              </div>

                              <div
                                className="glass-card p-5 border-l-2 transition-colors duration-300"
                                style={{ borderLeftColor: t.color }}
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <span className="text-2xl">{step.emoji}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <span
                                        className="font-mono text-2xl font-bold opacity-30"
                                        style={{ color: t.color }}
                                      >
                                        {String(si + 1).padStart(2, '0')}
                                      </span>
                                      <h4 className="font-display text-lg text-text-warm">
                                        {step.title}
                                      </h4>
                                    </div>
                                    <p className="text-text-secondary text-sm leading-relaxed">
                                      {step.desc}
                                    </p>
                                  </div>
                                </div>

                                {/* Pro Tip */}
                                {step.tip && (
                                  <div className="mt-3 ml-9 px-4 py-3 border border-neon-cyan/30 bg-neon-cyan/5 rounded-sm">
                                    <p className="text-sm leading-relaxed">
                                      <span className="text-neon-cyan font-mono text-xs font-bold mr-2">
                                        💡 PRO TIP
                                      </span>
                                      <span className="text-text-secondary">{step.tip}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Common Mistakes */}
                    <div>
                      <h3 className="font-display text-lg text-text-warm mb-4">
                        常見錯誤{' '}
                        <span className="font-mono text-xs text-charcoal-500 ml-2">Common Mistakes</span>
                      </h3>
                      <div className="space-y-3">
                        {t.mistakes.map((m, mi) => (
                          <div
                            key={mi}
                            className="glass-card p-4 border-l-2 border-red-500/60 bg-red-500/5"
                          >
                            <p className="text-sm text-text-secondary leading-relaxed">
                              <span className="text-red-400 mr-2">⚠️</span>
                              {m}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recipes */}
                    <div className="pb-4">
                      <h3 className="font-display text-lg text-text-warm mb-4">
                        適用調酒{' '}
                        <span className="font-mono text-xs text-charcoal-500 ml-2">Works Great With</span>
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {t.recipes.map((r) => (
                          <span
                            key={r}
                            className="font-mono text-sm px-4 py-2 border border-neon-amber/40 text-neon-amber bg-neon-amber/5 rounded-sm"
                          >
                            🍹 {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
