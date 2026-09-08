'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface GlossaryTerm {
  en: string;
  zh: string;
  ja: string;
  category: string;
  definition: string;
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { key: '全部', label: '全部', icon: '' },
  { key: '技法', label: '技法 Technique', icon: '🧪' },
  { key: '器具', label: '器具 Equipment', icon: '🍸' },
  { key: '材料', label: '材料 Ingredient', icon: '🧊' },
  { key: '計量', label: '計量 Measurement', icon: '📐' },
  { key: '品飲', label: '品飲 Tasting', icon: '🍷' },
  { key: '風格', label: '風格 Style', icon: '📖' },
  { key: '製程', label: '製程 Production', icon: '🏭' },
] as const;

/* ------------------------------------------------------------------ */
/*  100+ Glossary Terms                                                */
/* ------------------------------------------------------------------ */
const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ─── 技法 Technique (22) ──────────────────────────────────────────
  { en: 'Shake', zh: '搖盪', ja: 'シェイク', category: '技法', definition: '使用搖酒器將材料與冰塊一起劇烈搖晃，達到快速冷卻、稀釋與混合的效果。適用於含果汁、糖漿或蛋白的調酒。' },
  { en: 'Stir', zh: '攪拌', ja: 'ステア', category: '技法', definition: '使用吧匙在調酒杯中輕柔攪拌，適合純烈酒調酒如Martini、Manhattan，保持酒液清澈透明。' },
  { en: 'Build', zh: '直調', ja: 'ビルド', category: '技法', definition: '直接在杯中依序加入材料，無需額外器具。常用於Highball等簡單長飲調酒。' },
  { en: 'Muddle', zh: '搗壓', ja: 'マドル', category: '技法', definition: '用搗棒在杯底或搖酒器中壓碎水果、香草等材料以釋放風味。Mojito和Old Fashioned常用此技法。' },
  { en: 'Strain', zh: '過濾', ja: 'ストレイン', category: '技法', definition: '將調酒從搖酒器或調酒杯倒出時，使用隔冰器隔除冰塊與固體殘渣。' },
  { en: 'Double Strain', zh: '雙重過濾', ja: 'ダブルストレイン', category: '技法', definition: '在一般過濾之外額外使用細網篩，過濾碎冰、果肉和細小顆粒，讓酒液更加清澈。' },
  { en: 'Dry Shake', zh: '乾搖', ja: 'ドライシェイク', category: '技法', definition: '不加冰的搖盪，專門用於乳化蛋白或鷹嘴豆水，產生綿密泡沫。通常乾搖後再加冰搖盪一次。' },
  { en: 'Roll', zh: '滾動', ja: 'ロール', category: '技法', definition: '在兩個容器間來回倒動酒液，溫和地混合材料。Bloody Mary常用此技法，避免過度稀釋。' },
  { en: 'Layer / Float', zh: '分層/漂浮', ja: 'レイヤー', category: '技法', definition: '利用不同酒液的比重差異，沿吧匙背面緩緩倒入，疊出美麗的分層效果。B-52是經典分層調酒。' },
  { en: 'Flame', zh: '火焰', ja: 'フレイム', category: '技法', definition: '點火引燃高酒精度的烈酒或柑橘精油，增加視覺效果和焦香風味。操作時須注意安全。' },
  { en: 'Express', zh: '擠壓', ja: 'エクスプレス', category: '技法', definition: '擠壓柑橘皮使精油噴灑在酒面上，增添芳香。常用柳橙皮或檸檬皮進行。' },
  { en: 'Churn', zh: '攪動', ja: 'チャーン', category: '技法', definition: '用吧匙在碎冰中快速上下攪動，使酒液與碎冰充分混合。常見於Julep類調酒。' },
  { en: 'Swizzle', zh: '轉攪', ja: 'スウィズル', category: '技法', definition: '使用swizzle stick或吧匙在碎冰中快速旋轉，讓杯壁結霜。源自加勒比海的傳統技法。' },
  { en: 'Throwing', zh: '拋接', ja: 'スローイング', category: '技法', definition: '將酒液從高處倒至低處容器，增加空氣接觸。這是古老的調酒技法，可增添質感和柔和度。' },
  { en: 'Rinse', zh: '杯壁沖洗', ja: 'リンス', category: '技法', definition: '少量烈酒（如苦艾酒）塗抹杯壁後倒掉，為調酒增加微妙香氣層次。Sazerac必用此技法。' },
  { en: 'Infuse', zh: '浸泡', ja: 'インフューズ', category: '技法', definition: '將香草、水果或香料長時間浸漬在烈酒中萃取風味，製作風味烈酒的基本方法。' },
  { en: 'Fat-Wash', zh: '脂洗', ja: 'ファットウォッシュ', category: '技法', definition: '用融化的脂肪（如奶油、培根油）浸泡烈酒，冷凍後去除凝固脂肪，保留豐富油脂風味。' },
  { en: 'Sous Vide', zh: '真空低溫', ja: 'スーヴィッド', category: '技法', definition: '將材料真空密封後以精確低溫長時間萃取風味，可快速製作浸泡酒或糖漿，風味萃取更均勻。' },
  { en: 'Batch', zh: '批次', ja: 'バッチ', category: '技法', definition: '預先大量調配雞尾酒，適合派對或大量服務場合。需精確計算稀釋率和比例。' },
  { en: 'Carbonate', zh: '碳酸化', ja: 'カーボネート', category: '技法', definition: '使用氣泡水機或CO2鋼瓶將調酒注入二氧化碳，製作自製碳酸調酒。需注意壓力安全。' },
  { en: 'Whip Shake', zh: '輕搖', ja: 'ウィップシェイク', category: '技法', definition: '僅用少量碎冰快速短搖，使碎冰完全融化。常用於Tiki和碎冰調酒，控制稀釋。' },
  { en: 'Blend', zh: '攪打', ja: 'ブレンド', category: '技法', definition: '使用果汁機將冰塊與材料攪打成冰沙狀。Frozen Daiquiri和Piña Colada的必備技法。' },

  // ─── 器具 Equipment (16) ──────────────────────────────────────────
  { en: 'Jigger', zh: '量酒器', ja: 'ジガー', category: '器具', definition: '雙頭量杯，通常為1oz/2oz或30ml/45ml，用於精確測量酒液。是專業調酒師的必備工具。' },
  { en: 'Boston Shaker', zh: '波士頓搖酒器', ja: 'ボストンシェイカー', category: '器具', definition: '由一個金屬杯和一個玻璃杯（或兩個金屬杯）組成的搖酒器。專業調酒師最常使用的款式。' },
  { en: 'Cobbler Shaker', zh: '三件式搖酒器', ja: 'コブラーシェイカー', category: '器具', definition: '由杯身、內建過濾蓋和小蓋子三部分組成的搖酒器。適合初學者，日式調酒師也偏好此款。' },
  { en: 'Hawthorne Strainer', zh: '霍桑隔冰器', ja: 'ホーソンストレーナー', category: '器具', definition: '帶有彈簧圈的過濾器，搭配波士頓搖酒器使用。彈簧可攔截冰塊和大部分固體。' },
  { en: 'Julep Strainer', zh: '朱利普隔冰器', ja: 'ジュレップストレーナー', category: '器具', definition: '碗型打孔過濾器，搭配調酒杯使用。造型優雅，適合攪拌法調酒的過濾。' },
  { en: 'Bar Spoon', zh: '吧匙', ja: 'バースプーン', category: '器具', definition: '長柄螺旋攪拌匙，用於攪拌調酒、分層和測量。一匙約等於5ml，螺旋柄幫助順暢攪拌。' },
  { en: 'Muddler', zh: '搗棒', ja: 'マドラー', category: '器具', definition: '用於搗壓水果、草本和糖的木棒或不鏽鋼棒。底部通常有齒狀紋路增加摩擦力。' },
  { en: 'Mixing Glass', zh: '調酒杯', ja: 'ミキシンググラス', category: '器具', definition: '厚壁玻璃攪拌杯，用於攪拌法調酒。高品質款式常帶有優美刻紋，容量約500-700ml。' },
  { en: 'Fine Strainer', zh: '細網篩', ja: 'ファインストレーナー', category: '器具', definition: '細孔茶漏型過濾器，用於雙重過濾。能攔截碎冰、果肉和香草碎片，使酒液更加清澈。' },
  { en: 'Channel Knife', zh: '通道刀', ja: 'チャネルナイフ', category: '器具', definition: '用於削出長條螺旋狀柑橘皮的專用刀具，製作裝飾性的citrus twist。' },
  { en: 'Peeler', zh: 'Y型削皮器', ja: 'ピーラー', category: '器具', definition: '用於削取寬幅柑橘皮的工具。削出的皮片可做express噴油或裝飾用途。' },
  { en: 'Pour Spout', zh: '酒嘴', ja: 'ポアラー', category: '器具', definition: '安裝在酒瓶口的流量控制裝置，幫助穩定倒酒速度。自由倒酒法(free pour)的必備工具。' },
  { en: 'Speed Rail', zh: '快速酒架', ja: 'スピードレール', category: '器具', definition: '安裝在吧台工作區域的金屬瓶架，放置最常用的基酒，方便調酒師快速取用。' },
  { en: 'Lewis Bag', zh: '碎冰布袋', ja: 'ルイスバッグ', category: '器具', definition: '厚帆布袋，將冰塊放入後用木槌敲碎。能製作大小均勻的碎冰，適合Julep和Swizzle。' },
  { en: 'Absinthe Fountain', zh: '苦艾酒噴泉', ja: 'アブサンファウンテン', category: '器具', definition: '精美的玻璃冰水滴漏裝置，用於儀式性地將冰水慢慢滴入苦艾酒中，使其產生乳化濁變。' },
  { en: 'Citrus Press', zh: '柑橘壓汁器', ja: 'シトラスプレス', category: '器具', definition: '用於快速壓榨檸檬、萊姆等柑橘類水果的手動工具。新鮮果汁是優質調酒的關鍵。' },

  // ─── 材料 Ingredient (16) ─────────────────────────────────────────
  { en: 'Simple Syrup', zh: '糖漿', ja: 'シンプルシロップ', category: '材料', definition: '以1:1比例（重量）混合白砂糖與水煮溶而成的基礎甜味劑，是最常用的調酒糖漿。' },
  { en: 'Rich Syrup', zh: '濃糖漿', ja: 'リッチシロップ', category: '材料', definition: '以2:1比例（糖：水）製作的高濃度糖漿，質地更濃稠，甜度更高，保存期限更長。' },
  { en: 'Grenadine', zh: '紅石榴糖漿', ja: 'グレナデン', category: '材料', definition: '以石榴汁為基底的紅色糖漿。手工版用新鮮石榴汁和糖製作，風味遠勝市售加色素產品。' },
  { en: 'Orgeat', zh: '杏仁糖漿', ja: 'オルジェ', category: '材料', definition: '以杏仁為基底的乳白色糖漿，帶有杏仁和橙花香氣。Mai Tai的靈魂材料。' },
  { en: 'Bitters', zh: '苦精', ja: 'ビターズ', category: '材料', definition: '以高濃度酒精浸泡草本、香料等萃取的濃縮苦味劑。如同調酒的調味料，少量即可改變整杯風味。' },
  { en: 'Tincture', zh: '酊劑', ja: 'ティンクチャー', category: '材料', definition: '高濃度酒精萃取單一風味的濃縮液。與苦精不同，酊劑通常只含一種主要風味。' },
  { en: 'Shrub', zh: '灌木醋飲', ja: 'シュラブ', category: '材料', definition: '水果加糖加醋發酵製成的酸甜濃縮飲品。源自殖民時代的保存技術，近年在調酒界復興。' },
  { en: 'Oleo Saccharum', zh: '油糖', ja: 'オレオサッカルム', category: '材料', definition: '將柑橘皮與糖混合靜置，利用滲透壓萃取精油而成的糖漿。是製作Punch的傳統祕方。' },
  { en: 'Aquafaba', zh: '鷹嘴豆水', ja: 'アクアファバ', category: '材料', definition: '罐頭鷹嘴豆的浸泡液，可替代蛋白製作泡沫。素食友善的調酒選擇。' },
  { en: 'Egg White', zh: '蛋白', ja: '卵白', category: '材料', definition: '用於創造絲滑綿密泡沫的經典調酒材料。Whiskey Sour和Pisco Sour的標誌性口感來源。' },
  { en: 'Cream of Coconut', zh: '椰子奶油', ja: 'ココナッツクリーム', category: '材料', definition: '加糖椰子奶油，濃稠甜潤。Piña Colada的核心材料，注意與不甜的椰奶(coconut milk)區分。' },
  { en: 'Falernum', zh: '法勒南', ja: 'ファレナム', category: '材料', definition: '源自加勒比海的糖漿或利口酒，結合杏仁、薑、丁香和萊姆風味。Tiki調酒的經典材料。' },
  { en: 'Absinthe', zh: '苦艾酒', ja: 'アブサン', category: '材料', definition: '以苦艾草為主要原料的高酒精度蒸餾酒，帶有獨特茴香風味。曾被禁售近百年，現已合法。' },
  { en: 'Mezcal', zh: '梅斯卡爾', ja: 'メスカル', category: '材料', definition: '墨西哥龍舌蘭蒸餾酒，使用地下坑烤龍舌蘭心製成，帶有獨特煙燻風味。Tequila是其子類別。' },
  { en: 'Demerara Syrup', zh: '德梅拉拉糖漿', ja: 'デメララシロップ', category: '材料', definition: '以德梅拉拉紅糖製作的糖漿，帶有焦糖和太妃糖風味。比白糖漿多了深度和複雜性。' },
  { en: 'Honey Syrup', zh: '蜂蜜糖漿', ja: 'ハニーシロップ', category: '材料', definition: '蜂蜜與溫水以3:1或2:1稀釋，降低黏稠度使其更容易在冷飲中混合。Bee\'s Knees的關鍵材料。' },

  // ─── 計量 Measurement (12) ────────────────────────────────────────
  { en: 'ABV (Alcohol By Volume)', zh: '酒精濃度', ja: 'アルコール度数', category: '計量', definition: '酒精體積百分比，表示酒液中酒精所佔比例。例如40% ABV表示100ml酒液含40ml純酒精。' },
  { en: 'Proof', zh: '酒精標度', ja: 'プルーフ', category: '計量', definition: '美國制酒精標度等於ABV的兩倍。例如80 proof = 40% ABV。英國制歷史上使用不同計算方式。' },
  { en: 'Dash', zh: '少許', ja: 'ダッシュ', category: '計量', definition: '約0.6-0.9ml的微量計量單位，常用於苦精。快速倒出一下約為一dash。' },
  { en: 'Barspoon', zh: '吧匙量', ja: 'バースプーン', category: '計量', definition: '以吧匙為單位的計量，約等於5ml或1茶匙。常用於少量甜味劑或利口酒的添加。' },
  { en: 'Jigger (measure)', zh: '基格量', ja: 'ジガー', category: '計量', definition: '標準量酒單位，1 jigger = 1.5 oz = 約44ml。雙頭量酒器大端的容量。' },
  { en: 'Pony', zh: '波尼量', ja: 'ポニー', category: '計量', definition: '等於1 oz（約30ml）的量酒單位。通常為雙頭量酒器小端的容量。' },
  { en: 'Shot', zh: '一份', ja: 'ショット', category: '計量', definition: '一般指1至1.5 oz（30-44ml）的酒量，依各國標準不同。常用於快速飲用烈酒。' },
  { en: 'Finger', zh: '指幅', ja: 'フィンガー', category: '計量', definition: '以手指橫放在杯上測量的非正式單位。一指幅約等於3/4 oz的威士忌量。' },
  { en: 'Free Pour', zh: '自由倒酒', ja: 'フリーポア', category: '計量', definition: '不使用量杯，依靠計數倒酒時間來估計份量。專業調酒師常用，約4秒計數等於1.5oz。' },
  { en: 'Standard Drink', zh: '標準飲品', ja: 'スタンダードドリンク', category: '計量', definition: '含10至14克純酒精的飲品單位（各國定義不同）。用於衡量飲酒量和健康建議的基準。' },
  { en: 'Split', zh: '半份', ja: 'スプリット', category: '計量', definition: '將配方中的基酒份量一分為二，使用兩種不同烈酒各半。增加風味複雜度的常用手法。' },
  { en: 'Rinse (measure)', zh: '沖洗量', ja: 'リンス', category: '計量', definition: '極少量酒液（約1/4 oz以下），僅用於塗抹杯壁。常見於苦艾酒或泥煤威士忌的使用。' },

  // ─── 品飲 Tasting (16) ────────────────────────────────────────────
  { en: 'Nose', zh: '鼻感/香氣', ja: 'ノーズ', category: '品飲', definition: '品飲時的嗅覺感受，包含酒液散發的所有香氣。品酒的第一步通常是聞香。' },
  { en: 'Palate', zh: '口感', ja: 'パレット', category: '品飲', definition: '酒液入口後的味覺感受，包含甜、酸、苦、鹹和鮮味的綜合體驗。' },
  { en: 'Finish', zh: '餘韻', ja: 'フィニッシュ', category: '品飲', definition: '吞嚥後殘留在口中的風味及其持續時間。長餘韻通常被視為高品質的指標。' },
  { en: 'Body', zh: '酒體', ja: 'ボディ', category: '品飲', definition: '酒液在口中的厚度感和重量感。分為輕酒體、中等酒體和重酒體。受酒精度和糖分影響。' },
  { en: 'Mouthfeel', zh: '口腔觸感', ja: 'マウスフィール', category: '品飲', definition: '酒液在口中的物理觸感，包括滑順度、澀感、氣泡感、溫度感等非味覺的口腔感受。' },
  { en: 'Tannin', zh: '單寧', ja: 'タンニン', category: '品飲', definition: '來自葡萄皮、種子和橡木桶的多酚化合物，產生收斂乾澀感。紅酒和木桶陳年烈酒的重要元素。' },
  { en: 'Acidity', zh: '酸度', ja: 'アシディティ', category: '品飲', definition: '酒中酸味的強度。適當的酸度帶來清新活力，是調酒平衡的關鍵因素之一。' },
  { en: 'Dry', zh: '乾/不甜', ja: 'ドライ', category: '品飲', definition: '指殘糖量低、不甜的口感。Dry Martini即以不甜著稱。在葡萄酒和調酒中都是重要的風味描述。' },
  { en: 'Sweet', zh: '甜', ja: 'スウィート', category: '品飲', definition: '含糖量較高的甜潤口感。調酒中的甜味來源包括糖漿、利口酒、甜苦艾酒等。' },
  { en: 'Umami', zh: '鮮味', ja: '旨味', category: '品飲', definition: '第五種基本味覺，帶有鹹鮮豐厚的滋味。在調酒中可透過番茄汁、味噌或昆布等食材引入。' },
  { en: 'Terroir', zh: '風土', ja: 'テロワール', category: '品飲', definition: '產地的氣候、土壤、地形等自然環境對原料風味的影響。葡萄酒和精品烈酒常強調風土特色。' },
  { en: 'Legs / Tears', zh: '酒淚', ja: 'レッグス', category: '品飲', definition: '搖晃酒杯後，酒液沿杯壁緩慢流下形成的液滴痕跡。與酒精度和糖分有關，非品質指標。' },
  { en: 'Bouquet', zh: '花束香', ja: 'ブーケ', category: '品飲', definition: '陳年後發展出的複雜香氣，區別於年輕酒的果香(aroma)。瓶中陳年和氧化會發展更豐富的花束香。' },
  { en: 'Oxidation', zh: '氧化', ja: '酸化', category: '品飲', definition: '酒液接觸空氣後產生的化學變化，可能改善或劣化風味。雪莉酒利用氧化發展獨特風味。' },
  { en: 'Decant', zh: '醒酒', ja: 'デキャンタージュ', category: '品飲', definition: '將酒液從瓶中倒入醒酒器，讓酒接觸空氣以釋放香氣、軟化單寧，或分離沉澱物。' },
  { en: 'Balance', zh: '平衡', ja: 'バランス', category: '品飲', definition: '調酒中甜、酸、苦、烈各元素的和諧程度。良好的平衡是一杯優秀調酒的核心標準。' },

  // ─── 風格 Style (14) ──────────────────────────────────────────────
  { en: 'Neat', zh: '純飲', ja: 'ストレート', category: '風格', definition: '不加冰、不加水，以室溫直接飲用烈酒。最能品嚐烈酒原始風味的飲用方式。' },
  { en: 'On the Rocks', zh: '加冰', ja: 'オンザロックス', category: '風格', definition: '在大冰塊上倒入烈酒或調酒飲用。冰塊緩慢融化會逐步稀釋和改變風味。' },
  { en: 'Up / Straight Up', zh: '冰鎮後不加冰', ja: 'アップ', category: '風格', definition: '經搖盪或攪拌冷卻後，過濾掉冰塊倒入冰鎮的雞尾酒杯中。Martini的經典呈現方式。' },
  { en: 'Dirty', zh: '混濁', ja: 'ダーティ', category: '風格', definition: '在Martini中加入橄欖汁（olive brine），使酒液呈現混濁狀。Dirty Martini是最常見的變體。' },
  { en: 'Perfect', zh: '完美', ja: 'パーフェクト', category: '風格', definition: '使用等量的甜苦艾酒(sweet vermouth)和不甜苦艾酒(dry vermouth)。Perfect Manhattan即用此比例。' },
  { en: 'Twist', zh: '加皮', ja: 'ツイスト', category: '風格', definition: '以柑橘皮作為裝飾，扭轉釋放精油。標註「with a twist」表示加檸檬皮裝飾。' },
  { en: 'Sour', zh: '酸味系', ja: 'サワー', category: '風格', definition: '由烈酒、柑橘汁和甜味劑組成的經典調酒結構。Whiskey Sour、Daiquiri都屬此家族。' },
  { en: 'Fizz', zh: '費茲', ja: 'フィズ', category: '風格', definition: 'Sour的延伸，額外加入蘇打水。Gin Fizz是代表作，Ramos Gin Fizz更加入奶油和蛋白。' },
  { en: 'Highball', zh: '高球', ja: 'ハイボール', category: '風格', definition: '烈酒加上大量碳酸飲料的長飲調酒。Whisky Highball在日本極為流行，講究冰塊和注氣技巧。' },
  { en: 'Tiki', zh: '提基', ja: 'ティキ', category: '風格', definition: '1930年代起源的熱帶風格調酒文化，特色是複雜配方、異國材料、蘭姆酒和華麗裝飾。' },
  { en: 'Cobbler', zh: '考伯勒', ja: 'コブラー', category: '風格', definition: '以碎冰、水果和糖為基礎的經典長飲風格。Sherry Cobbler是19世紀最流行的調酒之一。' },
  { en: 'Julep', zh: '朱利普', ja: 'ジュレップ', category: '風格', definition: '以碎冰、糖和薄荷為基礎的調酒風格。Mint Julep是肯塔基德比的官方飲品。' },
  { en: 'Punch', zh: '潘趣', ja: 'パンチ', category: '風格', definition: '多人分享的大型調酒，通常混合烈酒、柑橘、糖、水和香料。是現代雞尾酒文化的始祖。' },
  { en: 'Flip', zh: '翻轉', ja: 'フリップ', category: '風格', definition: '含全蛋的調酒風格，口感濃郁滑順。歷史上以熱飲為主，現代則多為冷飲。' },

  // ─── 製程 Production (13) ─────────────────────────────────────────
  { en: 'Distillation', zh: '蒸餾', ja: '蒸留', category: '製程', definition: '加熱發酵液使酒精蒸發後冷凝收集，提高酒精度並純化風味的核心製程。所有烈酒都經過蒸餾。' },
  { en: 'Fermentation', zh: '發酵', ja: '発酵', category: '製程', definition: '酵母將糖分轉化為酒精和二氧化碳的生化過程。是所有酒精飲料的起點。' },
  { en: 'Aging / Maturation', zh: '陳年', ja: '熟成', category: '製程', definition: '將烈酒存放在橡木桶中，讓酒液與木材交互作用，發展顏色、香氣和風味的過程。' },
  { en: 'Malting', zh: '製麥', ja: 'モルティング', category: '製程', definition: '將大麥浸水發芽後烘乾的過程，啟動酵素將澱粉轉化為可發酵糖分。威士忌和啤酒的關鍵步驟。' },
  { en: 'Mashing', zh: '糖化', ja: 'マッシング', category: '製程', definition: '將磨碎的麥芽與熱水混合，讓酵素將澱粉轉化為糖的過程。產出的甜液稱為麥汁(wort)。' },
  { en: 'Pot Still', zh: '壺式蒸餾器', ja: 'ポットスチル', category: '製程', definition: '傳統銅製蒸餾器，以批次方式蒸餾。保留較多原料風味和個性，常見於威士忌和干邑白蘭地。' },
  { en: 'Column Still', zh: '柱式蒸餾器', ja: 'コラムスチル', category: '製程', definition: '連續式蒸餾設備，可不間斷運作。產出更純淨、更高酒精度的烈酒，常用於伏特加和穀物威士忌。' },
  { en: 'Charring', zh: '炭化', ja: 'チャーリング', category: '製程', definition: '用火焰燒烤橡木桶內壁使其炭化。炭化層如同過濾器，賦予威士忌焦糖和香草風味。' },
  { en: 'Angel\'s Share', zh: '天使份額', ja: 'エンジェルズシェア', category: '製程', definition: '陳年過程中透過木桶蒸發損失的酒液，每年約2-4%。浪漫的說法是天使偷喝了這部分。' },
  { en: 'Blending', zh: '調配', ja: 'ブレンディング', category: '製程', definition: '將不同來源、年份或批次的烈酒混合，達到一致風味的技藝。調配師(Master Blender)是極受尊敬的職位。' },
  { en: 'Cask Strength', zh: '桶強', ja: 'カスクストレングス', category: '製程', definition: '直接從桶中取出、未加水稀釋的原酒。通常酒精度在50-65% ABV之間，風味更加濃縮強烈。' },
  { en: 'Single Malt', zh: '單一麥芽', ja: 'シングルモルト', category: '製程', definition: '由單一蒸餾廠使用100%大麥麥芽以壺式蒸餾製成的威士忌。展現蒸餾廠的獨特風格。' },
  { en: 'Solera', zh: '索雷拉系統', ja: 'ソレラ', category: '製程', definition: '源自西班牙的分級陳年系統，年輕酒不斷補入老酒桶中混合。雪莉酒和部分蘭姆酒採用此法。' },
];

/* ------------------------------------------------------------------ */
/*  Alphabet list                                                      */
/* ------------------------------------------------------------------ */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return GLOSSARY_TERMS.filter((t) => {
      const matchCategory = activeCategory === '全部' || t.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        t.en.toLowerCase().includes(q) ||
        t.zh.includes(q) ||
        t.ja.includes(q) ||
        t.definition.includes(q) ||
        t.category.includes(q)
      );
    });
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const map: Record<string, GlossaryTerm[]> = {};
    for (const t of filtered) {
      const letter = t.en[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(t);
    }
    const sorted = Object.keys(map).sort();
    return sorted.map((letter) => ({
      letter,
      terms: map[letter].sort((a, b) => a.en.localeCompare(b.en)),
    }));
  }, [filtered]);

  const activeLetters = useMemo(() => new Set(grouped.map((g) => g.letter)), [grouped]);

  const scrollToLetter = useCallback((letter: string) => {
    const el = document.getElementById(`letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const categoryIcon = (cat: string) => {
    const found = CATEGORIES.find((c) => c.key === cat);
    return found?.icon ?? '';
  };

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Header ────────────────────────────────────────────── */}
      <section className="px-6 pt-24 pb-6 max-w-5xl mx-auto text-center animate-fade-in-up">
        <Link
          href="/"
          className="inline-block font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-6"
        >
          ← 返回首頁 / Back Home
        </Link>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gradient-amber leading-tight mb-4">
          💬 調酒術語辭典
        </h1>
        <p className="font-mono text-sm md:text-base text-text-secondary max-w-2xl mx-auto mb-2">
          Cocktail Glossary
        </p>
        <p className="text-text-secondary text-sm max-w-2xl mx-auto">
          從 ABV 到 Zest——收錄 100+ 調酒專業術語的完整中英日對照辭典
        </p>
        <div className="divider-amber mt-8 mb-2" />
      </section>

      {/* ── Sticky search + filters ──────────────────────────── */}
      <div className="sticky top-16 z-30 bg-bg-primary/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋術語 — 中文 / English / 日本語 ..."
              className="input-neon w-full pl-10 pr-4 py-3 text-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500 pointer-events-none">
              🔍
            </span>
          </div>

          {/* Category pills + result count */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`
                  font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap
                  ${
                    activeCategory === cat.key
                      ? 'btn-neon-amber'
                      : 'border-charcoal-700 text-charcoal-400 hover:border-neon-amber/50 hover:text-neon-amber'
                  }
                `}
              >
                {cat.icon ? `${cat.icon} ` : ''}{cat.label}
              </button>
            ))}

            <span className="ml-auto font-mono text-xs text-charcoal-500 whitespace-nowrap">
              找到 {filtered.length} 個術語
            </span>
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + list ─────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex gap-4">
        {/* A-Z sidebar (desktop) */}
        {/*
          26 個字母約需 836px；在一般筆電（視窗高 720–900px）中放不下。
          先前沒有限制高度，sticky 讓整條列跟著頁面固定，
          落在畫面外的 R 之後字母因此永遠點不到。
          改為限制在視窗高度內並允許側欄自行捲動。
        */}
        <nav
          className="hidden lg:flex flex-col items-center gap-1 sticky top-44 self-start pt-2
                     max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin overscroll-contain"
          aria-label="字母快速跳段"
        >
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => scrollToLetter(letter)}
              disabled={!activeLetters.has(letter)}
              className={`
                font-mono text-xs w-7 h-7 rounded flex items-center justify-center transition-all duration-150
                ${
                  activeLetters.has(letter)
                    ? 'text-neon-amber hover:bg-neon-amber/10 cursor-pointer'
                    : 'text-charcoal-700 cursor-default'
                }
              `}
              aria-label={`Jump to ${letter}`}
            >
              {letter}
            </button>
          ))}
        </nav>

        {/* Term list */}
        <div ref={listRef} className="flex-1 space-y-10 min-w-0">
          {grouped.length === 0 && (
            <div className="text-center py-20 text-charcoal-500 font-mono text-sm">
              找不到符合的術語 — 試試其他關鍵字？
            </div>
          )}

          {grouped.map(({ letter, terms }) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-44">
              {/* Letter heading */}
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display text-3xl text-gradient-amber">{letter}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-neon-amber/30 to-transparent" />
              </div>

              {/* Cards */}
              <div className="grid gap-3">
                {terms.map((t) => (
                  <div
                    key={t.en}
                    className="glass-card p-4 md:p-5 hover:border-neon-amber/60 transition-all duration-300 group"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                      {/* English name */}
                      <span className="font-display text-lg md:text-xl text-neon-amber group-hover:text-neon-glow-amber transition-all">
                        {t.en}
                      </span>
                      {/* Chinese */}
                      <span className="text-text-warm text-sm md:text-base font-medium">
                        {t.zh}
                      </span>
                      {/* Japanese */}
                      <span className="text-charcoal-400 text-xs md:text-sm font-mono">
                        {t.ja}
                      </span>
                    </div>

                    {/* Category pill */}
                    <span className="inline-block font-mono text-[10px] px-2 py-0.5 rounded-full border border-charcoal-700 text-charcoal-400 mb-2">
                      {categoryIcon(t.category)} {t.category}
                    </span>

                    {/* Definition */}
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {t.definition}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center">
        <p className="font-mono text-xs text-charcoal-600">
          共收錄 {GLOSSARY_TERMS.length} 個調酒術語 · MixMaster 調酒術語辭典
        </p>
      </footer>
    </main>
  );
}
