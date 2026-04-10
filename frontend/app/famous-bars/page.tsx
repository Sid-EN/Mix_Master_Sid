'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ── Types ── */
interface Bar {
  name: string;
  flag: string;
  city: string;
  country: string;
  region: 'europe' | 'americas' | 'asia' | 'other';
  style: string;
  established?: string;
  founder?: string;
  signature?: string;
  mustTry?: string;
  ranking?: string;
  feature: string;
  description: string;
  address?: string;
}

/* ── Data: 20 Famous Bars ── */
const BARS: Bar[] = [
  {
    name: 'The Connaught Bar',
    flag: '🇬🇧',
    city: '倫敦',
    country: '英國',
    region: 'europe',
    style: 'Art Deco 極致優雅',
    established: '2008 (重新設計), 飯店1897年',
    founder: 'Agostino Perrone (前) / Maura Milia',
    signature: 'Connaught Martini (推車桌邊服務，客人選擇苦精)',
    mustTry: 'Connaught Martini',
    ranking: "World's 50 Best Bars 多次冠軍",
    feature: 'Martini trolley 是全球最著名的桌邊體驗，每杯 Martini 都是獨一無二的',
    description: '坐落於 Mayfair 的頂級飯店內，以極致的 Art Deco 設計與無可挑剔的服務聞名。首席調酒師帶領團隊，以標誌性的 Martini 推車為每位客人量身打造獨一無二的 Martini 體驗。',
    address: 'Carlos Place, Mayfair',
  },
  {
    name: 'American Bar at The Savoy',
    flag: '🇬🇧',
    city: '倫敦',
    country: '英國',
    region: 'europe',
    style: "1920s Art Deco 黃金時代",
    established: '1893',
    founder: 'Ada Coleman, Harry Craddock, Erik Lorincz (傳奇調酒師)',
    signature: 'Hanky Panky (Ada Coleman 創作)',
    mustTry: 'Hanky Panky',
    ranking: undefined,
    feature: '歐洲最古老的雞尾酒吧，《The Savoy Cocktail Book》的誕生地',
    description: '自 1893 年營業至今，是歐洲歷史最悠久的雞尾酒吧。從 Ada Coleman 到 Harry Craddock，無數傳奇調酒師在此留下印記，《The Savoy Cocktail Book》更是雞尾酒史上的經典之作。',
  },
  {
    name: 'Lyaness',
    flag: '🇬🇧',
    city: '倫敦',
    country: '英國',
    region: 'europe',
    style: '前衛實驗、永續調酒',
    established: '2019 (前身 Dandelyan 2014)',
    founder: 'Ryan Chetiyawardana (Mr Lyan)',
    signature: '使用自製材料、零浪費理念',
    mustTry: undefined,
    ranking: undefined,
    feature: '酒單以獨特材料而非酒名為核心(如 Infinite Banana, Purple Pineapple)',
    description: '由 Mr Lyan 打造的前衛酒吧，以永續發展與零浪費為核心理念。酒單圍繞獨特自製材料展開，每種材料都是一個故事，挑戰你對調酒的所有想像。',
  },
  {
    name: '1930',
    flag: '🇮🇹',
    city: '米蘭',
    country: '義大利',
    region: 'europe',
    style: '真正的 Speakeasy',
    established: '2013',
    founder: undefined,
    signature: '經典義式調酒與 Negroni 變體',
    mustTry: 'Negroni',
    ranking: undefined,
    feature: '隱藏在普通門後的秘密酒吧，復刻禁酒令時代氛圍，需要密碼入場',
    description: '米蘭最神秘的酒吧——沒有招牌、沒有標示，你需要密碼才能進入這扇不起眼的門後。一旦踏入，彷彿穿越回 1930 年代的禁酒令時期，品嚐最道地的義式經典調酒。',
  },
  {
    name: 'Paradiso',
    flag: '🇪🇸',
    city: '巴塞隆納',
    country: '西班牙',
    region: 'europe',
    style: 'Speakeasy + 分子調酒',
    established: '2015',
    founder: 'Giacomo Giannotti',
    signature: '分子調酒體驗',
    mustTry: '分子調酒體驗',
    ranking: "World's 50 Best Bars #1 (2022)",
    feature: '入口偽裝成三明治復古冰箱店，推開冰箱門進入酒吧',
    description: '看似一家普通的復古三明治店，但推開那扇冰箱門，你將進入一個充滿奇幻的分子調酒世界。2022 年登頂全球最佳酒吧榜首，以前衛的分子技術重新定義雞尾酒體驗。',
  },
  {
    name: 'Bar Tausend',
    flag: '🇩🇪',
    city: '柏林',
    country: '德國',
    region: 'europe',
    style: '工業風 Speakeasy',
    established: undefined,
    founder: undefined,
    signature: '創意德式調酒',
    mustTry: undefined,
    ranking: undefined,
    feature: '隱藏在鐵路高架橋下，鋼製大門無標示',
    description: '藏身於柏林弗里德里希大街鐵路高架橋下，一扇毫無標示的鋼製大門背後是柏林最酷的 Speakeasy。工業風格的空間融合了藝術與音樂，創意德式調酒令人驚豔。',
  },
  {
    name: 'Dead Rabbit',
    flag: '🇺🇸',
    city: '紐約',
    country: '美國',
    region: 'americas',
    style: '19世紀愛爾蘭酒館',
    established: '2013',
    founder: 'Sean Muldoon & Jack McGarry',
    signature: 'Irish Coffee, Dead Rabbit Punch',
    mustTry: 'Irish Coffee, Dead Rabbit Punch',
    ranking: "多次 World's Best Bar",
    feature: '分三層——1F 酒館(啤酒), 2F 調酒室(雞尾酒), 3F VIP',
    description: '以 19 世紀紐約愛爾蘭幫派為靈感，分為三層：一樓是熱鬧的酒館，二樓是精緻的調酒室，三樓為 VIP 空間。多次榮獲全球最佳酒吧殊榮，是紐約必訪的傳奇酒吧。',
  },
  {
    name: 'Attaboy',
    flag: '🇺🇸',
    city: '紐約',
    country: '美國',
    region: 'americas',
    style: 'Milk & Honey 繼承者，無菜單',
    established: '2012 (Milk & Honey 原址)',
    founder: 'Sam Ross & Michael McIlroy',
    signature: 'Paper Plane (Sam Ross 創作)',
    mustTry: 'Paper Plane',
    ranking: undefined,
    feature: '無酒單，告訴調酒師你的心情和偏好，他們為你量身調製',
    description: '傳奇酒吧 Milk & Honey 的精神繼承者，沒有酒單、沒有招牌。走進這扇不起眼的門，告訴調酒師你今天的心情，他們會為你調製一杯完美的雞尾酒。',
  },
  {
    name: 'Employees Only',
    flag: '🇺🇸',
    city: '紐約',
    country: '美國',
    region: 'americas',
    style: 'Speakeasy + 占卜',
    established: '2004',
    founder: undefined,
    signature: 'Amelia, Ginger Smash',
    mustTry: 'Amelia, Ginger Smash',
    ranking: undefined,
    feature: '入口有霓虹燈算命師，凌晨提供免費雞骨湯',
    description: '門口的霓虹燈算命師是最好的辨識標誌。這家 Speakeasy 風格酒吧以經典調酒聞名，而深夜的免費雞骨湯更是紐約夜生活的傳奇——喝完酒，來碗熱湯暖暖胃。',
  },
  {
    name: 'The Aviary',
    flag: '🇺🇸',
    city: '芝加哥',
    country: '美國',
    region: 'americas',
    style: '分子調酒劇場',
    established: '2011',
    founder: 'Grant Achatz & Charles Joly',
    signature: 'In The Rocks',
    mustTry: 'In The Rocks (冰球內封裝調酒，用彈弓打破)',
    ranking: undefined,
    feature: '每杯調酒都是一場表演，煙霧、冰球、燒瓶等',
    description: '由米其林三星主廚 Grant Achatz 與調酒大師 Charles Joly 聯手打造的「調酒劇場」。每一杯調酒都是一場表演——煙霧繚繞、冰球內封裝酒液、用彈弓打破取飲，顛覆你的感官體驗。',
  },
  {
    name: 'Licorería Limantour',
    flag: '🇲🇽',
    city: '墨西哥城',
    country: '墨西哥',
    region: 'americas',
    style: '現代墨西哥調酒',
    established: undefined,
    founder: undefined,
    signature: 'Mezcal, Chile, Hoja Santa 調酒',
    mustTry: undefined,
    ranking: "Latin America's Best Bar",
    feature: '以墨西哥本土材料(Mezcal, Chile, Hoja Santa)重新詮釋經典',
    description: '墨西哥城最具代表性的調酒吧，以 Mezcal、辣椒、Hoja Santa 等本土食材重新詮釋經典雞尾酒。每一杯都帶你品嚐墨西哥的風土與文化，是拉丁美洲調酒的最高殿堂。',
  },
  {
    name: 'Guilhotina',
    flag: '🇧🇷',
    city: '聖保羅',
    country: '巴西',
    region: 'americas',
    style: '巴西熱帶調酒',
    established: undefined,
    founder: undefined,
    signature: 'Cachaça 和巴西熱帶水果調酒',
    mustTry: undefined,
    ranking: "South America's Best Bars 常客",
    feature: '以 Cachaça 和巴西熱帶水果為主角',
    description: '聖保羅最耀眼的調酒明星，以巴西國酒 Cachaça 和豐富的熱帶水果為創作核心。熱情奔放的巴西風情融入每一杯調酒，南美洲最佳酒吧榜上的常客。',
  },
  {
    name: 'Bar High Five',
    flag: '🇯🇵',
    city: '東京',
    country: '日本',
    region: 'asia',
    style: '日式職人精神',
    established: undefined,
    founder: '上野秀嗣 (Hidetsugu Ueno)',
    signature: 'Old Fashioned with hand-cut ice',
    mustTry: 'Old Fashioned with hand-cut ice',
    ranking: undefined,
    feature: '完美的冰球手切技藝、極致的待客之道 (Omotenashi)，禁止拍照、禁止電話',
    description: '上野秀嗣大師的殿堂，以完美的手切冰球聞名於世。這裡體現了日式待客之道 (Omotenashi) 的極致——每一個動作都精準到位，每一杯酒都是藝術品。請注意：禁止拍照與使用手機。',
  },
  {
    name: 'Bar Benfiddich',
    flag: '🇯🇵',
    city: '東京',
    country: '日本',
    region: 'asia',
    style: 'Farm to Glass 農場到杯',
    established: undefined,
    founder: '鹿山博康 (Hiroyasu Kayama)',
    signature: 'Absinthe 相關調酒',
    mustTry: 'Absinthe 相關調酒',
    ranking: undefined,
    feature: '自己種植草本、現場用研缽磨碎香料',
    description: '鹿山博康親自種植草本植物，在你面前用研缽和杵將新鮮香料磨碎入酒。Farm to Glass 的理念在此達到極致——從田園到酒杯，每一杯都充滿大地的氣息與職人的堅持。',
  },
  {
    name: 'Star Bar Ginza',
    flag: '🇯🇵',
    city: '東京',
    country: '日本',
    region: 'asia',
    style: '經典日式酒吧',
    established: undefined,
    founder: '岸久 (Hisashi Kishi)',
    signature: '世界上最完美的 Martini',
    mustTry: 'Martini',
    ranking: undefined,
    feature: '被譽為世界上最完美的 Martini',
    description: '銀座的傳奇酒吧，岸久大師以畢生精力追求一杯完美的 Martini。安靜優雅的空間、一絲不苟的調酒技藝，被無數調酒師視為朝聖之地。來這裡，只需要點一杯 Martini。',
  },
  {
    name: 'Atlas',
    flag: '🇸🇬',
    city: '新加坡',
    country: '新加坡',
    region: 'asia',
    style: "1920s Art Deco 宮殿",
    established: undefined,
    founder: undefined,
    signature: 'Gin Martini 系列',
    mustTry: 'Gin Martini 系列',
    ranking: undefined,
    feature: '擁有全球最大的琴酒收藏 (1300+ 瓶)，15公尺高的金色酒塔',
    description: '踏入 Atlas 的瞬間，你會被 15 公尺高的金色琴酒塔所震撼。這座 Art Deco 風格的宮殿擁有超過 1300 瓶琴酒收藏，是全球琴酒愛好者的終極聖地。',
  },
  {
    name: 'Jigger & Pony',
    flag: '🇸🇬',
    city: '新加坡',
    country: '新加坡',
    region: 'asia',
    style: '經典與現代融合',
    established: undefined,
    founder: 'Indra Kantono & Gan Guoyi',
    signature: 'Singapore Sling 的現代演繹',
    mustTry: 'Singapore Sling 的現代演繹',
    ranking: "Asia's Best Bar",
    feature: '以經典調酒為基礎，融入新加坡本土元素的現代演繹',
    description: '亞洲最佳酒吧的常勝軍，以經典調酒為基礎，大膽融入新加坡本土風味。Singapore Sling 在這裡獲得了最精彩的現代重新詮釋，每一口都是傳統與創新的完美平衡。',
  },
  {
    name: 'Coa',
    flag: '🇭🇰',
    city: '香港',
    country: '香港',
    region: 'asia',
    style: '龍舌蘭與梅斯卡爾專門酒吧',
    established: undefined,
    founder: 'Jay Khan',
    signature: 'Oaxacan cocktails',
    mustTry: 'Oaxacan cocktails',
    ranking: "Asia's 50 Best Bars 冠軍",
    feature: '亞洲最大的龍舌蘭收藏',
    description: '由 Jay Khan 創立的龍舌蘭與梅斯卡爾聖殿，擁有亞洲最豐富的龍舌蘭收藏。以墨西哥瓦哈卡州 (Oaxaca) 的精神為靈感，在香港的巷弄中帶你踏上一場風味冒險。',
  },
  {
    name: 'Maybe Sammy',
    flag: '🇦🇺',
    city: '雪梨',
    country: '澳洲',
    region: 'other',
    style: "50年代拉斯維加斯 Rat Pack",
    established: undefined,
    founder: undefined,
    signature: '結合劇場表演的調酒體驗',
    mustTry: undefined,
    ranking: "World's 50 Best Bars",
    feature: '結合劇場表演的調酒體驗',
    description: '走進 Maybe Sammy，彷彿穿越到 1950 年代的拉斯維加斯。Rat Pack 的復古魅力、即興的劇場式服務，加上頂級調酒——這不只是喝一杯酒，而是一場難忘的表演。',
  },
  {
    name: 'Carnaval',
    flag: '🇵🇪',
    city: '利馬',
    country: '秘魯',
    region: 'americas',
    style: '秘魯風土調酒',
    established: undefined,
    founder: 'Aaron Díaz',
    signature: 'Pisco Sour 變體',
    mustTry: 'Pisco Sour 變體',
    ranking: undefined,
    feature: '使用秘魯原生食材(Pisco, Amazonian fruits, Andean herbs)',
    description: '秘魯調酒的驕傲，Aaron Díaz 以 Pisco、亞馬遜水果、安地斯草本等秘魯原生食材為創作靈感。每一杯調酒都是一趟從海岸到高原、從雨林到沙漠的秘魯風土之旅。',
  },
];

/* ── Filter Tabs ── */
type Region = 'all' | 'europe' | 'americas' | 'asia' | 'other';

const FILTERS: { key: Region; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'europe', label: '🇪🇺 歐洲' },
  { key: 'americas', label: '🇺🇸 美洲' },
  { key: 'asia', label: '🇯🇵 亞洲' },
  { key: 'other', label: '🌍 其他' },
];

/* ── Page Component ── */
export default function FamousBarsPage() {
  const [activeFilter, setActiveFilter] = useState<Region>('all');

  const filteredBars = useMemo(
    () => (activeFilter === 'all' ? BARS : BARS.filter((b) => b.region === activeFilter)),
    [activeFilter]
  );

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* ── Page Header ── */}
        <header className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient-amber mb-3">
            🏪 經典酒吧巡禮
          </h1>
          <p className="font-mono text-xs tracking-widest uppercase text-neon-amber/70 mb-2">
            {"World's Greatest Bars"}
          </p>
          <p className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            一生至少要朝聖一次的傳奇酒吧——從倫敦到東京、從紐約到墨西哥城
          </p>
        </header>

        {/* ── Filter Tabs ── */}
        <nav className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in-up-delay-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`
                px-4 py-2 rounded-sm font-mono text-xs tracking-wider uppercase
                border transition-all duration-300 cursor-pointer
                ${
                  activeFilter === f.key
                    ? 'bg-neon-amber text-bg-primary border-neon-amber shadow-[0_0_12px_var(--shadow-neon-amber)]'
                    : 'bg-transparent text-text-secondary border-charcoal-700 hover:border-neon-amber hover:text-neon-amber'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </nav>

        {/* ── Count ── */}
        <p className="text-center text-text-muted font-mono text-[11px] tracking-widest mb-6">
          顯示 {filteredBars.length} / {BARS.length} 間酒吧
        </p>

        {/* ── Bar Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBars.map((bar, idx) => (
            <BarCard key={bar.name} bar={bar} index={idx} />
          ))}
        </div>

        {/* ── Back Link ── */}
        <div className="mt-12 text-center animate-fade-in-up">
          <Link href="/" className="btn-neon-amber">
            ← 返回首頁
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ── Bar Card Component ── */
function BarCard({ bar, index }: { bar: Bar; index: number }) {
  const delay = (index % 6) * 0.08;

  return (
    <article
      className="glass-card p-5 md:p-6 hover:border-neon-amber transition-all duration-300 animate-fade-in-up flex flex-col"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Header: Flag + Name + City */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl leading-none" role="img" aria-label={bar.country}>
          {bar.flag}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg md:text-xl text-neon-amber leading-tight">
            {bar.name}
          </h2>
          <p className="font-mono text-[11px] text-charcoal-500 tracking-wide mt-0.5">
            {bar.city}, {bar.country}
          </p>
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="font-mono text-[10px] px-2.5 py-1 rounded-sm bg-neon-amber/10 border border-neon-amber/30 text-neon-amber tracking-wider">
          {bar.style}
        </span>
        {bar.established && (
          <span className="font-mono text-[10px] px-2.5 py-1 rounded-sm bg-bg-tertiary border border-charcoal-700 text-text-secondary tracking-wider">
            EST. {bar.established}
          </span>
        )}
      </div>

      {/* Ranking Badge */}
      {bar.ranking && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-3 py-1.5 rounded-sm bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-yellow-600/40 text-yellow-400 tracking-wider">
            🏆 {bar.ranking}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-text-secondary text-sm leading-relaxed mb-4 flex-1">
        {bar.description}
      </p>

      {/* Feature Highlight Box */}
      <div className="rounded-sm bg-neon-cyan/5 border border-neon-cyan/20 px-3 py-2.5 mb-4">
        <p className="font-mono text-[10px] text-neon-cyan tracking-widest uppercase mb-1">
          ✦ 特色亮點
        </p>
        <p className="text-text-warm text-xs leading-relaxed">
          {bar.feature}
        </p>
      </div>

      {/* Founder */}
      {bar.founder && (
        <div className="mb-3">
          <span className="font-mono text-[10px] text-charcoal-500 tracking-widest uppercase">
            靈魂人物：
          </span>
          <span className="text-text-secondary text-xs ml-1">{bar.founder}</span>
        </div>
      )}

      {/* Signature / Must-Try Pills */}
      {(bar.mustTry || bar.signature) && (
        <div className="pt-3 border-t border-charcoal-700">
          <p className="font-mono text-[10px] text-charcoal-500 tracking-widest uppercase mb-2">
            🍸 招牌必點
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(bar.mustTry || bar.signature || '').split(',').map((item) => (
              <span
                key={item.trim()}
                className="font-mono text-[11px] px-2.5 py-1 rounded-sm bg-bg-tertiary border border-charcoal-700 text-text-warm hover:border-neon-amber hover:text-neon-amber transition-colors duration-200"
              >
                {item.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Address */}
      {bar.address && (
        <p className="mt-3 font-mono text-[10px] text-text-muted tracking-wide">
          📍 {bar.address}
        </p>
      )}
    </article>
  );
}
