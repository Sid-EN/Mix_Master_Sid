'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Lesson {
  title: string
  desc: string
}

interface Level {
  lv: number
  name: string
  en: string
  duration: string
  color: string
  capstone: string
  unlock: string
  lessons: Lesson[]
}

const levels: Level[] = [
  {
    lv: 1,
    name: '入門調酒師',
    en: 'Novice',
    duration: '1–2 週',
    color: 'from-neon-amber/20 to-transparent',
    capstone: '獨立製作一杯完美的 Gin & Tonic——正確量酒、正確冰塊、正確比例、正確裝飾。拍攝成品照片並提交品飲筆記。',
    unlock: '無需條件，立即開始你的調酒之旅。',
    lessons: [
      {
        title: '冰塊科學',
        desc: '了解冰塊在調酒中的核心角色。不同形狀（大方冰、冰球、碎冰、Collins 冰柱）的融化速率與適用場景。清冰（Clear Ice）的製作原理——定向冷凍法去除氣泡與雜質。為什麼你的 Old Fashioned 需要一顆大冰球，而你的 Julep 需要碎冰？答案藏在表面積與體積的比例關係中。',
      },
      {
        title: '量酒精確度',
        desc: '使用 Jigger 的正確姿勢與讀數方法。視差（Parallax Error）對量酒的影響——眼睛必須與液面齊平。練習：同一配方分別使用目測倒酒與量酒器製作，盲飲比較差異。你會驚訝地發現 5ml 的偏差就能改變一杯酒的平衡。',
      },
      {
        title: '你的第一杯 Gin & Tonic',
        desc: '看似簡單卻暗藏細節的經典長飲。學習正確的製作流程：選擇杯型（Highball 或 Copa）→ 填滿冰塊 → 量取琴酒（50ml）→ 沿杯壁倒入通寧水（150ml）→ 以吧叉匙輕拉一下 → 裝飾（萊姆角或小黃瓜片）。討論不同琴酒與通寧水的搭配邏輯。',
      },
      {
        title: '認識你的工具',
        desc: '逐一認識 Boston Shaker、Jigger、Bar Spoon、Hawthorne Strainer、Muddler 的功能與正確使用方式。實作練習：拆解與組裝 Boston Shaker、練習攪拌手勢（手指驅動而非手腕旋轉）、Muddler 的力道控制。',
      },
      {
        title: '六大基酒概覽',
        desc: '快速認識伏特加、琴酒、蘭姆酒、龍舌蘭、威士忌、白蘭地的基本風味特徵與經典調酒代表。建立基酒風味的心理地圖，為後續深入學習打下基礎。',
      },
    ],
  },
  {
    lv: 2,
    name: '見習學員',
    en: 'Apprentice',
    duration: '3–4 週',
    color: 'from-neon-cyan/20 to-transparent',
    capstone: '製作三款 Sour 家族調酒（Classic Sour、Daiquiri、Margarita），調整酸甜比例至個人偏好，提交配方筆記與品飲心得。',
    unlock: '完成 Lv.1 所有課程並通過基礎工具操作測驗。',
    lessons: [
      {
        title: '酸甜平衡',
        desc: '調酒風味的黃金三角：烈酒（強度）× 酸（清新）× 甜（圓潤）。經典 Sour 比例為 2:1:1（2oz 烈酒、1oz 柑橘汁、¾–1oz 糖漿），但這只是起點。學習如何根據材料特性微調——萊姆比檸檬更酸、蜂蜜糖漿比簡單糖漿更濃稠、不同烈酒的甜度基線不同。實作：同一配方以三種不同酸甜比例製作，盲飲找出你的偏好。',
      },
      {
        title: 'Sour 家族譜系',
        desc: '從最古老的 Whiskey Sour 出發，探索整個 Sour 家族的演化：加入蛋白成為 Boston Sour、加入紅酒漂浮成為 New York Sour、將威士忌換成白蘭地成為 Brandy Sour、加入利口酒成為 Sidecar。理解「模板思維」——掌握一個模板，就能創造無限變化。',
      },
      {
        title: 'Daiquiri 完美複刻',
        desc: '三種材料、零容錯空間——Daiquiri 是檢驗調酒師功力的試金石。白蘭姆酒 60ml、新鮮萊姆汁 22ml、簡單糖漿 15ml。搖盪 12–15 秒，雙重過濾至冰鎮的 Coupette 杯。討論：為什麼 Daiquiri 不加裝飾？為什麼用萊姆而非檸檬？新鮮果汁 vs 瓶裝果汁的差異。',
      },
      {
        title: '糖漿製作工坊',
        desc: '簡單糖漿（1:1 糖水）、濃糖漿（2:1）、Demerara 糖漿（Raw Sugar）、蜂蜜糖漿（3:1 蜂蜜水）、薑糖漿、肉桂糖漿的製作方法。為什麼不直接在搖酒器中加糖？因為固體糖在冷液體中溶解不完全，會導致每一口甜度不一致。',
      },
      {
        title: '搖盪法精修',
        desc: '深入搖盪法的物理學。冰塊的填充量（2/3 滿）、搖盪軌跡（全方位翻滾 vs 前後直線）、乾搖（Dry Shake）與反向乾搖（Reverse Dry Shake）的差異與適用場景。蛋白調酒的特殊處理——先乾搖 10 秒充分乳化蛋白，再加冰搖盪 12 秒冷卻。',
      },
    ],
  },
  {
    lv: 3,
    name: '熟練調酒師',
    en: 'Journeyman',
    duration: '5–8 週',
    color: 'from-neon-purple/20 to-transparent',
    capstone: '製作完美的 Negroni 三件套（Negroni、Boulevardier、Negroni Sbagliato），並完成一篇 Vermouth 品飲報告（至少比較三款不同品牌）。',
    unlock: '通過 Lv.2 風味測驗——盲飲辨識三種柑橘汁與三種糖漿。',
    lessons: [
      {
        title: '攪拌法修煉',
        desc: '掌握吧叉匙的手指控制技法。以拇指、食指、中指三指夾持匙柄螺旋處，利用手指的滾動帶動攪拌動作。正確的攪拌近乎無聲——冰塊不碰杯壁、水花不飛濺。練習目標：以穩定節奏攪拌 30–45 秒，觀察杯壁出現均勻凝結水珠作為完成指標。',
      },
      {
        title: 'Vermouth 的世界',
        desc: '苦艾酒（Vermouth）是加烈葡萄酒（Fortified Wine）的一種，以植物（Wormwood 艾草為核心）浸泡調味。Dry Vermouth（法式，如 Noilly Prat、Dolin Dry）——草本花香，用於 Martini；Sweet Vermouth（義式，如 Carpano Antica Formula、Cocchi di Torino）——焦糖草本甜潤，用於 Manhattan 與 Negroni；Blanc/Bianco——甜但色淺。Vermouth 開瓶後必須冷藏，兩週內用完。',
      },
      {
        title: 'Negroni 三位一體',
        desc: '等比例的完美平衡——琴酒 30ml、Campari 30ml、Sweet Vermouth 30ml。攪拌法製作，倒入盛有大冰塊的 Old Fashioned 杯，橙皮裝飾。三種材料的苦、甜、草本、植物風味交織出令人上癮的複雜度。變體探索：Boulevardier（波本替換琴酒）、Sbagliato（Prosecco 替換琴酒）。',
      },
      {
        title: 'Manhattan 之夜',
        desc: '裸麥威士忌 60ml、Sweet Vermouth 30ml、Angostura Bitters 2 dash——攪拌法製作，倒入冰鎮的 Coupette 杯，Luxardo 櫻桃裝飾。討論裸麥 vs 波本的風格差異，以及不同 Sweet Vermouth 品牌對成品的影響。Perfect Manhattan（等量 Dry + Sweet Vermouth）的變化。',
      },
      {
        title: 'Martini 的流派',
        desc: '調酒界最具爭議性的經典。琴酒 vs 伏特加、Shaken vs Stirred、Dry vs Wet——每一個選擇都是品味的宣言。經典 Dry Martini：琴酒 60ml＋Dry Vermouth 10ml，攪拌法，檸檬皮或橄欖裝飾。Extra Dry Martini 僅以 Vermouth 洗杯。Dirty Martini 加入橄欖汁。Gibson 以珍珠洋蔥替代橄欖。',
      },
    ],
  },
  {
    lv: 4,
    name: '創意設計師',
    en: 'Creator',
    duration: '2–3 個月',
    color: 'from-flavor-tropical/20 to-transparent',
    capstone: '設計並提交你的 Signature Cocktail——包含配方、靈感來源、風味分析、製作流程與成品攝影。需接受導師品飲評分。',
    unlock: '提交 Lv.3 實作報告並通過攪拌法實作測驗。',
    lessons: [
      {
        title: '風味輪解構',
        desc: '深入理解調酒風味輪的六大區塊：柑橘果香（Citrus & Fruit）、草本植物（Herbal & Botanical）、香料辛香（Spice）、堅果焦糖（Nutty & Caramel）、花香（Floral）、煙燻泥土（Smoky & Earthy）。學習描述風味的專業詞彙，建立你的「風味記憶資料庫」。透過系統性的盲飲訓練，提升辨識與描述風味的能力。',
      },
      {
        title: '材料替代法',
        desc: '經典配方的現代轉譯。核心概念：替代時保持材料在配方中的「功能角色」不變。例如 Margarita 中的 Cointreau 提供「柑橘甜」——可替代為 Combier、Grand Marnier（更圓潤）或柚子利口酒（東方風味）。練習：選擇一款經典調酒，替換其中一種材料，比較原版與改編版的風味差異。',
      },
      {
        title: '你的 Signature Cocktail',
        desc: '從概念到成品的完整創作流程。Step 1：選定靈感主題（季節、產地、記憶、食材）。Step 2：確定風味架構（基酒＋酸＋甜＋修飾＋裝飾）。Step 3：初版配方試作與微調。Step 4：命名與故事撰寫。Step 5：成品攝影與完整配方文件化。討論如何避免「為創新而創新」的陷阱——好的創意調酒首先必須好喝。',
      },
      {
        title: '季節性調酒設計',
        desc: '利用當季食材設計限定酒單。春季：花香（接骨木花、櫻花、茉莉）搭配輕盈基酒。夏季：熱帶水果、西瓜、黃瓜的清爽組合。秋季：南瓜、蘋果、肉桂、丁香的溫暖調性。冬季：巧克力、咖啡、香料酒、熱調酒。學習如何將食材的季節性融入酒單故事。',
      },
      {
        title: '苦味的藝術',
        desc: '深入探索苦精（Bitters）與苦味利口酒的世界。Angostura（肉桂丁香）、Peychaud&apos;s（茴香花香）、Orange Bitters（柑橘）的經典三角。Campari、Aperol、Fernet-Branca、Chartreuse 等苦味利口酒的風味分析。理解苦味在調酒中的角色——如同料理中的鹽，少量就能提升整體風味的複雜度與深度。',
      },
    ],
  },
  {
    lv: 5,
    name: '大師工匠',
    en: 'Master',
    duration: '3–6 個月',
    color: 'from-neon-amber/30 to-transparent',
    capstone: '設計一份完整的 8 款調酒酒單（含前調、主調、餐後酒），搭配品牌故事與視覺設計，進行 30 分鐘的正式提案簡報。',
    unlock: '完成 Signature Cocktail 創作審核並獲得至少 80 分的導師評分。',
    lessons: [
      {
        title: '自製浸漬酒',
        desc: '將烈酒與食材浸泡以萃取風味——Fat Wash（油脂浸洗，如培根波本、芝麻油伏特加）、茶葉浸泡（伯爵茶琴酒、焙茶蘭姆酒）、香料浸泡（肉桂威士忌、花椒伏特加）。每種技法的浸泡時間、溫度、過濾方式都不同。Fat Wash 原理：油脂溶解烈酒中的風味物質後冷凍分離，保留風味但去除油膩。',
      },
      {
        title: '泡沫科學',
        desc: '利用不同介質創造泡沫層次。蛋白泡沫（最傳統，Dry Shake 技法）、明膠泡沫（Gelatin Foam，用 iSi Siphon）、卵磷脂泡沫（Lecithin Air，極輕盈的微泡沫）、Aquafaba 泡沫（鷹嘴豆水，素食替代方案）。每種泡沫的穩定性、口感、適用場景各異。進階：泡沫如何影響飲品的香氣釋放？',
      },
      {
        title: '煙燻技術',
        desc: '冷煙 vs 熱煙的差異。Smoking Gun 的操作（木屑選擇：蘋果木溫和果香、櫻桃木微甜、胡桃木厚重）。煙燻轉移法（倒扣杯灌煙）、瓶內煙燻法（密封瓶中灌煙搖盪）、煙燻冰塊（將煙霧凍入冰塊中緩釋風味）。安全注意事項與煙燻量的控制——過度煙燻會掩蓋所有其他風味。',
      },
      {
        title: '澄清技術',
        desc: '將混濁液體變為透明的魔法。Milk Punch Clarification（牛奶澄清法）——利用酪蛋白凝固沉澱去除雜質與色素，產出清澈但保留風味的酒液，是 18 世紀就有的經典技法。Agar Clarification（洋菜膠澄清法）——凍融法破壞膠體結構過濾。Centrifuge（離心機澄清）——最快速但設備成本最高。',
      },
      {
        title: '完整酒單設計',
        desc: '設計一份專業酒單的完整流程。酒單結構：開場酒（輕盈、開胃）→ 經典重現（致敬傳統）→ 創意主打（展現風格）→ 餐後酒（甜潤、收尾）。每款酒的角色、風味跨度、難度平衡、成本控制。視覺設計：命名策略（故事性 vs 描述性）、排版邏輯、價格定位。以及最重要的——如何讓酒單說一個完整的故事。',
      },
    ],
  },
]

export default function CurriculumPage() {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1)

  const toggleLevel = (lv: number) => {
    setExpandedLevel(expandedLevel === lv ? null : lv)
  }

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Header */}
      <section className="px-6 pt-20 pb-12 max-w-6xl mx-auto">
        <Link
          href="/academy"
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回學院
        </Link>
        <div className="mt-8">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            Progressive Curriculum
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
            階梯式課程
          </h1>
          <p className="text-text-secondary max-w-3xl">
            五個階段、二十五堂課——從零基礎到設計完整酒單的系統化學習路徑。
          </p>
        </div>
      </section>

      {/* Levels */}
      <section className="px-6 pb-24 max-w-6xl mx-auto space-y-6">
        {levels.map((level) => {
          const isExpanded = expandedLevel === level.lv
          return (
            <div key={level.lv} className="glass-card overflow-hidden">
              {/* Level Header — always visible */}
              <button
                onClick={() => toggleLevel(level.lv)}
                className="w-full p-6 md:p-8 flex items-center gap-5 text-left hover:bg-bg-tertiary/30 transition-colors duration-200"
              >
                {/* Level Badge */}
                <div className={`shrink-0 w-14 h-14 border-2 border-neon-amber flex flex-col items-center justify-center bg-gradient-to-b ${level.color}`}>
                  <span className="font-mono text-neon-amber text-xs font-bold leading-none">Lv.</span>
                  <span className="font-mono text-neon-amber text-lg font-bold leading-none">{level.lv}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="font-display text-xl md:text-2xl text-text-warm">{level.name}</h2>
                    <span className="font-mono text-xs text-charcoal-500">{level.en}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-mono text-xs text-text-muted">⏱ {level.duration}</span>
                    <span className="font-mono text-xs text-text-muted">📚 {level.lessons.length} 課</span>
                  </div>
                </div>

                <span className={`text-charcoal-500 text-xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="px-6 pb-8 md:px-8 animate-fade-in">
                  <div className="divider-amber mb-6" />

                  {/* Unlock Condition */}
                  <div className="mb-6 flex items-start gap-2">
                    <span className="text-neon-amber text-sm">🔓</span>
                    <div>
                      <span className="font-mono text-xs text-charcoal-500 block mb-0.5">解鎖條件</span>
                      <p className="text-text-secondary text-sm">{level.unlock}</p>
                    </div>
                  </div>

                  {/* Lessons */}
                  <h3 className="font-display text-lg text-text-warm mb-4">
                    課程內容
                    <span className="font-mono text-xs text-charcoal-500 ml-2">Lessons</span>
                  </h3>
                  <div className="space-y-4 mb-8">
                    {level.lessons.map((lesson, i) => (
                      <div
                        key={i}
                        className="bg-bg-tertiary/50 border border-charcoal-700 p-5 rounded-sm hover:border-charcoal-600 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-xs text-neon-amber bg-bg-primary border border-charcoal-700 px-2 py-0.5 rounded-sm">
                            {level.lv}.{i + 1}
                          </span>
                          <h4 className="text-text-warm font-medium">{lesson.title}</h4>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed pl-12">
                          {lesson.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Capstone Project */}
                  <div className="border-neon-amber-glow p-5 rounded-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🏆</span>
                      <h3 className="font-display text-lg text-neon-amber">畢業專題</h3>
                      <span className="font-mono text-xs text-charcoal-500">Capstone Project</span>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">{level.capstone}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </section>
    </main>
  )
}
