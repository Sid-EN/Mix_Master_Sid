export type Era = 'pioneer' | 'tiki' | 'modern' | 'contemporary'

export interface LegendaryBartender {
  id: string
  name: string
  years: string
  flag: string
  title: string
  era: Era
  knownFor: string
  signatureCocktails: string[]
  legacy: string
  funFact?: string
}

export const ERA_META: Record<Era, { label: string; color: string }> = {
  pioneer:      { label: '先驅者 Pioneer',        color: '#F5A623' },
  tiki:         { label: 'Tiki 時代',             color: '#00FFFF' },
  modern:       { label: '現代復興 Modern',        color: '#A855F7' },
  contemporary: { label: '當代 Contemporary',      color: '#34D399' },
}

export const BARTENDERS: LegendaryBartender[] = [
  {
    id: 'jerry-thomas',
    name: 'Jerry Thomas',
    years: '1830–1885',
    flag: '🇺🇸',
    title: '調酒之父 Professor',
    era: 'pioneer',
    knownFor:
      '出版史上第一本調酒書《How to Mix Drinks》(1862)，確立調酒師為一門專業技藝，發明火焰調酒。',
    signatureCocktails: ['Blue Blazer', 'Tom & Jerry', 'Martinez'],
    legacy: '確立調酒師為一門專業技藝，發明火焰調酒，被譽為現代調酒術的奠基人。',
    funFact: '他在酒吧後方放了兩隻白老鼠作為吉祥物。',
  },
  {
    id: 'harry-craddock',
    name: 'Harry Craddock',
    years: '1876–1963',
    flag: '🇬🇧',
    title: '薩沃伊傳奇',
    era: 'pioneer',
    knownFor:
      '著有《The Savoy Cocktail Book》(1930)，擔任倫敦 Savoy Hotel 首席調酒師。',
    signatureCocktails: ['White Lady', 'Corpse Reviver #2'],
    legacy: '禁酒令期間從美國流亡英國，將美式調酒帶入歐洲，影響了整個歐洲調酒文化。',
  },
  {
    id: 'ada-coleman',
    name: 'Ada Coleman',
    years: '1875–1966',
    flag: '🇬🇧',
    title: 'Savoy 女王',
    era: 'pioneer',
    knownFor:
      '倫敦 Savoy Hotel 的 American Bar 首位女性首席調酒師，在男性主導的行業中開創先河。',
    signatureCocktails: ['Hanky Panky'],
    legacy: '打破性別壁壘，證明女性在調酒界的地位，為後世女性調酒師開闢道路。',
  },
  {
    id: 'donn-beach',
    name: 'Donn Beach (Ernest Gantt)',
    years: '1907–1989',
    flag: '🇺🇸',
    title: 'Tiki 文化之父',
    era: 'tiki',
    knownFor:
      '創立 Don the Beachcomber 餐廳，發明 Tiki 調酒風格，將南太平洋異國情調帶入美國。',
    signatureCocktails: ['Zombie', 'Navy Grog'],
    legacy: '開創了一整個調酒流派——Tiki，影響了全球熱帶調酒文化數十年。',
  },
  {
    id: 'trader-vic',
    name: 'Trader Vic (Victor Bergeron)',
    years: '1902–1984',
    flag: '🇺🇸',
    title: 'Tiki 帝國締造者',
    era: 'tiki',
    knownFor:
      '創辦 Trader Vic\'s 連鎖餐廳，與 Donn Beach 並列 Tiki 雙雄，據稱為 Mai Tai 的原創者。',
    signatureCocktails: ['Mai Tai'],
    legacy: '將 Tiki 文化商業化推向全球，使熱帶調酒從小眾走向主流。',
  },
  {
    id: 'dale-degroff',
    name: 'Dale DeGroff',
    years: '1948–',
    flag: '🇺🇸',
    title: 'King Cocktail',
    era: 'modern',
    knownFor:
      '1990年代於紐約 Rainbow Room 引領經典調酒復興，復興使用新鮮果汁的傳統。',
    signatureCocktails: ['Cosmopolitan'],
    legacy: '現代調酒運動教父，復興使用新鮮果汁，培養了一整代頂尖調酒師。',
  },
  {
    id: 'sasha-petraske',
    name: 'Sasha Petraske',
    years: '1973–2015',
    flag: '🇺🇸',
    title: '地下酒吧復興者',
    era: 'modern',
    knownFor:
      '2000年開設 Milk & Honey，回歸禁酒令時代的私密酒吧風格，不設固定酒單，依客人口味即興調製。',
    signatureCocktails: ['Penicillin', 'Gold Rush'],
    legacy: '影響了全球 Speakeasy 風格酒吧的興起，重新定義了酒吧體驗。',
  },
  {
    id: 'kazuo-uyeda',
    name: 'Kazuo Uyeda (上田和男)',
    years: '1948–',
    flag: '🇯🇵',
    title: '硬搖盪大師',
    era: 'modern',
    knownFor:
      '發明 Hard Shake 技法，東京 Tender Bar 傳奇調酒師，將搖盪技術提升至藝術層次。',
    signatureCocktails: ['Gimlet'],
    legacy: '將日式職人精神注入調酒藝術，其 Hard Shake 技法影響了全球調酒界。',
  },
  {
    id: 'hidetsugu-ueno',
    name: 'Hidetsugu Ueno (上野秀嗣)',
    years: '1968–',
    flag: '🇯🇵',
    title: '冰之藝術家',
    era: 'contemporary',
    knownFor:
      '東京 Bar High Five 創辦人，手工冰球雕刻大師，以極致精細的服務聞名。',
    signatureCocktails: ['Old Fashioned'],
    legacy: '日式調酒美學的全球化推手，將冰的藝術提升到前所未有的高度。',
  },
  {
    id: 'julio-bermejo',
    name: 'Julio Bermejo',
    years: '1960–',
    flag: '🇺🇸🇲🇽',
    title: 'Tequila 大使',
    era: 'modern',
    knownFor:
      '舊金山 Tommy\'s Mexican Restaurant 調酒師，推廣 100% 龍舌蘭，簡化 Margarita 配方。',
    signatureCocktails: ["Tommy's Margarita"],
    legacy: '改變了全球對 Tequila 的認知，推動龍舌蘭品質革命。',
  },
  {
    id: 'salvatore-calabrese',
    name: 'Salvatore Calabrese',
    years: '1955–',
    flag: '🇮🇹🇬🇧',
    title: 'The Maestro',
    era: 'modern',
    knownFor:
      '倫敦 Salvatore at FIFTY 首席調酒師，收藏世界最珍貴的烈酒，調製金氏世界紀錄最昂貴的調酒。',
    signatureCocktails: ['Breakfast Martini'],
    legacy: '調製過金氏世界紀錄最昂貴的調酒，是調酒界的活歷史。',
  },
  {
    id: 'audrey-saunders',
    name: 'Audrey Saunders',
    years: '1964–',
    flag: '🇺🇸',
    title: '現代調酒女王',
    era: 'modern',
    knownFor:
      '紐約 Pegu Club 創辦人，Dale DeGroff 的弟子，以精確配方與平衡風味著稱。',
    signatureCocktails: ['Gin-Gin Mule', 'Old Cuban'],
    legacy: '培養了新一代頂尖調酒師，推動了紐約乃至全球調酒文化的發展。',
  },
  {
    id: 'remy-monica',
    name: 'Rémy Savage & Monica Berg',
    years: '1988– & 1984–',
    flag: '🇫🇷🇳🇴',
    title: '永續調酒先驅',
    era: 'contemporary',
    knownFor:
      '倫敦 Tayer + Elementary 創辦人，推行永續與零浪費調酒，使用廚餘發酵、自製材料。',
    signatureCocktails: ['廚餘發酵調酒', '自製材料特調'],
    legacy: '引領調酒產業的環保革命，證明永續與美味可以並存。',
  },
  {
    id: 'ryan-chetiyawardana',
    name: 'Ryan Chetiyawardana (Mr Lyan)',
    years: '1983–',
    flag: '🇬🇧',
    title: '反叛創新者',
    era: 'contemporary',
    knownFor:
      '倫敦 Lyaness 創辦人，曾開設全球首間無果汁/柑橘酒吧，挑戰調酒傳統規則。',
    signatureCocktails: ['前衛實驗性調酒'],
    legacy: '挑戰調酒傳統規則的實驗精神，重新定義調酒的可能性。',
  },
  {
    id: 'ivy-mix',
    name: 'Ivy Mix',
    years: '1986–',
    flag: '🇺🇸',
    title: '拉丁美洲烈酒大使',
    era: 'contemporary',
    knownFor:
      '布魯克林 Leyenda 創辦人，專注拉美烈酒，以 Mezcal、Cachaça、Pisco 為基底進行創新。',
    signatureCocktails: ['Mezcal 特調', 'Cachaça 創新調酒'],
    legacy: '推廣拉丁美洲的釀酒文化，讓世界認識被忽視的拉美烈酒。',
  },
]
