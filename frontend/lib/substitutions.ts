export interface SubstituteItem {
  name: string
  nameZh: string
  similarity: number
  note: string
}

export interface Substitution {
  original: string
  substitutes: SubstituteItem[]
}

/**
 * Maps lowercase ingredient keywords → substitution options.
 * Keys are matched via case-insensitive substring against recipe ingredient names.
 */
export const substitutionMap: Record<string, Substitution['substitutes']> = {
  /* ── Base Spirits ─────────────────────────────────────────── */
  vodka: [
    { name: 'Soju', nameZh: '燒酒', similarity: 0.75, note: '酒精度較低，口感更柔和，適合清淡調酒' },
    { name: 'Shochu', nameZh: '燒酎', similarity: 0.7, note: '日式蒸餾酒，帶輕微穀物香氣' },
    { name: 'Light Rum', nameZh: '白蘭姆酒', similarity: 0.6, note: '會增加些微甜感，適用於水果調酒' },
  ],
  gin: [
    { name: 'Aquavit', nameZh: '阿夸維特', similarity: 0.65, note: '北歐蒸餾酒，以蒔蘿與葛縷子取代杜松子風味' },
    { name: 'Vodka + Juniper', nameZh: '伏特加＋杜松子', similarity: 0.55, note: '以伏特加浸泡杜松子模擬琴酒風味' },
    { name: 'Dry Vermouth', nameZh: '不甜苦艾酒', similarity: 0.4, note: '酒精度較低但草本風味相近，用量需調整' },
  ],
  'light rum': [
    { name: 'Cachaça', nameZh: '卡夏莎', similarity: 0.8, note: '巴西甘蔗蒸餾酒，風味最為接近' },
    { name: 'Blanco Tequila', nameZh: '白龍舌蘭', similarity: 0.55, note: '會帶入植物與胡椒調性' },
    { name: 'Vodka', nameZh: '伏特加', similarity: 0.5, note: '口感中性，缺少蘭姆酒的甘蔗甜感' },
  ],
  'dark rum': [
    { name: 'Bourbon', nameZh: '波本威士忌', similarity: 0.65, note: '同樣有焦糖與香草調性' },
    { name: 'Cognac', nameZh: '干邑白蘭地', similarity: 0.6, note: '果味豐富，複雜度相近' },
    { name: 'Aged Tequila', nameZh: '陳年龍舌蘭', similarity: 0.5, note: '橡木桶陳年帶來相似的木質調' },
  ],
  bourbon: [
    { name: 'Rye Whiskey', nameZh: '裸麥威士忌', similarity: 0.85, note: '更辛辣乾爽，經典替代品' },
    { name: 'Scotch Whisky', nameZh: '蘇格蘭威士忌', similarity: 0.6, note: '選非泥煤款以獲得最接近口感' },
    { name: 'Cognac', nameZh: '干邑白蘭地', similarity: 0.55, note: '果味取代穀物甜感，適合經典調酒' },
  ],
  tequila: [
    { name: 'Mezcal', nameZh: '梅斯卡爾', similarity: 0.8, note: '同為龍舌蘭蒸餾酒，帶煙燻風味' },
    { name: 'Cachaça', nameZh: '卡夏莎', similarity: 0.5, note: '同為植物基底蒸餾酒，口感較甜' },
    { name: 'Vodka', nameZh: '伏特加', similarity: 0.35, note: '僅保留酒精度，缺乏龍舌蘭特色' },
  ],
  mezcal: [
    { name: 'Blanco Tequila', nameZh: '白龍舌蘭', similarity: 0.75, note: '缺少煙燻味但龍舌蘭基底相同' },
    { name: 'Peated Scotch', nameZh: '泥煤蘇格蘭威士忌', similarity: 0.5, note: '以泥煤煙燻替代龍舌蘭煙燻' },
    { name: 'Raicilla', nameZh: '拉伊西亞', similarity: 0.7, note: '墨西哥傳統蒸餾酒，風味相近' },
  ],
  scotch: [
    { name: 'Bourbon', nameZh: '波本威士忌', similarity: 0.65, note: '較甜且帶香草調，選用於非泥煤配方' },
    { name: 'Irish Whiskey', nameZh: '愛爾蘭威士忌', similarity: 0.7, note: '三次蒸餾更為柔順' },
    { name: 'Japanese Whisky', nameZh: '日本威士忌', similarity: 0.8, note: '製法師承蘇格蘭，風格最為接近' },
  ],
  'rye whiskey': [
    { name: 'Bourbon', nameZh: '波本威士忌', similarity: 0.85, note: '最常見替代，口感更甜潤' },
    { name: 'Cognac', nameZh: '干邑白蘭地', similarity: 0.5, note: '歷史上許多裸麥調酒原用干邑' },
    { name: 'Canadian Whisky', nameZh: '加拿大威士忌', similarity: 0.7, note: '常含裸麥成分，風格相近' },
  ],
  cognac: [
    { name: 'Brandy', nameZh: '白蘭地', similarity: 0.85, note: '廣義白蘭地皆可替代，品質差異較大' },
    { name: 'Bourbon', nameZh: '波本威士忌', similarity: 0.55, note: '同樣有橡木桶與香草調性' },
    { name: 'Aged Rum', nameZh: '陳年蘭姆酒', similarity: 0.6, note: '焦糖與果乾風味相近' },
  ],
  'irish whiskey': [
    { name: 'Scotch Whisky', nameZh: '蘇格蘭威士忌', similarity: 0.7, note: '選用高地區柔順款式' },
    { name: 'Bourbon', nameZh: '波本威士忌', similarity: 0.6, note: '較甜，但烈酒基底功能相同' },
    { name: 'Japanese Whisky', nameZh: '日本威士忌', similarity: 0.75, note: '同樣以柔順口感著稱' },
  ],
  'japanese whisky': [
    { name: 'Scotch Whisky', nameZh: '蘇格蘭威士忌', similarity: 0.85, note: '日威師承蘇格蘭，風格最為接近' },
    { name: 'Irish Whiskey', nameZh: '愛爾蘭威士忌', similarity: 0.7, note: '同樣柔順易飲' },
    { name: 'Bourbon', nameZh: '波本威士忌', similarity: 0.55, note: '較甜且有明顯玉米風味' },
  ],
  absinthe: [
    { name: 'Pastis', nameZh: '茴香酒', similarity: 0.75, note: '同為茴香風味烈酒，酒精度較低' },
    { name: 'Herbsaint', nameZh: '草聖利口酒', similarity: 0.8, note: '專為替代苦艾酒而生' },
    { name: 'Pernod', nameZh: '潘諾茴香酒', similarity: 0.7, note: '經典茴香利口酒，用量減半' },
  ],
  cachaça: [
    { name: 'White Rum', nameZh: '白蘭姆酒', similarity: 0.8, note: '最佳替代品，缺少發酵甘蔗的草味' },
    { name: 'Rhum Agricole', nameZh: '農業蘭姆酒', similarity: 0.85, note: '同為甘蔗汁蒸餾，風味最接近' },
    { name: 'Blanco Tequila', nameZh: '白龍舌蘭', similarity: 0.45, note: '植物性基底，口感差異較大' },
  ],

  /* ── Liqueurs ─────────────────────────────────────────────── */
  'triple sec': [
    { name: 'Grand Marnier', nameZh: '柑曼怡', similarity: 0.8, note: '干邑基底的橙酒，更濃郁複雜' },
    { name: 'Cointreau', nameZh: '君度橙酒', similarity: 0.95, note: '最經典的三重蒸餾橙皮利口酒' },
    { name: 'Dry Curaçao', nameZh: '庫拉索橙酒', similarity: 0.75, note: '同為橙皮利口酒，風味略有不同' },
  ],
  cointreau: [
    { name: 'Grand Marnier', nameZh: '柑曼怡', similarity: 0.8, note: '口感更豐厚，帶有干邑底蘊' },
    { name: 'Triple Sec', nameZh: '三重蒸餾橙酒', similarity: 0.85, note: '更經濟的選擇，甜度可能偏高' },
    { name: 'Dry Curaçao', nameZh: '庫拉索橙酒', similarity: 0.75, note: '橙皮風味相近，口感較乾' },
  ],
  'grand marnier': [
    { name: 'Cointreau', nameZh: '君度橙酒', similarity: 0.8, note: '更輕盈透明的橙皮風味' },
    { name: 'Triple Sec', nameZh: '三重蒸餾橙酒', similarity: 0.7, note: '經濟替代，缺少干邑複雜度' },
    { name: 'Orange Curaçao', nameZh: '橙色庫拉索', similarity: 0.75, note: '色澤與風味皆為優良替代' },
  ],
  campari: [
    { name: 'Aperol', nameZh: '開胃酒', similarity: 0.7, note: '苦度較低，甜度較高，需調整用量' },
    { name: 'Cappelletti', nameZh: '卡佩雷蒂', similarity: 0.8, note: '以葡萄酒為基底的義式苦酒' },
    { name: 'Select Aperitivo', nameZh: '塞萊特開胃酒', similarity: 0.75, note: '威尼斯經典，苦甜均衡' },
  ],
  aperol: [
    { name: 'Campari', nameZh: '金巴利', similarity: 0.65, note: '苦度更高，用量減半並加糖漿平衡' },
    { name: 'Cappelletti', nameZh: '卡佩雷蒂', similarity: 0.7, note: '苦甜比例接近 Aperol' },
    { name: 'Lillet Rosé', nameZh: '麗葉粉紅', similarity: 0.5, note: '風味較輕，但色澤與甜度相近' },
  ],
  kahlúa: [
    { name: 'Mr Black Coffee Liqueur', nameZh: 'Mr Black 咖啡利口酒', similarity: 0.85, note: '更純粹的咖啡風味，甜度較低' },
    { name: 'Tia Maria', nameZh: '添萬利', similarity: 0.8, note: '牙買加咖啡利口酒，風格相近' },
    { name: 'Espresso + Simple Syrup', nameZh: '濃縮咖啡＋糖漿', similarity: 0.6, note: '無酒精替代，等量混合即可' },
  ],
  'st-germain': [
    { name: 'Elderflower Cordial', nameZh: '接骨木花糖漿', similarity: 0.75, note: '無酒精版，需額外加基酒補酒感' },
    { name: 'Lychee Liqueur', nameZh: '荔枝利口酒', similarity: 0.55, note: '花果香相近，但風味差異明顯' },
    { name: 'Domaine de Canton', nameZh: '廣東薑味利口酒', similarity: 0.4, note: '同為法式花果利口酒風格' },
  ],
  chartreuse: [
    { name: 'Yellow Chartreuse', nameZh: '黃色夏特勒茲', similarity: 0.75, note: '同品牌較甜版本，酒精度較低' },
    { name: 'Genépy', nameZh: '高山草本利口酒', similarity: 0.65, note: '以高山草本為基底，複雜度較低' },
    { name: 'Strega', nameZh: '斯特雷加', similarity: 0.55, note: '義大利草本利口酒，番紅花調性' },
  ],
  maraschino: [
    { name: 'Kirsch', nameZh: '櫻桃白蘭地', similarity: 0.7, note: '乾型櫻桃蒸餾酒，缺少利口酒甜度' },
    { name: 'Cherry Heering', nameZh: '希靈櫻桃利口酒', similarity: 0.6, note: '較甜且顏色更深，需調整用量' },
    { name: 'Crème de Cerise', nameZh: '櫻桃奶油利口酒', similarity: 0.55, note: '甜度更高，帶有明顯糖漿感' },
  ],
  amaretto: [
    { name: 'Frangelico', nameZh: '法蘭乳酒', similarity: 0.7, note: '榛果利口酒，堅果調性相近' },
    { name: 'Orgeat Syrup', nameZh: '杏仁糖漿', similarity: 0.65, note: '無酒精替代，杏仁風味純粹' },
    { name: 'Nocello', nameZh: '核桃利口酒', similarity: 0.6, note: '堅果風味替代品，帶核桃調性' },
  ],
  'crème de cacao': [
    { name: 'Chocolate Liqueur', nameZh: '巧克力利口酒', similarity: 0.85, note: '風味最為接近的直接替代' },
    { name: 'Mozart Chocolate', nameZh: '莫札特巧克力酒', similarity: 0.8, note: '奧地利巧克力利口酒，品質優良' },
    { name: 'Chocolate Syrup + Vodka', nameZh: '巧克力糖漿＋伏特加', similarity: 0.5, note: '簡易替代方案，甜度需調整' },
  ],
  bénédictine: [
    { name: 'Yellow Chartreuse', nameZh: '黃色夏特勒茲', similarity: 0.6, note: '同為草本甜酒，配方不同但功能相近' },
    { name: 'Drambuie', nameZh: '金杯利口酒', similarity: 0.55, note: '蜂蜜草本調性相近' },
    { name: 'DOM + Honey', nameZh: '草本利口酒＋蜂蜜', similarity: 0.5, note: '混合草本利口酒與蜂蜜模擬' },
  ],
  baileys: [
    { name: 'RumChata', nameZh: '蘭姆恰塔', similarity: 0.7, note: '蘭姆酒基底奶油利口酒，帶肉桂香' },
    { name: 'Amarula', nameZh: '奶油利口酒', similarity: 0.75, note: '非洲奶油利口酒，口感相近' },
    { name: 'Coconut Cream + Whiskey', nameZh: '椰奶＋威士忌', similarity: 0.5, note: '自製替代方案，質地相近' },
  ],
  frangelico: [
    { name: 'Amaretto', nameZh: '杏仁利口酒', similarity: 0.7, note: '同為堅果利口酒，杏仁取代榛果' },
    { name: 'Nocello', nameZh: '核桃利口酒', similarity: 0.65, note: '堅果調性接近' },
    { name: 'Hazelnut Syrup', nameZh: '榛果糖漿', similarity: 0.55, note: '無酒精替代，需額外加基酒' },
  ],
  chambord: [
    { name: 'Crème de Cassis', nameZh: '黑醋栗利口酒', similarity: 0.7, note: '漿果利口酒，但以黑醋栗為主' },
    { name: 'Raspberry Syrup', nameZh: '覆盆子糖漿', similarity: 0.6, note: '無酒精替代，覆盆子風味純粹' },
    { name: 'Framboise', nameZh: '覆盆子白蘭地', similarity: 0.75, note: '覆盆子蒸餾酒，較為乾爽' },
  ],
  drambuie: [
    { name: 'Bénédictine', nameZh: '班尼迪克丁', similarity: 0.6, note: '草本蜂蜜調性相近' },
    { name: 'Glayva', nameZh: '格萊瓦', similarity: 0.8, note: '蘇格蘭蜂蜜利口酒，最佳替代' },
    { name: 'Honey Whiskey', nameZh: '蜂蜜威士忌', similarity: 0.55, note: '簡化版，缺少草本複雜度' },
  ],
  'crème de violette': [
    { name: 'Parfait Amour', nameZh: '完美之愛利口酒', similarity: 0.6, note: '花香利口酒，帶柑橘與香草' },
    { name: 'Crème de Cassis', nameZh: '黑醋栗利口酒', similarity: 0.4, note: '顏色相近但風味不同，用量減少' },
    { name: 'Violet Syrup', nameZh: '紫羅蘭糖漿', similarity: 0.7, note: '無酒精替代，保留紫羅蘭風味' },
  ],

  /* ── Juices / Citrus ──────────────────────────────────────── */
  'lime juice': [
    { name: 'Lemon Juice', nameZh: '檸檬汁', similarity: 0.85, note: '最常用替代，酸度接近但風味略有差異' },
    { name: 'Citric Acid Solution', nameZh: '檸檬酸溶液', similarity: 0.6, note: '1茶匙檸檬酸加60ml水，僅提供酸度' },
    { name: 'Yuzu Juice', nameZh: '柚子汁', similarity: 0.55, note: '日式風味替代，更芳香複雜' },
  ],
  'lemon juice': [
    { name: 'Lime Juice', nameZh: '萊姆汁', similarity: 0.85, note: '最佳替代，略帶苦調' },
    { name: 'Grapefruit Juice', nameZh: '葡萄柚汁', similarity: 0.5, note: '酸度較低，需搭配少量檸檬酸' },
    { name: 'White Wine Vinegar', nameZh: '白酒醋', similarity: 0.35, note: '少量使用可提供酸度，風味差異大' },
  ],
  'grapefruit juice': [
    { name: 'Pomelo Juice', nameZh: '柚子汁', similarity: 0.8, note: '風味最為接近的柑橘類替代' },
    { name: 'Orange + Lemon', nameZh: '柳橙汁＋檸檬汁', similarity: 0.65, note: '3:1混合模擬葡萄柚苦甜' },
    { name: 'Tangerine Juice', nameZh: '橘子汁', similarity: 0.5, note: '甜度較高，酸度需額外補充' },
  ],
  'orange juice': [
    { name: 'Tangerine Juice', nameZh: '橘子汁', similarity: 0.8, note: '更甜且芳香，直接等量替代' },
    { name: 'Mandarin Juice', nameZh: '柑橘汁', similarity: 0.75, note: '口感略為不同但功能相同' },
    { name: 'Mango + Lemon', nameZh: '芒果汁＋檸檬汁', similarity: 0.45, note: '熱帶風格替代方案' },
  ],
  'pineapple juice': [
    { name: 'Passion Fruit Juice', nameZh: '百香果汁', similarity: 0.6, note: '同為熱帶水果，酸度更高' },
    { name: 'Mango Juice', nameZh: '芒果汁', similarity: 0.55, note: '質地相近，風味更甜潤' },
    { name: 'Guava Juice', nameZh: '芭樂汁', similarity: 0.5, note: '熱帶水果替代，帶有獨特芳香' },
  ],
  'cranberry juice': [
    { name: 'Pomegranate Juice', nameZh: '石榴汁', similarity: 0.75, note: '同樣酸甜帶澀，色澤相近' },
    { name: 'Hibiscus Tea', nameZh: '洛神花茶', similarity: 0.6, note: '色澤艷紅，酸度相近，無糖版最佳' },
    { name: 'Tart Cherry Juice', nameZh: '酸櫻桃汁', similarity: 0.65, note: '酸度充足，色澤略深' },
  ],
  'passion fruit': [
    { name: 'Mango Purée', nameZh: '芒果泥', similarity: 0.55, note: '熱帶風味替代，質地相近' },
    { name: 'Guava Purée', nameZh: '芭樂泥', similarity: 0.5, note: '熱帶水果，帶有獨特花香' },
    { name: 'Pineapple + Lime', nameZh: '鳳梨汁＋萊姆汁', similarity: 0.45, note: '混合模擬百香果的酸甜熱帶感' },
  ],

  /* ── Syrups ───────────────────────────────────────────────── */
  'simple syrup': [
    { name: 'Honey Syrup', nameZh: '蜂蜜糖漿', similarity: 0.8, note: '1:1蜂蜜水，增添花蜜風味' },
    { name: 'Agave Syrup', nameZh: '龍舌蘭糖漿', similarity: 0.85, note: '口感柔和，最接近簡糖的替代品' },
    { name: 'Maple Syrup', nameZh: '楓糖漿', similarity: 0.6, note: '帶明顯楓木風味，適合威士忌調酒' },
  ],
  'honey syrup': [
    { name: 'Agave Syrup', nameZh: '龍舌蘭糖漿', similarity: 0.8, note: '甜度接近，口感更為中性' },
    { name: 'Simple Syrup', nameZh: '簡單糖漿', similarity: 0.75, note: '缺少蜂蜜風味，但甜度功能相同' },
    { name: 'Maple Syrup', nameZh: '楓糖漿', similarity: 0.6, note: '天然甜味劑，帶獨特楓木香' },
  ],
  'agave syrup': [
    { name: 'Honey Syrup', nameZh: '蜂蜜糖漿', similarity: 0.8, note: '天然甜味劑，花蜜調性替代' },
    { name: 'Simple Syrup', nameZh: '簡單糖漿', similarity: 0.75, note: '最基本的替代，用量相同' },
    { name: 'Demerara Syrup', nameZh: '德梅拉拉糖漿', similarity: 0.65, note: '帶有太妃糖與焦糖風味' },
  ],
  grenadine: [
    { name: 'Raspberry Syrup', nameZh: '覆盆子糖漿', similarity: 0.7, note: '同為紅色果味糖漿，帶莓果調' },
    { name: 'Pomegranate Molasses + Simple Syrup', nameZh: '石榴糖蜜＋簡糖', similarity: 0.8, note: '1:3混合最接近正宗紅石榴糖漿' },
    { name: 'Cherry Syrup', nameZh: '櫻桃糖漿', similarity: 0.6, note: '色澤與甜度相近' },
  ],
  orgeat: [
    { name: 'Amaretto', nameZh: '杏仁利口酒', similarity: 0.65, note: '用量減半，會增加酒精度' },
    { name: 'Almond Milk + Sugar', nameZh: '杏仁奶＋糖', similarity: 0.6, note: '等量混合模擬杏仁糖漿口感' },
    { name: 'Falernum', nameZh: '法勒南糖漿', similarity: 0.45, note: '帶有丁香與萊姆的複雜替代' },
  ],
  'demerara syrup': [
    { name: 'Simple Syrup', nameZh: '簡單糖漿', similarity: 0.75, note: '缺少焦糖深度，但功能相同' },
    { name: 'Turbinado Sugar Syrup', nameZh: '粗砂糖糖漿', similarity: 0.9, note: '幾乎相同的替代品' },
    { name: 'Maple Syrup', nameZh: '楓糖漿', similarity: 0.55, note: '深色糖漿替代，帶楓木調性' },
  ],
  'vanilla syrup': [
    { name: 'Simple Syrup + Vanilla Extract', nameZh: '簡糖＋香草精', similarity: 0.85, note: '每30ml加2-3滴香草精即可' },
    { name: 'Honey Syrup', nameZh: '蜂蜜糖漿', similarity: 0.5, note: '有天然甜度但缺少香草調' },
    { name: 'Licor 43', nameZh: '43利口酒', similarity: 0.55, note: '含香草成分的利口酒，會增加酒精度' },
  ],
  'cinnamon syrup': [
    { name: 'Simple Syrup + Cinnamon', nameZh: '簡糖＋肉桂', similarity: 0.8, note: '熱水溶糖後加肉桂棒浸泡' },
    { name: 'Allspice Dram', nameZh: '多香果利口酒', similarity: 0.5, note: '帶有肉桂成分的辛香利口酒' },
    { name: 'Honey + Cinnamon', nameZh: '蜂蜜＋肉桂', similarity: 0.65, note: '天然甜味加肉桂的簡易替代' },
  ],
  'ginger syrup': [
    { name: 'Ginger Beer (reduced)', nameZh: '薑汁汽水（收汁）', similarity: 0.6, note: '小火煮至濃縮為糖漿狀' },
    { name: 'Fresh Ginger + Simple Syrup', nameZh: '新鮮生薑＋簡糖', similarity: 0.85, note: '磨碎生薑加入熱糖漿浸泡過濾' },
    { name: 'Honey Ginger Tea', nameZh: '蜂蜜薑茶', similarity: 0.5, note: '簡易替代，甜度需調整' },
  ],
  falernum: [
    { name: 'Orgeat + Lime + Clove', nameZh: '杏仁糖漿＋萊姆＋丁香', similarity: 0.65, note: '混合模擬法勒南的複合風味' },
    { name: 'Allspice Dram', nameZh: '多香果利口酒', similarity: 0.55, note: '辛香調性相近，缺少萊姆與杏仁' },
    { name: 'Velvet Falernum', nameZh: '絲絨法勒南', similarity: 0.95, note: '同類產品的不同品牌' },
  ],
  'raspberry syrup': [
    { name: 'Grenadine', nameZh: '紅石榴糖漿', similarity: 0.65, note: '同為紅色果味糖漿，風味略有不同' },
    { name: 'Chambord', nameZh: '香波堡', similarity: 0.7, note: '覆盆子利口酒，會增加酒精度' },
    { name: 'Mixed Berry Syrup', nameZh: '綜合莓果糖漿', similarity: 0.8, note: '以新鮮莓果煮製的糖漿最佳' },
  ],
  'passion fruit syrup': [
    { name: 'Passion Fruit Purée + Simple Syrup', nameZh: '百香果泥＋簡糖', similarity: 0.9, note: '等量混合即可完美替代' },
    { name: 'Mango Syrup', nameZh: '芒果糖漿', similarity: 0.5, note: '同為熱帶水果糖漿，風味不同' },
    { name: 'Guava Syrup', nameZh: '芭樂糖漿', similarity: 0.45, note: '熱帶風味替代方案' },
  ],

  /* ── Bitters ──────────────────────────────────────────────── */
  angostura: [
    { name: "Peychaud's Bitters", nameZh: '裴喬苦精', similarity: 0.7, note: '更為花香與茴香調性，用量相同' },
    { name: 'Orange Bitters', nameZh: '橙皮苦精', similarity: 0.55, note: '柑橘調性取代芳香料調性' },
    { name: 'Amaro Montenegro', nameZh: '蒙特內哥羅苦酒', similarity: 0.45, note: '作為替代需大幅減量（幾滴即可）' },
  ],
  "peychaud's": [
    { name: 'Angostura Bitters', nameZh: '安格斯圖拉苦精', similarity: 0.7, note: '最常見替代，缺少茴香紅色' },
    { name: 'Creole Bitters', nameZh: '克里奧爾苦精', similarity: 0.8, note: '風味檔案最為接近' },
    { name: 'Absinthe (dash)', nameZh: '苦艾酒（少量）', similarity: 0.4, note: '幾滴提供茴香調性' },
  ],
  'orange bitters': [
    { name: 'Angostura Bitters', nameZh: '安格斯圖拉苦精', similarity: 0.55, note: '缺少柑橘調但提供芳香苦味' },
    { name: 'Orange Peel', nameZh: '橙皮', similarity: 0.5, note: '以噴附橙皮油替代苦精的柑橘調' },
    { name: "Regans' Orange Bitters", nameZh: '雷根斯橙皮苦精', similarity: 0.95, note: '不同品牌的橙皮苦精' },
  ],

  /* ── Fortified Wines / Vermouth ───────────────────────────── */
  'sweet vermouth': [
    { name: 'Dry Vermouth + Simple Syrup', nameZh: '不甜苦艾酒＋簡糖', similarity: 0.6, note: '5:1混合模擬甜苦艾酒' },
    { name: 'Punt e Mes', nameZh: '一又二分之一', similarity: 0.85, note: '苦甜比更高的義式苦艾酒' },
    { name: 'Amaro Montenegro', nameZh: '蒙特內哥羅苦酒', similarity: 0.6, note: '用量減半，帶有草本苦甜' },
  ],
  'dry vermouth': [
    { name: 'Lillet Blanc', nameZh: '麗葉白酒', similarity: 0.7, note: '帶有柑橘花香，甜度稍高' },
    { name: 'Fino Sherry', nameZh: '菲諾雪莉酒', similarity: 0.65, note: '乾型加烈酒，帶有堅果與鹹鮮' },
    { name: 'White Wine', nameZh: '白葡萄酒', similarity: 0.5, note: '選用乾型酒款，缺少苦艾草本' },
  ],
  'lillet blanc': [
    { name: 'Cocchi Americano', nameZh: '可奇美式開胃酒', similarity: 0.85, note: '最接近的替代品，帶有奎寧苦味' },
    { name: 'Dry Vermouth', nameZh: '不甜苦艾酒', similarity: 0.6, note: '草本風味更重，缺少果香' },
    { name: 'Blanc Vermouth', nameZh: '白苦艾酒', similarity: 0.7, note: '介於甜與不甜之間的苦艾酒' },
  ],
  'cocchi americano': [
    { name: 'Lillet Blanc', nameZh: '麗葉白酒', similarity: 0.85, note: '最佳替代，缺少奎寧苦味' },
    { name: 'Dry Vermouth + Orange Bitters', nameZh: '不甜苦艾酒＋橙皮苦精', similarity: 0.6, note: '混合模擬開胃酒風格' },
    { name: 'Americano Bianco', nameZh: '白色美式開胃酒', similarity: 0.8, note: '同類型不同品牌' },
  ],

  /* ── Fresh Ingredients / Other ────────────────────────────── */
  'egg white': [
    { name: 'Aquafaba', nameZh: '鷹嘴豆水', similarity: 0.9, note: '30ml替代一顆蛋白，打發效果極佳' },
    { name: 'Ms Better\'s Bitters Miraculous Foamer', nameZh: '奇蹟起泡劑', similarity: 0.8, note: '專為調酒設計的植物性起泡劑' },
    { name: 'Fee Brothers Fee Foam', nameZh: '費氏起泡劑', similarity: 0.75, note: '幾滴即可產生綿密泡沫' },
  ],
  'coconut cream': [
    { name: 'Cream of Coconut', nameZh: '椰奶糖漿', similarity: 0.9, note: '如 Coco López，較甜但功能相同' },
    { name: 'Coconut Milk + Sugar', nameZh: '椰奶＋糖', similarity: 0.7, note: '混合至濃稠狀態模擬椰奶油' },
    { name: 'Oat Cream', nameZh: '燕麥奶油', similarity: 0.4, note: '純素替代，缺少椰子風味' },
  ],
  mint: [
    { name: 'Fresh Basil', nameZh: '新鮮羅勒', similarity: 0.5, note: '草本風味替代，帶有甜胡椒調' },
    { name: 'Shiso (Perilla)', nameZh: '紫蘇', similarity: 0.55, note: '日式風格替代，獨特芳香' },
    { name: 'Dried Mint', nameZh: '乾燥薄荷', similarity: 0.6, note: '風味較淡，用量加倍' },
  ],
  'fresh ginger': [
    { name: 'Ginger Syrup', nameZh: '薑汁糖漿', similarity: 0.7, note: '每2cm生薑≈15ml薑汁糖漿' },
    { name: 'Ground Ginger', nameZh: '薑粉', similarity: 0.5, note: '⅛茶匙替代2cm新鮮生薑' },
    { name: 'Ginger Beer', nameZh: '薑汁汽水', similarity: 0.45, note: '含碳酸，用於長飲替代效果較好' },
  ],
  espresso: [
    { name: 'Cold Brew Concentrate', nameZh: '冷萃咖啡濃縮', similarity: 0.8, note: '等量替代，風味更柔和' },
    { name: 'Coffee Liqueur', nameZh: '咖啡利口酒', similarity: 0.55, note: '會增加甜度與酒精度' },
    { name: 'Instant Espresso Powder', nameZh: '即溶濃縮咖啡粉', similarity: 0.65, note: '1茶匙溶於30ml熱水' },
  ],
  'tonic water': [
    { name: 'Bitter Lemon', nameZh: '苦檸檬汽水', similarity: 0.65, note: '帶有檸檬風味的苦味碳酸飲' },
    { name: 'Chinotto', nameZh: '金諾托', similarity: 0.55, note: '義式苦味碳酸飲，風味更複雜' },
    { name: 'Tonic Syrup + Soda', nameZh: '通寧糖漿＋蘇打水', similarity: 0.85, note: '可精準控制苦味與甜度' },
  ],
  'ginger beer': [
    { name: 'Ginger Ale', nameZh: '薑汁汽水', similarity: 0.7, note: '薑味較淡，口感更為柔和' },
    { name: 'Ginger Syrup + Soda', nameZh: '薑汁糖漿＋蘇打水', similarity: 0.75, note: '可調整辛辣度與甜度' },
    { name: 'Kombucha (Ginger)', nameZh: '薑味康普茶', similarity: 0.5, note: '發酵風味替代，低酒精' },
  ],
  'soda water': [
    { name: 'Club Soda', nameZh: '蘇打水', similarity: 0.95, note: '幾乎相同，礦物質含量略有差異' },
    { name: 'Sparkling Mineral Water', nameZh: '氣泡礦泉水', similarity: 0.9, note: '天然氣泡水，口感更為細緻' },
    { name: 'Tonic Water', nameZh: '通寧水', similarity: 0.4, note: '會增加苦味與甜度' },
  ],
  'club soda': [
    { name: 'Soda Water', nameZh: '蘇打水', similarity: 0.95, note: '基本上可互換使用' },
    { name: 'Sparkling Water', nameZh: '氣泡水', similarity: 0.9, note: '天然氣泡水替代' },
    { name: 'Seltzer', nameZh: '蘇打氣泡水', similarity: 0.95, note: '純碳酸水，無添加礦物鹽' },
  ],
}

/**
 * Find substitution suggestions for an ingredient by matching against the map.
 * Tries exact lowercase match first, then partial keyword match.
 */
export function findSubstitutions(ingredientName: string): SubstituteItem[] | null {
  const lower = ingredientName.toLowerCase()

  // Exact match
  if (substitutionMap[lower]) return substitutionMap[lower]

  // Partial match: check if any key appears in the ingredient name, or vice-versa
  for (const key of Object.keys(substitutionMap)) {
    if (lower.includes(key) || key.includes(lower)) {
      return substitutionMap[key]
    }
  }

  return null
}
