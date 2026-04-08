import Link from 'next/link'
import AcademyTracker from '../../../components/AcademyTracker'

/* ── Section A: 核心器材 ────────────────────────────────── */
const essentialTools = [
  {
    name: 'Boston Shaker',
    zh: '波士頓雪克杯',
    desc: '由一個金屬錫杯（Tin）與一個玻璃杯（或雙錫杯組合）組成，是專業吧台最常見的搖酒器。金屬錫杯容量通常為 28 盎司，搭配的玻璃杯或小錫杯為 16 盎司。使用時將兩者對接並以掌根拍緊密封，搖盪完成後以掌根輕擊錫杯側面即可分離。',
    usage: '適用於所有需要搖盪的調酒，特別是含有柑橘汁、蛋白或乳製品的配方。雙錫杯組合更適合高速出杯的商業環境，因為不易破碎且散熱更快。',
    tips: '新手常見錯誤是密封不夠緊導致液體外漏。建議拍合後稍微旋轉錫杯 10 度，確認密封牢固。清洗後務必分開放置，避免金屬氧化產生異味。',
  },
  {
    name: 'Cobbler Shaker',
    zh: '三件式雪克杯',
    desc: '由杯身、內建濾網蓋與頂蓋三個部分組成，是最適合居家調酒的入門器材。容量通常在 12–18 盎司之間。內建的濾網省去了額外使用隔冰器的步驟，操作直覺且優雅。',
    usage: '適合製作簡單的搖盪類調酒，如 Cosmopolitan、Whiskey Sour 等。因為濾孔較大，含有碎冰或果肉的調酒可能需要額外的細目濾網。',
    tips: '與 Boston Shaker 相比，Cobbler 的散熱效率較低，搖盪時間需增加 2–3 秒。頂蓋有時會因為溫度收縮而卡住，可用熱水沖杯身外壁來鬆開。',
  },
  {
    name: 'Jigger 量酒器',
    zh: '量酒器',
    desc: '雙頭錐形量杯，是確保調酒精準度的關鍵器材。標準規格為大端 2 盎司（60ml）、小端 1 盎司（30ml），內壁通常刻有 ½ oz、¾ oz 等刻度線。日式量酒器（Japanese Jigger）更為修長，倒酒時液面穩定、易於判讀。',
    usage: '所有調酒配方都應使用量酒器精確量取。即使是經驗豐富的調酒師，自由倒酒（Free Pour）的誤差也可能達到 10–15%，足以改變一杯酒的平衡。',
    tips: '量取時眼睛應與液面齊平，避免俯視造成的視差。黏稠液體（如糖漿、蜂蜜）量取後可用吧叉匙輔助刮除殘留。建議備有 1oz/2oz 與 ½oz/¾oz 兩組量酒器。',
  },
  {
    name: 'Bar Spoon 吧叉匙',
    zh: '吧叉匙',
    desc: '長度通常為 30–40 公分的細長湯匙，匙柄帶有螺旋紋路，是攪拌法調酒的靈魂工具。頂端依款式不同可能是叉子、圓盤或水滴造型。日式吧叉匙更輕、更長，手感更為細膩。',
    usage: '主要用於攪拌法（Stir）調酒，如 Martini、Manhattan、Negroni。也可用於分層（Float）操作——沿匙背緩緩倒入液體即可產生美麗的層次。此外也是量取少量材料（1 bar spoon ≈ 5ml）的便捷工具。',
    tips: '攪拌時以拇指與食指、中指夾持匙柄螺旋處，利用手指滾動而非手腕旋轉來帶動冰塊。正確的攪拌幾乎無聲，冰塊不應碰撞杯壁。',
  },
  {
    name: 'Muddler 攪碎棒',
    zh: '搗碎棒',
    desc: '用於在杯中或搖酒器中壓碎水果、香草及糖塊的棒狀工具。材質有木質、不鏽鋼與塑膠三種，底部可分為平面與齒狀兩種設計。長度約 20–25 公分。',
    usage: '製作 Mojito、Old Fashioned、Caipirinha 等需要搗碎新鮮食材的經典調酒。搗碎薄荷時僅需輕壓釋放精油，過度搗碎會產生苦味（來自葉脈中的單寧）。',
    tips: '木質搗碎棒手感最佳，但容易吸附味道，需定期以小蘇打水浸泡清潔。不鏽鋼款易於清洗但重量較大。齒狀底部適合搗碎水果，平面底部適合壓碎薄荷與糖塊。',
  },
  {
    name: 'Hawthorne Strainer',
    zh: '霍桑隔冰器',
    desc: '最常見的隔冰器，以金屬彈簧圈環繞濾盤為特徵。彈簧可以貼合各種口徑的搖酒器或調酒杯，有效過濾冰塊及較大的固體殘渣。專業款通常有 2–4 個凸耳（Prong）用於固定。',
    usage: '主要搭配 Boston Shaker 使用。搖盪完成後，將隔冰器放置於錫杯口，以食指控制彈簧間隙的大小來調節過濾粗細度——間隙越小，過濾越精細。',
    tips: '使用後務必拆下彈簧清洗，否則會殘留果汁或蛋白在彈簧縫隙中滋生細菌。高品質的隔冰器彈簧緊密度一致，過濾效果更穩定。',
  },
  {
    name: 'Julep Strainer',
    zh: '朱利普隔冰器',
    desc: '碗狀多孔金屬匙，外型類似大型穿孔湯匙，歷史比 Hawthorne 更為悠久。最初是讓飲酒者擋住杯中碎冰直接飲用的工具，後來演變為調酒隔冰器。',
    usage: '傳統上搭配 Mixing Glass（攪拌杯）使用，因為攪拌法產生的冰塊較完整，不需要彈簧的精密過濾。將凸面朝下放入調酒杯中，傾斜倒出即可。',
    tips: '在攪拌法調酒中使用 Julep Strainer 比 Hawthorne 更為優雅且出酒速度更快。但如果攪拌杯中有碎冰，建議改用 Hawthorne 或加上 Fine Mesh Strainer 雙重過濾。',
  },
  {
    name: 'Mixing Glass',
    zh: '攪拌杯',
    desc: '厚壁玻璃杯，容量通常為 500–700ml，專門設計用於攪拌法調酒。優質攪拌杯底部較重以增加穩定性，杯壁厚度有助於控制冰塊融化速度，杯口設有導流嘴以便準確出酒。',
    usage: '所有烈酒主導（Spirit-forward）的攪拌類調酒，如 Martini、Manhattan、Negroni、Rob Roy 等。使用前建議先以冰塊冰鎮杯體 15–20 秒，倒掉融水後再加入材料。',
    tips: '水晶玻璃材質的攪拌杯導熱性更好，能讓調酒更快達到理想溫度。切勿使用洗碗機清洗，手洗並自然晾乾即可。日本無鉛水晶品牌如 Yarai 紋路設計兼具美學與防滑功能。',
  },
  {
    name: 'Fine Mesh Strainer',
    zh: '細目濾網',
    desc: '小型錐形金屬濾網，網目極細，用於「雙重過濾」（Double Strain）技術。直徑通常為 8–10 公分，附有短柄方便單手操作。',
    usage: '搭配 Hawthorne Strainer 進行雙重過濾，攔截碎冰屑、果肉纖維、蛋白碎片及香草殘渣，讓最終成品呈現清澈、絲滑的質感。所有使用柑橘汁或蛋白的調酒都建議雙重過濾。',
    tips: '過濾時以另一隻手輕拍濾網邊緣，可加速液體通過並減少殘留。使用後立即沖洗，蛋白乾燥後會堵塞網目，非常難以清潔。',
  },
]

const advancedTools = [
  {
    name: 'iSi Siphon 奶油發泡器',
    desc: '利用 N₂O 氣彈將液體快速注入氣體，可製作泡沫（Foam）、快速浸漬（Rapid Infusion）及氮氣咖啡等。調酒中常用於製作風味泡沫，如柑橘泡沫或伯爵茶泡沫，為飲品增添輕盈的口感層次。',
  },
  {
    name: 'Smoking Gun 煙燻槍',
    desc: '手持式冷煙產生器，可使用不同木屑（Cherry、Hickory、Applewood）為調酒增添煙燻風味而不改變溫度。常見手法是在倒扣的玻璃杯中灌煙，上桌時掀開杯罩讓煙霧散出，創造戲劇性的視覺效果。',
  },
  {
    name: 'Centrifuge 離心機',
    desc: '利用高速旋轉分離液體中的固體微粒，可將混濁的果汁澄清為透明液體（Clarified Juice），保留風味但完全改變質感。這是分子調酒學（Molecular Mixology）的進階設備，代表性應用如澄清萊姆汁 Daiquiri。',
  },
]

/* ── Section B: 調製手法 ────────────────────────────────── */
const techniques = [
  {
    name: '搖盪法',
    en: 'Shake',
    when: '含有柑橘汁、乳製品、蛋白、糖漿等不易混合的材料時使用。這是最常見的調酒手法，約 70% 的經典調酒都採用搖盪法。代表調酒：Daiquiri、Whiskey Sour、Margarita、Cosmopolitan。',
    science: '搖盪的核心目的有三：（1）冷卻——12–15 秒的搖盪可將酒液溫度從室溫降至 -5°C 左右；（2）稀釋——冰塊融化提供約 25–30% 的稀釋率，是完美平衡的關鍵；（3）乳化——劇烈的撞擊使柑橘汁中的精油、蛋白質與酒精充分乳化，產生絲滑的口感與持久的泡沫。搖盪過程中空氣也會被打入液體，增加體積感。',
    duration: '標準搖盪時間為 12–15 秒（約搖盪 20–25 下）。含蛋白的調酒（如 Whiskey Sour）建議先進行「乾搖」（Dry Shake，不加冰）10 秒以充分乳化蛋白，再加冰搖盪 12 秒。',
    mistakes: '常見錯誤：（1）搖盪時間過短（低於 8 秒），導致冷卻與稀釋不足；（2）冰塊填充不夠（應填滿搖酒器的 2/3）；（3）搖盪幅度太小，僅做前後搖動而非全方位翻滾；（4）使用碎冰搖盪導致過度稀釋。',
  },
  {
    name: '攪拌法',
    en: 'Stir',
    when: '所有材料均為烈酒或利口酒等透明液體時使用。攪拌法追求的是冷卻與稀釋的精確控制，同時保持酒液的清澈與絲綢般的質地。代表調酒：Martini、Manhattan、Negroni、Old Fashioned（變體）、Rob Roy。',
    science: '與搖盪法不同，攪拌法刻意避免將空氣打入酒液。空氣會改變烈酒的口感，使其變得「粗糙」而非「圓潤」。攪拌法的稀釋率約為 20–25%，比搖盪法略低，最終溫度也略高（約 -2°C），保留更多烈酒本身的風味與質地。',
    duration: '標準攪拌時間為 30–45 秒（約攪拌 50–70 圈）。攪拌的動作應由手指驅動而非手腕，吧叉匙沿杯壁以平穩的圓形軌跡運動，冰塊不應碰撞杯壁發出聲響。判斷完成的指標是杯壁外側出現均勻的水珠凝結。',
    mistakes: '常見錯誤：（1）攪拌過於用力導致冰塊碎裂；（2）使用過小的冰塊加速稀釋；（3）未預冷攪拌杯導致前段時間都在冷卻杯體而非酒液；（4）將含有柑橘汁的配方用攪拌法製作（Martini 加橄欖汁除外）。為什麼不搖？因為烈酒主導的調酒需要清澈的外觀和絲滑的口感，搖盪產生的氣泡和混濁會破壞這一特質。',
  },
  {
    name: '直調法',
    en: 'Build',
    when: '配方簡單、材料容易混合的調酒直接在飲用杯中製作。通常涉及烈酒與碳酸飲料的組合，不需要額外的搖酒器或攪拌杯。代表調酒：Gin & Tonic、Highball（威士忌蘇打）、Cuba Libre、Mojito（搗碎後直接加料）。',
    science: '直調法的關鍵在於正確的加料順序與保持碳酸飲料的氣泡。基本原則：（1）冰塊先行——先在杯中填滿冰塊；（2）烈酒先入——將烈酒倒在冰塊上；（3）碳酸飲料最後——沿杯壁緩慢倒入以減少氣泡流失；（4）輕柔攪拌——只需用吧叉匙輕拉 1–2 下即可混合，過度攪拌會讓碳酸逸散。',
    duration: '操作時間約 15–20 秒。重點在於速度與流暢度，冰塊接觸空氣越久融化越多。',
    mistakes: '常見錯誤：（1）先倒碳酸飲料再加烈酒，導致氣泡因酒精衝擊大量逸散；（2）使用太小的冰塊，快速融化稀釋飲品；（3）過度攪拌破壞碳酸；（4）未冰杯導致冰塊快速融化。',
  },
  {
    name: '滾動法',
    en: 'Roll',
    when: '材料濃稠或含有大量固體成分，需要溫和混合而非劇烈搖盪時使用。最經典的應用是 Bloody Mary，因為番茄汁搖盪後會產生過多泡沫且質地變得不悅。',
    science: '滾動法是將酒液在兩個容器之間來回倒轉，利用重力和短距離的落差來混合材料。這個過程提供了比攪拌法更強的混合力，但比搖盪法溫和得多，不會打入過多空氣。稀釋率約為 15–20%。',
    duration: '來回滾動 4–6 次即可。每次倒轉時保持約 15–20 公分的高度差，讓液體自然流動混合。',
    mistakes: '常見錯誤：（1）倒轉高度太大導致液體飛濺；（2）速度太快變成類似搖盪的效果；（3）忘記加冰導致無法冷卻。',
  },
  {
    name: '拋接法',
    en: 'Throw',
    when: '源自西班牙的古老技法，透過長距離拋接讓酒液充分與空氣接觸，增加氧化程度與香氣釋放。常用於 Sherry-based 調酒及需要柔化單寧的配方。',
    science: '拋接法的原理在於「微氧化」（Micro-aeration）。當液體從高處以細流形式落入低處的容器時，表面積急劇增大，空氣中的氧分子與酒液充分接觸。這類似於葡萄酒醒酒的原理，可以柔化烈酒的銳利感、釋放更多芳香物質，同時提供適度的冷卻與稀釋。最終效果介於搖盪與攪拌之間——有一定的空氣感但不混濁。',
    duration: '拋接 4–5 次，兩個容器間距約 60–90 公分。需要練習以確保液體精準落入接收容器。',
    mistakes: '常見錯誤：（1）距離太近失去效果；（2）距離太遠液體飛濺；（3）未使用足夠大的接收容器。這是最需要練習的技法，建議先用水練習。',
  },
]

/* ── Section C: 裝飾美學 ────────────────────────────────── */
const garnishes = [
  {
    name: '柑橘皮捲 Citrus Twist',
    desc: '使用 Y 型削皮刀或小刀從柑橘表面切下約 5cm × 2cm 的果皮，注意只取有色外皮（Zest），避免切到白色內皮（Pith）——白色部分含有苦味物質。將果皮置於拇指與食指之間，有色面朝向杯面，用力擠壓讓精油噴灑在酒液表面。你會看到細小的油霧在光線下閃爍。最後可將果皮扭轉成螺旋形掛在杯緣，或直接放入杯中。不同柑橘帶來不同風味：檸檬皮清新明亮、柳橙皮甜潤溫暖、葡萄柚皮微苦花香。',
  },
  {
    name: '火焰橙皮 Flamed Orange Peel',
    desc: '這是最具戲劇效果的裝飾技法。切取一片較厚的橙皮（約 3cm × 3cm），在杯面上方約 10 公分處點燃打火機或火柴，將橙皮有色面朝向火焰快速擠壓。柑橘精油（主要成分為 d-Limonene）具有可燃性，會瞬間產生一道明亮的火花，同時將焦糖化的精油沉降在酒面上，為 Old Fashioned 等經典調酒增添煙燻甜橙的複合風味。注意安全：確保周圍無易燃物，不要讓火焰靠近你的手指。',
  },
  {
    name: '食用花卉 Edible Flowers',
    desc: '紫羅蘭、薰衣草、蝶豆花、茉莉花、玫瑰花瓣等食用花卉為調酒帶來視覺上的精緻感。蝶豆花（Butterfly Pea Flower）尤其受歡迎，因為它含有花青素，遇酸性物質（如檸檬汁）會從藍色變為紫色，可創造令人驚艷的變色效果。使用花卉裝飾時務必確認來源為食用級別，避免使用園藝花店的花材（可能含有農藥）。',
  },
  {
    name: '煙燻轉移 Smoke Transfer',
    desc: '使用煙燻槍或燃燒木片在倒扣的玻璃杯中灌入煙霧，靜置 10–15 秒讓煙粒子附著在杯壁上，然後翻正杯子倒入調好的酒液。煙霧在上桌時緩緩溢出，視覺效果極為震撼。常用木屑包括蘋果木（Apple Wood，果香柔和）、櫻桃木（Cherry Wood，微甜）、胡桃木（Hickory，厚重煙燻）。此技法常搭配 Old Fashioned 或 Mezcal-based 調酒使用。',
  },
]

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <AcademyTracker sectionId="tools" />
      {/* ── Header ──────────────────────────────────── */}
      <section className="px-6 pt-20 pb-12 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回學院
        </Link>

        <div className="mt-8">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            Tools &amp; Techniques
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
            器材與手法
          </h1>
          <p className="text-text-secondary max-w-3xl">
            掌握吧台的核心裝備與調製技法——每一件器材都有它的使命，每一種手法都有科學的根據。
          </p>
        </div>
      </section>

      {/* ── Section A: 核心器材 ─────────────────────── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="divider-amber mb-8" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-2">
          核心器材
          <span className="font-mono text-sm text-charcoal-500 ml-3">Essential Tools</span>
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          這些是每位調酒師吧台上不可或缺的基礎裝備。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {essentialTools.map((tool) => (
            <div
              key={tool.name}
              className="glass-card p-7 hover:border-neon-amber transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl text-text-warm">{tool.zh}</h3>
                  <p className="font-mono text-xs text-neon-amber tracking-wider">{tool.name}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                <div>
                  <span className="font-mono text-xs text-charcoal-500 block mb-1">簡介</span>
                  <p>{tool.desc}</p>
                </div>
                <div>
                  <span className="font-mono text-xs text-charcoal-500 block mb-1">使用時機</span>
                  <p>{tool.usage}</p>
                </div>
                <div>
                  <span className="font-mono text-xs text-charcoal-500 block mb-1">小訣竅</span>
                  <p>{tool.tips}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 進階器材 */}
        <div className="mt-12">
          <h3 className="font-display text-xl text-text-warm mb-2">
            進階器材
            <span className="font-mono text-sm text-charcoal-500 ml-3">Advanced Equipment</span>
          </h3>
          <p className="text-text-muted text-sm mb-6">
            分子調酒學與現代技法所需的特殊設備。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advancedTools.map((tool) => (
              <div
                key={tool.name}
                className="glass-card p-6 hover:border-neon-amber transition-colors duration-300"
              >
                <h4 className="text-text-warm font-medium mb-1">{tool.name}</h4>
                <p className="text-text-secondary text-sm leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section B: 調製手法 ─────────────────────── */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="divider-amber mb-8" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-2">
          四大調製手法＋進階
          <span className="font-mono text-sm text-charcoal-500 ml-3">Techniques</span>
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          每種手法都有明確的適用場景，選錯手法可能毀掉一杯完美的配方。
        </p>

        <div className="space-y-6">
          {techniques.map((tech) => (
            <div
              key={tech.en}
              className="glass-card p-8 hover:border-neon-amber transition-colors duration-300"
            >
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <h3 className="font-display text-2xl text-text-warm">{tech.name}</h3>
                <span className="font-mono text-sm text-neon-amber tracking-wider">{tech.en}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-text-secondary leading-relaxed">
                <div>
                  <span className="font-mono text-xs text-neon-amber block mb-2">何時使用</span>
                  <p>{tech.when}</p>
                </div>
                <div>
                  <span className="font-mono text-xs text-neon-amber block mb-2">科學原理</span>
                  <p>{tech.science}</p>
                </div>
                <div>
                  <span className="font-mono text-xs text-neon-amber block mb-2">時間與動作</span>
                  <p>{tech.duration}</p>
                </div>
                <div>
                  <span className="font-mono text-xs text-neon-amber block mb-2">常見錯誤</span>
                  <p>{tech.mistakes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section C: 裝飾美學 ─────────────────────── */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="divider-amber mb-8" />
        <h2 className="font-display text-2xl md:text-3xl text-text-warm mb-2">
          裝飾美學
          <span className="font-mono text-sm text-charcoal-500 ml-3">Garnish Arts</span>
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          裝飾不只是好看——它是風味的延伸，也是第一印象的決定者。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {garnishes.map((g) => (
            <div
              key={g.name}
              className="glass-card p-7 hover:border-neon-amber transition-colors duration-300"
            >
              <h3 className="font-display text-lg text-text-warm mb-3">{g.name}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
