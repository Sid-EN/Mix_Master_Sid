/**
 * seasonalData.ts — 季節調酒推薦資料
 */

export interface Season {
  id: string;
  nameZh: string;
  nameEn: string;
  months: number[];
  icon: string;
  color: string;
  description: string;
  keywords: string[];
  suggestedIngredients: string[];
  mood: string;
}

export const seasons: Season[] = [
  {
    id: 'spring',
    nameZh: '春季',
    nameEn: 'Spring',
    months: [3, 4, 5],
    icon: '🌸',
    color: 'emerald',
    description: '春暖花開的季節，適合清新花香與果香調酒，以輕盈的口感迎接萬物復甦的氣息。',
    keywords: ['floral', 'citrus', 'light', 'fresh', 'elderflower', 'cucumber', 'prosecco', 'gin', 'herbal', 'berry'],
    suggestedIngredients: ['Gin', 'Elderflower Liqueur', 'Prosecco', 'Cucumber'],
    mood: '清新花香、微風拂面',
  },
  {
    id: 'summer',
    nameZh: '夏季',
    nameEn: 'Summer',
    months: [6, 7, 8],
    icon: '☀️',
    color: 'cyan',
    description: '炎炎夏日需要冰涼解渴的調酒，熱帶水果與清涼薄荷是這個季節的最佳夥伴。',
    keywords: ['tropical', 'refreshing', 'frozen', 'citrus', 'coconut', 'mint', 'rum', 'tequila', 'lime', 'watermelon'],
    suggestedIngredients: ['Light Rum', 'Tequila', 'Coconut', 'Lime', 'Mint'],
    mood: '冰涼熱帶、沁人心脾',
  },
  {
    id: 'autumn',
    nameZh: '秋季',
    nameEn: 'Autumn',
    months: [9, 10, 11],
    icon: '🍂',
    color: 'amber',
    description: '秋高氣爽適合溫暖香料與堅果風味，蘋果白蘭地與肉桂糖漿帶來豐收的韻味。',
    keywords: ['spice', 'warm', 'apple', 'cinnamon', 'nutty', 'caramel', 'bourbon', 'whisky', 'oak', 'vanilla'],
    suggestedIngredients: ['Bourbon', 'Apple Brandy', 'Cinnamon Syrup', 'Amaro'],
    mood: '溫暖香料、楓紅餘韻',
  },
  {
    id: 'winter',
    nameZh: '冬季',
    nameEn: 'Winter',
    months: [12, 1, 2],
    icon: '❄️',
    color: 'indigo',
    description: '寒冬需要暖身的烈酒與濃郁風味，巧克力、咖啡與奶油帶來壁爐旁的幸福感。',
    keywords: ['warm', 'rich', 'chocolate', 'coffee', 'cream', 'spice', 'strong', 'cognac', 'whisky', 'smoky'],
    suggestedIngredients: ['Whisky', 'Cognac', 'Baileys', 'Coffee Liqueur', 'Cream'],
    mood: '醇厚暖心、壁爐篝火',
  },
];

/** 依照當前月份回傳對應的季節 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1; // 1-12
  return seasons.find((s) => s.months.includes(month)) ?? seasons[0];
}
