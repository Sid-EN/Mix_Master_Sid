export interface Region {
  id: string;
  nameZh: string;
  nameEn: string;
  country: string;
  countryZh: string;
  coordinates: { x: number; y: number };
  icon: string;
  specialties: {
    type: 'spirit' | 'wine' | 'both';
    products: {
      nameZh: string;
      nameEn: string;
      description: string;
      characteristics: string[];
      famousExamples: string[];
    }[];
  };
  climate: string;
  terroir: string;
  funFact: string;
}

export const regions: Region[] = [
  {
    id: 'scotland',
    nameZh: '蘇格蘭',
    nameEn: 'Scotland',
    country: '🇬🇧',
    countryZh: '英國',
    coordinates: { x: 44.5, y: 22 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '蘇格蘭威士忌',
          nameEn: 'Scotch Whisky',
          description:
            '蘇格蘭威士忌是世界上最受推崇的烈酒之一，依法必須在蘇格蘭蒸餾並陳釀至少三年。主要產區包括高地（Highland）、斯佩塞（Speyside）和艾雷島（Islay），每個產區都有獨特的風味特徵。斯佩塞以花果香甜聞名，艾雷島則以強烈的泥煤煙燻風味著稱。',
          characteristics: ['泥煤煙燻', '麥芽甜', '果香', '橡木桶陳釀', '複雜層次'],
          famousExamples: ['Macallan', 'Glenfiddich', 'Lagavulin', 'Laphroaig', 'Talisker'],
        },
      ],
    },
    climate: '溫帶海洋性氣候，濕潤多雨，冬季溫和夏季涼爽',
    terroir: '泥煤沼澤地豐富，純淨的高地泉水，海風帶來獨特的鹹味與碘味。蘇格蘭的風土賦予威士忌不可複製的地域特色。',
    funFact: '蘇格蘭約有130間運作中的威士忌蒸餾廠，每秒鐘出口約44瓶蘇格蘭威士忌到世界各地！',
  },
  {
    id: 'ireland',
    nameZh: '愛爾蘭',
    nameEn: 'Ireland',
    country: '🇮🇪',
    countryZh: '愛爾蘭',
    coordinates: { x: 42.5, y: 24 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '愛爾蘭威士忌',
          nameEn: 'Irish Whiskey',
          description:
            '愛爾蘭威士忌通常經過三次蒸餾，口感比蘇格蘭威士忌更為柔順滑順。傳統上不使用泥煤烘乾麥芽，因此風味更加清新甜美。近年來愛爾蘭威士忌復興蓬勃，新蒸餾廠如雨後春筍般出現。',
          characteristics: ['三次蒸餾', '柔順', '蜂蜜甜', '香草', '清新果香'],
          famousExamples: ['Jameson', 'Bushmills', 'Redbreast', 'Green Spot', 'Tullamore D.E.W.'],
        },
      ],
    },
    climate: '溫帶海洋性氣候，全年溫和多雨，非常適合威士忌長期陳釀',
    terroir: '柔軟的泉水、肥沃的大麥產區，以及濕潤溫和的氣候，造就了愛爾蘭威士忌獨有的柔滑口感。',
    funFact: '愛爾蘭人聲稱他們才是威士忌的真正發明者，比蘇格蘭早了數百年！"Whiskey"這個詞就來自愛爾蘭語"uisce beatha"（生命之水）。',
  },
  {
    id: 'kentucky',
    nameZh: '肯塔基／田納西',
    nameEn: 'Kentucky / Tennessee',
    country: '🇺🇸',
    countryZh: '美國',
    coordinates: { x: 22, y: 33 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '波本威士忌',
          nameEn: 'Bourbon Whiskey',
          description:
            '波本威士忌是美國最具代表性的烈酒，必須使用至少51%的玉米為原料，並在全新燒烤的美國白橡木桶中陳釀。肯塔基州出產全美95%以上的波本威士忌。其特有的焦糖、香草和辛香風味深受全球酒友喜愛。',
          characteristics: ['焦糖香草', '玉米甜', '辛香', '全新橡木桶', '琥珀色澤'],
          famousExamples: ['Maker\'s Mark', 'Woodford Reserve', 'Wild Turkey', 'Buffalo Trace', 'Four Roses'],
        },
        {
          nameZh: '田納西威士忌',
          nameEn: 'Tennessee Whiskey',
          description:
            '田納西威士忌與波本類似，但多了一道「林肯郡過程」——入桶前先經過楓木炭過濾，使酒液更加柔順圓潤。這道獨特的工序是田納西威士忌最重要的特徵。',
          characteristics: ['楓木炭過濾', '柔順', '微甜', '焦糖', '輕微煙燻'],
          famousExamples: ['Jack Daniel\'s', 'George Dickel', 'Nelson\'s Green Brier'],
        },
      ],
    },
    climate: '副熱帶濕潤氣候，四季分明，夏季炎熱冬季寒冷，溫差大有助於桶中熟成',
    terroir: '肯塔基州的石灰岩地層過濾出富含礦物質的純淨泉水，為波本提供了完美的釀造水源。豐沛的玉米產量也是重要因素。',
    funFact: '波本威士忌的陳釀倉庫中，每年約有2%的酒液蒸發消失，這被浪漫地稱為「天使的分享」（Angel\'s Share）！',
  },
  {
    id: 'bordeaux',
    nameZh: '波爾多',
    nameEn: 'Bordeaux',
    country: '🇫🇷',
    countryZh: '法國',
    coordinates: { x: 44, y: 31 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '波爾多紅酒',
          nameEn: 'Bordeaux Red Blend',
          description:
            '波爾多是世界葡萄酒之都，以卡本內蘇維濃與梅洛的經典混釀聞名。左岸以卡本內蘇維濃為主，結構強勁；右岸以梅洛為主，口感圓潤柔順。波爾多分級制度始於1855年，至今仍是葡萄酒世界最重要的品質標準之一。',
          characteristics: ['黑醋栗', '雪松', '菸草', '結構感', '陳年潛力'],
          famousExamples: ['Château Lafite Rothschild', 'Château Margaux', 'Château Pétrus', 'Château Mouton Rothschild'],
        },
        {
          nameZh: '索甸貴腐甜酒',
          nameEn: 'Sauternes',
          description:
            '索甸是世界頂級貴腐甜酒產區，貴腐菌（Botrytis）使葡萄濃縮糖分，釀出金黃色的蜂蜜甜酒。每株葡萄藤僅能產出約一杯酒液，極其珍貴。',
          characteristics: ['蜂蜜', '杏桃', '貴腐', '金黃色', '極度濃郁'],
          famousExamples: ['Château d\'Yquem', 'Château Suduiraut', 'Château Climens'],
        },
      ],
    },
    climate: '溫帶海洋性氣候，受大西洋暖流影響，溫和且陽光充足',
    terroir: '礫石、黏土與石灰岩的多樣土壤結構，加龍河與多爾多涅河交匯帶來獨特的微氣候，使不同村莊的酒款風格各異。',
    funFact: '波爾多產區面積超過11萬公頃，是世界上最大的優質葡萄酒產區，每年生產約7億瓶葡萄酒！',
  },
  {
    id: 'burgundy',
    nameZh: '勃根地',
    nameEn: 'Burgundy',
    country: '🇫🇷',
    countryZh: '法國',
    coordinates: { x: 46.5, y: 29 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '勃根地黑皮諾',
          nameEn: 'Burgundy Pinot Noir',
          description:
            '勃根地是黑皮諾的聖地，這裡的風土概念（terroir）影響了全世界的葡萄酒文化。每一塊田都有獨特的土壤和微氣候，即使相鄰的葡萄園也能釀出截然不同的酒款。特級園（Grand Cru）的酒款更是藏家的夢想。',
          characteristics: ['紅色漿果', '紫羅蘭', '泥土氣息', '優雅細膩', '礦物感'],
          famousExamples: ['Romanée-Conti', 'Chambertin', 'Musigny', 'Clos de Vougeot'],
        },
        {
          nameZh: '勃根地夏多內',
          nameEn: 'Burgundy Chardonnay',
          description:
            '勃根地的夏多內被譽為世界最優雅的白酒。從夏布利（Chablis）的清脆礦感，到梅索（Meursault）的豐腴奶油質地，展現了夏多內品種無限的可能性。',
          characteristics: ['奶油', '榛果', '礦物', '檸檬', '細膩酸度'],
          famousExamples: ['Montrachet', 'Meursault', 'Corton-Charlemagne', 'Chablis Grand Cru'],
        },
      ],
    },
    climate: '半大陸性氣候，冬季寒冷夏季溫暖，年份差異顯著',
    terroir: '石灰岩與泥灰岩的土壤，坡度與朝向的細微差異造就了數百個獨特的克里瑪（Climat）。UNESCO已將勃根地的克里瑪列為世界文化遺產。',
    funFact: '勃根地最知名的酒莊羅曼尼康帝（Romanée-Conti），其葡萄園面積僅1.81公頃，每年產量約6000瓶，一瓶拍賣價可超過50萬美元！',
  },
  {
    id: 'champagne',
    nameZh: '香檳',
    nameEn: 'Champagne',
    country: '🇫🇷',
    countryZh: '法國',
    coordinates: { x: 46, y: 27 },
    icon: '🥂',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '香檳',
          nameEn: 'Champagne',
          description:
            '香檳是全世界最知名的氣泡酒，只有在法國香檳區以傳統瓶中二次發酵法（Méthode Champenoise）釀造的才能稱為香檳。主要使用黑皮諾、夏多內和皮諾莫尼耶三個品種。香檳象徵慶祝與奢華，是全球最具辨識度的葡萄酒類型。',
          characteristics: ['細緻氣泡', '酵母麵包', '青蘋果', '礦物', '優雅酸度'],
          famousExamples: ['Dom Pérignon', 'Krug', 'Bollinger', 'Veuve Clicquot', 'Moët & Chandon'],
        },
      ],
    },
    climate: '涼爽的大陸性氣候，是法國最北的葡萄酒產區，高酸度有利於氣泡酒的釀造',
    terroir: '白堊土壤是香檳區最重要的風土元素，它能保持水分並反射陽光，幫助葡萄在寒冷的氣候中成熟。地下白堊岩洞窖也提供了完美的陳年環境。',
    funFact: '一瓶香檳中約有4900萬個氣泡！香檳瓶內的壓力約為6個大氣壓，是汽車輪胎壓力的三倍。',
  },
  {
    id: 'cognac',
    nameZh: '干邑',
    nameEn: 'Cognac',
    country: '🇫🇷',
    countryZh: '法國',
    coordinates: { x: 43, y: 30 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '干邑白蘭地',
          nameEn: 'Cognac',
          description:
            '干邑是世界上最精緻的白蘭地，產自法國西南部干邑地區。使用銅製壺式蒸餾器進行兩次蒸餾，並在法國橡木桶中長期陳釀。依陳年時間分為VS、VSOP和XO等級。大香檳區（Grande Champagne）被視為最優質的干邑產區。',
          characteristics: ['花香果香', '蜂蜜', '橡木', '香草', '悠長餘韻'],
          famousExamples: ['Hennessy', 'Rémy Martin', 'Martell', 'Courvoisier', 'Hine'],
        },
      ],
    },
    climate: '溫帶海洋性氣候，受大西洋影響，溫和濕潤',
    terroir: '白堊質土壤是干邑品質的關鍵。大小香檳區的石灰岩土壤賦予干邑最為細膩優雅的風味，而其他產區則帶來不同的風格特色。',
    funFact: '干邑的「天使分享」特別顯著——陳年倉庫周圍牆壁上生長的黑色黴菌（Baudoinia compniacensis）就是靠蒸發的酒精維生！',
  },
  {
    id: 'piedmont',
    nameZh: '皮埃蒙特',
    nameEn: 'Piedmont',
    country: '🇮🇹',
    countryZh: '義大利',
    coordinates: { x: 48, y: 31 },
    icon: '🍷',
    specialties: {
      type: 'both',
      products: [
        {
          nameZh: '巴羅洛 / 巴巴萊斯科',
          nameEn: 'Barolo / Barbaresco',
          description:
            '巴羅洛被譽為「義大利酒王」，以內比歐露（Nebbiolo）葡萄釀造，需要長時間陳年才能展現其複雜的風味。巴巴萊斯科則被稱為巴羅洛的「優雅妹妹」，風格更加柔和細膩。兩者都是世界頂級紅酒的代表。',
          characteristics: ['玫瑰花瓣', '焦油', '櫻桃', '高單寧', '極佳陳年潛力'],
          famousExamples: ['Giacomo Conterno', 'Bruno Giacosa', 'Gaja', 'Vietti', 'Produttori del Barbaresco'],
        },
        {
          nameZh: '阿瑪羅苦酒',
          nameEn: 'Amaro',
          description:
            '阿瑪羅是義大利傳統的草本苦味利口酒，通常在餐後飲用幫助消化。皮埃蒙特地區出產許多經典的阿瑪羅品牌，以數十種草本、根莖和香料調配而成。',
          characteristics: ['草本苦味', '焦糖', '柑橘', '藥草', '餐後酒'],
          famousExamples: ['Fernet-Branca', 'Averna', 'Montenegro', 'Braulio'],
        },
      ],
    },
    climate: '大陸性氣候，秋季多霧，日夜溫差大有利於葡萄成熟',
    terroir: '朗格（Langhe）丘陵地帶的泥灰質石灰岩土壤，搭配獨特的微氣候和海拔差異，造就了不同村莊各具特色的巴羅洛風格。',
    funFact: '巴羅洛曾是義大利薩伏依王室的御用酒，因此獲得了「酒中之王，王者之酒」的美譽。採收內比歐露葡萄時常常瀰漫著秋天的大霧！',
  },
  {
    id: 'tuscany',
    nameZh: '托斯卡尼',
    nameEn: 'Tuscany',
    country: '🇮🇹',
    countryZh: '義大利',
    coordinates: { x: 49, y: 32 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '奇揚第 / 布魯內洛',
          nameEn: 'Chianti / Brunello di Montalcino',
          description:
            '托斯卡尼是義大利最著名的葡萄酒產區，以桑嬌維塞（Sangiovese）葡萄品種為核心。經典奇揚第（Chianti Classico）展現了優雅的酸度和櫻桃風味，而布魯內洛則以更濃郁、更具陳年潛力的風格著稱。超級托斯卡尼（Super Tuscan）則是打破傳統、融合國際品種的創新之作。',
          characteristics: ['酸櫻桃', '紫羅蘭', '皮革', '香料', '活潑酸度'],
          famousExamples: ['Sassicaia', 'Tignanello', 'Biondi-Santi', 'Antinori', 'Ornellaia'],
        },
      ],
    },
    climate: '地中海型氣候，溫暖乾燥的夏季，陽光充足',
    terroir: '多樣的土壤類型包括石灰岩、砂岩和黏土，加上丘陵地形的坡度與海拔變化，為桑嬌維塞提供了理想的生長環境。',
    funFact: '超級托斯卡尼的誕生源於1970年代的叛逆——釀酒師故意違反傳統規定使用卡本內蘇維濃，結果反而創造了世界級的佳釀！',
  },
  {
    id: 'jerez',
    nameZh: '赫雷斯',
    nameEn: 'Jerez',
    country: '🇪🇸',
    countryZh: '西班牙',
    coordinates: { x: 42, y: 35 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '雪莉酒',
          nameEn: 'Sherry',
          description:
            '雪莉酒是世界上最被低估的佳釀之一，產自西班牙南部安達盧西亞的赫雷斯三角地帶。從極度乾型的Fino到甜蜜濃郁的Pedro Ximénez，雪莉酒的風格範圍極其寬廣。獨特的索雷拉（Solera）陳年系統確保了每一瓶酒的風格一致性。',
          characteristics: ['杏仁', '酵母花', '海鹽', '堅果', '多樣風格'],
          famousExamples: ['Tio Pepe', 'González Byass', 'Lustau', 'Valdespino', 'Equipo Navazos'],
        },
      ],
    },
    climate: '地中海型氣候，炎熱乾燥的夏季，大西洋海風帶來涼爽的影響',
    terroir: '白色的阿爾巴利薩（Albariza）石灰岩土壤能反射陽光並保存水分，是帕洛米諾（Palomino）葡萄最理想的生長條件。',
    funFact: '雪莉酒的索雷拉系統中，最老的酒桶可能包含百年以上的酒液。理論上，你喝到的每一杯Fino都含有最初裝桶的微量酒液！',
  },
  {
    id: 'rioja',
    nameZh: '里奧哈',
    nameEn: 'Rioja',
    country: '🇪🇸',
    countryZh: '西班牙',
    coordinates: { x: 43.5, y: 33 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '里奧哈紅酒',
          nameEn: 'Rioja',
          description:
            '里奧哈是西班牙最知名的葡萄酒產區，以田帕尼優（Tempranillo）葡萄為主要品種。傳統風格在美國橡木桶中長期陳釀，帶有香草和椰子的甜美風味。近年來也發展出更現代、更注重果味表現的風格。',
          characteristics: ['香草', '紅色漿果', '皮革', '椰子', '美國橡木'],
          famousExamples: ['López de Heredia', 'La Rioja Alta', 'Muga', 'CVNE', 'Marqués de Riscal'],
        },
      ],
    },
    climate: '大陸性氣候與大西洋氣候的過渡帶，適度的溫差',
    terroir: '厄布洛河（Ebro）河谷的階地土壤，富含石灰質黏土和沖積礫石，北面的坎塔布里亞山脈阻擋了大西洋的冷雨。',
    funFact: '里奧哈的陳年分級系統非常嚴格：Crianza至少陳釀2年、Reserva至少3年、Gran Reserva至少5年，其中部分時間必須在橡木桶中度過。',
  },
  {
    id: 'douro',
    nameZh: '杜羅河谷',
    nameEn: 'Douro Valley',
    country: '🇵🇹',
    countryZh: '葡萄牙',
    coordinates: { x: 41.5, y: 33 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '波特酒',
          nameEn: 'Port Wine',
          description:
            '波特酒是世界上最偉大的加烈甜酒，產自葡萄牙杜羅河谷陡峭的梯田葡萄園。在發酵過程中加入白蘭地來終止發酵，保留天然葡萄糖分。年份波特（Vintage Port）可陳年數十年甚至上百年，是酒藏中的珍品。',
          characteristics: ['黑莓', '巧克力', '香料', '甜美', '高酒精度'],
          famousExamples: ['Taylor\'s', 'Graham\'s', 'Quinta do Noval', 'Dow\'s', 'Fonseca'],
        },
      ],
    },
    climate: '大陸性氣候，夏季極度炎熱乾燥，冬季寒冷',
    terroir: '片岩（Schist）土壤是杜羅河谷的靈魂，葡萄根必須深入岩層才能獲取水分。陡峭的梯田葡萄園是UNESCO世界文化遺產。',
    funFact: '杜羅河谷是世界上最古老的法定葡萄酒產區，早在1756年就由葡萄牙首相龐巴爾侯爵劃定了產區界線！',
  },
  {
    id: 'jalisco',
    nameZh: '哈利斯科',
    nameEn: 'Jalisco',
    country: '🇲🇽',
    countryZh: '墨西哥',
    coordinates: { x: 15, y: 40 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '龍舌蘭酒',
          nameEn: 'Tequila',
          description:
            '龍舌蘭酒必須使用藍色韋伯龍舌蘭（Blue Weber Agave）為原料，主要產自墨西哥哈利斯科州。龍舌蘭植物需要生長8-12年才能採收。從清澈的銀色（Blanco）到深色的陳年（Añejo），每種類型都有獨特的風味表現。',
          characteristics: ['龍舌蘭甜', '柑橘', '胡椒', '草本', '礦物感'],
          famousExamples: ['Patrón', 'Don Julio', 'Clase Azul', 'Fortaleza', 'Casa Noble'],
        },
      ],
    },
    climate: '半乾旱氣候，高海拔地區日夜溫差大，火山土壤豐富',
    terroir: '哈利斯科高原和低地的紅色火山土壤與黏土，加上2000公尺以上的海拔高度，影響著龍舌蘭的糖分積累和風味特徵。',
    funFact: '一株藍色龍舌蘭需要大約7-10年才能成熟，而且一生只能採收一次——採收時會砍下數十公斤重的「鳳梨」（piña）來蒸煮發酵！',
  },
  {
    id: 'oaxaca',
    nameZh: '瓦哈卡',
    nameEn: 'Oaxaca',
    country: '🇲🇽',
    countryZh: '墨西哥',
    coordinates: { x: 16, y: 42 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '梅斯卡爾',
          nameEn: 'Mezcal',
          description:
            '梅斯卡爾是龍舌蘭烈酒家族的始祖，可使用超過30種龍舌蘭品種釀造。傳統的地下烤坑烘烤工藝賦予梅斯卡爾獨特的煙燻風味。瓦哈卡州是最大且最知名的梅斯卡爾產區，保留了許多小規模手工蒸餾的傳統。',
          characteristics: ['煙燻', '泥土', '果香', '複雜', '手工蒸餾'],
          famousExamples: ['Del Maguey', 'Montelobos', 'Ilegal', 'Bozal', 'Real Minero'],
        },
      ],
    },
    climate: '多樣的微氣候，從乾燥山谷到潮濕山區，生態多樣性極高',
    terroir: '多種野生龍舌蘭生長在乾燥的山地環境中，不同品種的龍舌蘭結合獨特的地理環境，創造出極為多元的風味表現。',
    funFact: '「梅斯卡爾」一詞來自納瓦特爾語"mexcalli"，意為「火烤的龍舌蘭」。所有龍舌蘭酒都是梅斯卡爾的一種，但並非所有梅斯卡爾都是龍舌蘭酒！',
  },
  {
    id: 'caribbean',
    nameZh: '加勒比海',
    nameEn: 'Caribbean',
    country: '🏝️',
    countryZh: '加勒比海地區',
    coordinates: { x: 23, y: 42 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '蘭姆酒',
          nameEn: 'Rum',
          description:
            '蘭姆酒是以甘蔗汁或糖蜜為原料蒸餾而成的烈酒，加勒比海諸島是其發源地。不同島嶼各有風格：牙買加的濃郁芬芳、巴巴多斯的柔順優雅、古巴的清爽輕盈，馬提尼克的農業蘭姆則以甘蔗汁直接蒸餾，風味獨特。',
          characteristics: ['甘蔗甜', '熱帶水果', '焦糖', '香料', '多元風格'],
          famousExamples: ['Appleton Estate', 'Mount Gay', 'Havana Club', 'Rhum Clément', 'Diplomático'],
        },
      ],
    },
    climate: '熱帶海洋性氣候，全年溫暖，適合甘蔗生長',
    terroir: '火山島嶼的肥沃土壤、充沛的熱帶雨水和陽光，為甘蔗提供了完美的生長環境。不同島嶼的微氣候差異也影響著蘭姆酒的風格。',
    funFact: '英國皇家海軍從1655年開始每天配給水手蘭姆酒，這個傳統一直持續到1970年7月31日——史稱「黑色慟日」（Black Tot Day）！',
  },
  {
    id: 'brazil',
    nameZh: '巴西',
    nameEn: 'Brazil',
    country: '🇧🇷',
    countryZh: '巴西',
    coordinates: { x: 31, y: 56 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '卡夏莎',
          nameEn: 'Cachaça',
          description:
            '卡夏莎是巴西的國酒，以新鮮甘蔗汁蒸餾而成（不同於蘭姆酒的糖蜜）。是經典調酒卡琵莉亞（Caipirinha）的靈魂原料。巴西有超過4萬家蒸餾廠生產卡夏莎，從工業量產到精品手工應有盡有。',
          characteristics: ['甘蔗清新', '草本', '青草', '微甜', '清爽'],
          famousExamples: ['Novo Fogo', 'Leblon', 'Avuá', 'Ypióca', 'Sagatiba'],
        },
      ],
    },
    climate: '熱帶氣候，充沛的雨量和陽光，甘蔗全年生長',
    terroir: '巴西豐沃的紅土和熱帶氣候條件，加上多樣的木材資源用於桶陳（如巴西花梨木、巴爾薩木等），為卡夏莎創造出獨特的風味維度。',
    funFact: '巴西每年消費約20億公升的卡夏莎，但其中只有不到1%出口到國外，其餘全被巴西人自己喝光了！',
  },
  {
    id: 'netherlands',
    nameZh: '荷蘭',
    nameEn: 'Netherlands',
    country: '🇳🇱',
    countryZh: '荷蘭',
    coordinates: { x: 47, y: 25 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '琴內弗',
          nameEn: 'Genever',
          description:
            '琴內弗是現代琴酒的祖先，源自荷蘭與比利時。與倫敦乾琴酒不同，傳統琴內弗以麥芽酒（Moutwijn）為基底，口感更像威士忌與琴酒的混合體。杜松子風味較為柔和，麥芽甜味更加突出。',
          characteristics: ['杜松子', '麥芽甜', '草本', '溫和', '傳統風格'],
          famousExamples: ['Bols Genever', 'De Kuyper', 'Rutte', 'Bobby\'s', 'Ketel One (原為琴內弗家族)'],
        },
      ],
    },
    climate: '溫帶海洋性氣候，冬季濕冷，全年多雨',
    terroir: '低地國家的穀物產區提供了優質的大麥和裸麥原料。阿姆斯特丹和斯奇丹（Schiedam）是歷史上最重要的琴內弗生產中心。',
    funFact: '英語中的"Dutch Courage"（荷蘭式勇氣）一詞，據說源於英國士兵在戰前飲用荷蘭琴內弗來壯膽！',
  },
  {
    id: 'london',
    nameZh: '倫敦',
    nameEn: 'London',
    country: '🇬🇧',
    countryZh: '英國',
    coordinates: { x: 45, y: 26 },
    icon: '🍸',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '倫敦乾琴酒',
          nameEn: 'London Dry Gin',
          description:
            '倫敦乾琴酒是世界上最受歡迎的琴酒風格，以杜松子為主導風味，搭配各種植物素材蒸餾而成。「倫敦乾」其實是一種生產標準而非產地限制，但倫敦仍是琴酒文化的中心。近年來精品琴酒浪潮席捲全球，催生了數百個新品牌。',
          characteristics: ['杜松子', '柑橘皮', '芫荽籽', '乾爽', '植物香氣'],
          famousExamples: ['Beefeater', 'Tanqueray', 'Sipsmith', 'Hendrick\'s', 'The Botanist'],
        },
      ],
    },
    climate: '溫帶海洋性氣候，溫和多雲',
    terroir: '雖然琴酒的生產不像葡萄酒那樣依賴風土，但倫敦的歷史地位、豐富的香料貿易歷史和酒吧文化，使其成為全球琴酒文化的首都。',
    funFact: '18世紀倫敦的「琴酒狂潮」（Gin Craze）時期，估計全城四分之一的住宅都在生產琴酒，街頭到處是醉倒的市民！',
  },
  {
    id: 'japan',
    nameZh: '日本',
    nameEn: 'Japan',
    country: '🇯🇵',
    countryZh: '日本',
    coordinates: { x: 82, y: 33 },
    icon: '🥃',
    specialties: {
      type: 'both',
      products: [
        {
          nameZh: '日本威士忌',
          nameEn: 'Japanese Whisky',
          description:
            '日本威士忌深受蘇格蘭傳統影響，但融入了日本職人的精細工藝與美學追求。日本蒸餾廠通常在單一廠內使用不同類型的蒸餾器和酵母，以創造多樣的原酒風味。近年來日本威士忌在國際比賽中屢獲殊榮，一瓶難求。',
          characteristics: ['精緻', '花香', '水果', '柔和', '平衡'],
          famousExamples: ['山崎 Yamazaki', '響 Hibiki', '余市 Yoichi', '白州 Hakushu', '竹鶴 Taketsuru'],
        },
        {
          nameZh: '清酒',
          nameEn: 'Sake',
          description:
            '日本清酒是以米、水和麴菌釀造的獨特酒類，擁有千年歷史。從清爽的大吟釀到濃醇的純米酒，風味範圍廣泛。精米步合（精米度）是衡量清酒等級的重要指標，磨去越多外層的米，釀出的酒越細膩。',
          characteristics: ['米香', '花果香', '鮮味', '細膩', '多樣溫度飲用'],
          famousExamples: ['獺祭', '久保田', '八海山', '十四代', '而今'],
        },
      ],
    },
    climate: '溫帶至亞熱帶氣候，四季分明，純淨的山泉水資源豐富',
    terroir: '日本多山的地形提供了各種純淨軟水，是威士忌和清酒釀造的關鍵。北海道的寒冷氣候適合威士忌熟成，而各地的米產區則是清酒的根基。',
    funFact: '日本威士忌之父竹鶴政孝於1918年赴蘇格蘭學習威士忌釀造，還娶了蘇格蘭妻子Rita——他們的愛情故事被拍成了NHK晨間劇《阿政》！',
  },
  {
    id: 'russia-poland',
    nameZh: '俄羅斯／波蘭',
    nameEn: 'Russia / Poland',
    country: '🇷🇺🇵🇱',
    countryZh: '俄羅斯／波蘭',
    coordinates: { x: 58, y: 22 },
    icon: '🥃',
    specialties: {
      type: 'spirit',
      products: [
        {
          nameZh: '伏特加',
          nameEn: 'Vodka',
          description:
            '伏特加是世界上產量最大的烈酒，以穀物或馬鈴薯為原料，經多次蒸餾和過濾追求極致純淨。俄羅斯和波蘭都聲稱是伏特加的發源地。波蘭伏特加傳統上保留更多原料風味，而俄羅斯風格則追求極度中性和純淨。',
          characteristics: ['純淨', '柔順', '微甜', '中性', '清爽'],
          famousExamples: ['Belvedere', 'Żubrówka', 'Stolichnaya', 'Russian Standard', 'Chopin'],
        },
      ],
    },
    climate: '大陸性氣候，寒冷的冬季有助於穀物的品質和伏特加的傳統消費文化',
    terroir: '東歐廣大的穀物產區提供了優質的裸麥和小麥原料，波蘭的馬鈴薯產區則是馬鈴薯伏特加的基礎。純淨的水源也是關鍵要素。',
    funFact: '波蘭文獻中最早關於伏特加的記載可追溯到1405年！而在俄羅斯帝國時期，伏特加的稅收曾佔國家收入的三分之一。',
  },
  {
    id: 'napa',
    nameZh: '納帕谷',
    nameEn: 'Napa Valley',
    country: '🇺🇸',
    countryZh: '美國',
    coordinates: { x: 12, y: 34 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '納帕卡本內蘇維濃',
          nameEn: 'Napa Cabernet Sauvignon',
          description:
            '納帕谷是美國最負盛名的葡萄酒產區，以飽滿濃郁的卡本內蘇維濃聞名世界。1976年的「巴黎審判」中，納帕谷的酒款在盲品中擊敗了法國頂級酒莊，震驚了全球葡萄酒界。如今納帕谷的膜拜酒（Cult Wine）價格可與波爾多頂級列級酒莊匹敵。',
          characteristics: ['黑櫻桃', '黑醋栗', '濃郁', '橡木', '飽滿單寧'],
          famousExamples: ['Screaming Eagle', 'Opus One', 'Caymus', 'Stag\'s Leap', 'Silver Oak'],
        },
      ],
    },
    climate: '地中海型氣候，溫暖乾燥的夏季，涼爽的夜晚保持酸度',
    terroir: '從谷底沖積土到山坡火山岩，納帕谷擁有超過30種不同的土壤類型。聖帕布洛灣帶來的涼爽晨霧是天然的溫度調節器。',
    funFact: '1976年的「巴黎審判」中，加州酒擊敗法國名莊的消息傳開後，法國評審一度試圖收回自己的評分，但為時已晚！',
  },
  {
    id: 'chile',
    nameZh: '智利',
    nameEn: 'Chile',
    country: '🇨🇱',
    countryZh: '智利',
    coordinates: { x: 24, y: 66 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '卡乜內爾',
          nameEn: 'Carménère',
          description:
            '卡乜內爾原產於波爾多，在19世紀的根瘤蚜蟲災害中幾乎在歐洲滅絕，卻在智利存活下來。長期被誤認為梅洛，直到1994年才被正式鑑定。如今卡乜內爾已成為智利的招牌品種，帶有獨特的青椒、巧克力和紅色水果風味。',
          characteristics: ['青椒', '巧克力', '紅色莓果', '絲滑', '微辛香'],
          famousExamples: ['Concha y Toro', 'Montes', 'Santa Rita', 'Errázuriz', 'Casa Lapostolle'],
        },
      ],
    },
    climate: '地中海型氣候，安地斯山脈和太平洋的雙重影響帶來涼爽的生長條件',
    terroir: '智利狹長的國土被安地斯山脈和太平洋夾在中間，沙漠、山脈和海洋形成天然屏障，使智利成為世界上少數未受根瘤蚜蟲侵害的產區。',
    funFact: '智利是世界上唯一不需要嫁接砧木的主要葡萄酒生產國，因為根瘤蚜蟲從未抵達過這裡——安地斯山和太平洋是天然的防護牆！',
  },
  {
    id: 'mendoza',
    nameZh: '門多薩',
    nameEn: 'Mendoza',
    country: '🇦🇷',
    countryZh: '阿根廷',
    coordinates: { x: 25, y: 64 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '門多薩馬爾貝克',
          nameEn: 'Mendoza Malbec',
          description:
            '馬爾貝克在法國原本只是配角品種，但在阿根廷門多薩的高海拔葡萄園中找到了完美的家。陽光充足、日夜溫差大的環境使馬爾貝克發展出深濃的色澤和豐富的果味。門多薩的馬爾貝克已成為新世界紅酒的標誌性代表。',
          characteristics: ['紫色調', '黑莓', '李子', '紫羅蘭', '柔和單寧'],
          famousExamples: ['Catena Zapata', 'Achaval-Ferrer', 'Zuccardi', 'Norton', 'Trapiche'],
        },
      ],
    },
    climate: '乾旱半沙漠氣候，靠安地斯山脈融雪灌溉，海拔800-1500公尺',
    terroir: '高海拔是門多薩的最大優勢——海拔越高，紫外線越強，葡萄皮越厚越深色，酒的風味也越濃郁。安地斯山脈的融雪水是唯一的灌溉水源。',
    funFact: '門多薩的烏科谷（Uco Valley）部分葡萄園海拔超過1500公尺，是世界上最高的葡萄酒產區之一，甚至比許多歐洲滑雪場還高！',
  },
  {
    id: 'barossa',
    nameZh: '巴羅莎谷',
    nameEn: 'Barossa Valley',
    country: '🇦🇺',
    countryZh: '澳洲',
    coordinates: { x: 80, y: 68 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '巴羅莎希拉茲',
          nameEn: 'Barossa Shiraz',
          description:
            '巴羅莎谷是澳洲最具標誌性的葡萄酒產區，以濃郁飽滿的希拉茲聞名。這裡保留了一些世界上最古老的希拉茲葡萄藤，部分可追溯到1840年代。巴羅莎希拉茲的風格濃烈豪放，充滿深色水果、巧克力和香料的風味。',
          characteristics: ['黑莓', '巧克力', '黑胡椒', '濃郁', '飽滿酒體'],
          famousExamples: ['Penfolds Grange', 'Henschke Hill of Grace', 'Torbreck', 'Peter Lehmann', 'Two Hands'],
        },
      ],
    },
    climate: '地中海型氣候，溫暖乾燥，陽光充足',
    terroir: '古老的土壤、低產量的老藤葡萄、以及德國移民帶來的釀酒傳統，共同造就了巴羅莎獨特的葡萄酒文化。部分葡萄藤已有170年以上的歷史。',
    funFact: '澳洲奔富酒莊的Grange是南半球最昂貴的葡萄酒，初釀年份1951年一度被酒莊高層認為「太過極端」，差點被放棄！',
  },
  {
    id: 'new-zealand',
    nameZh: '紐西蘭',
    nameEn: 'New Zealand',
    country: '🇳🇿',
    countryZh: '紐西蘭',
    coordinates: { x: 88, y: 72 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '馬爾堡白蘇維濃',
          nameEn: 'Marlborough Sauvignon Blanc',
          description:
            '紐西蘭的馬爾堡產區在短短數十年間，以其獨特的白蘇維濃風格征服了全世界。這裡的白蘇維濃以強烈的百香果、青草和礦物風味著稱，酸度清新爽脆，是夏日最受歡迎的白酒風格之一。',
          characteristics: ['百香果', '青草', '柑橘', '清脆酸度', '礦物感'],
          famousExamples: ['Cloudy Bay', 'Kim Crawford', 'Villa Maria', 'Dog Point', 'Greywacke'],
        },
      ],
    },
    climate: '涼爽的海洋性氣候，日照時間長，夜間溫度低保持高酸度',
    terroir: '河流沖積礫石土壤排水良好，南島的涼爽氣候和強烈的陽光，為白蘇維濃提供了理想的生長條件。',
    funFact: '紐西蘭葡萄酒產業真正起飛只是1980年代的事——Cloudy Bay的第一個年份（1985年）瞬間引爆全球市場，被譽為改變世界白酒版圖的一瓶酒！',
  },
  {
    id: 'stellenbosch',
    nameZh: '斯泰倫博斯',
    nameEn: 'Stellenbosch',
    country: '🇿🇦',
    countryZh: '南非',
    coordinates: { x: 51, y: 70 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '皮諾塔吉',
          nameEn: 'Pinotage',
          description:
            '皮諾塔吉是南非獨有的葡萄品種，由黑皮諾和仙粉黛（Cinsaut）雜交而成，1925年在斯泰倫博斯大學首次培育成功。這個品種在世界其他地方極為罕見，帶有獨特的煙燻、紅色漿果和咖啡風味，是南非葡萄酒最具辨識度的名片。',
          characteristics: ['煙燻', '紅莓', '咖啡', '巧克力', '濃郁果味'],
          famousExamples: ['Kanonkop', 'Beyerskloof', 'Simonsig', 'Warwick', 'Diemersfontein'],
        },
      ],
    },
    climate: '地中海型氣候，受大西洋和印度洋雙重海風影響，溫暖但不炎熱',
    terroir: '古老的花崗岩和砂岩山坡，搭配海拔變化和多方向的坡向，提供了極為多樣的微氣候和土壤條件。',
    funFact: '南非是世界上最古老的新世界葡萄酒產國——1659年就釀造了第一批葡萄酒，比澳洲和美國都早了一百多年！',
  },
  {
    id: 'mosel',
    nameZh: '摩塞爾',
    nameEn: 'Mosel',
    country: '🇩🇪',
    countryZh: '德國',
    coordinates: { x: 47.5, y: 27 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '麗絲玲',
          nameEn: 'Riesling',
          description:
            '摩塞爾是世界上最偉大的麗絲玲產區，以其陡峭的板岩葡萄園和精緻的半甜型白酒聞名。這裡的麗絲玲以低酒精度、高酸度和精細的甜酸平衡著稱，從骨乾型到極甜的冰酒（Eiswein），風格跨度極大。',
          characteristics: ['礦物', '蜜桃', '柑橘', '精緻酸度', '板岩氣息'],
          famousExamples: ['Egon Müller', 'J.J. Prüm', 'Dr. Loosen', 'Fritz Haag', 'Markus Molitor'],
        },
      ],
    },
    climate: '涼爽的大陸性氣候，是世界上最北的優質葡萄酒產區之一',
    terroir: '摩塞爾河蜿蜒曲折的河谷中，朝南的陡峭板岩斜坡（坡度可達65度！）能最大限度地反射和吸收陽光，使麗絲玲在寒冷的氣候中成熟。',
    funFact: '摩塞爾的部分葡萄園如此陡峭，只能靠人工攀爬採收——這些被稱為「英雄葡萄園」的極陡坡地，每公頃的勞動成本是平地的十倍以上！',
  },
  {
    id: 'tokaj',
    nameZh: '托卡伊',
    nameEn: 'Tokaj',
    country: '🇭🇺',
    countryZh: '匈牙利',
    coordinates: { x: 53, y: 28 },
    icon: '🍷',
    specialties: {
      type: 'wine',
      products: [
        {
          nameZh: '托卡伊阿蘇',
          nameEn: 'Tokaji Aszú',
          description:
            '托卡伊阿蘇是世界上最古老的貴腐甜酒，歷史可追溯到1630年代，比索甸還早了兩百年。以弗敏特（Furmint）和哈斯萊維露（Hárslevelű）品種釀造，經貴腐菌濃縮後甜度極高，但優秀的酸度讓酒款不會過於膩口。法王路易十四曾稱其為「酒中之王，王者之酒」。',
          characteristics: ['杏桃', '柑橘皮', '蜂蜜', '高酸度', '極長餘韻'],
          famousExamples: ['Royal Tokaji', 'Disznókő', 'Oremus', 'István Szepsy', 'Tokaj-Hétszőlő'],
        },
      ],
    },
    climate: '大陸性氣候，秋季溫暖多霧的早晨為貴腐菌的滋生提供了完美條件',
    terroir: '托卡伊的火山土壤富含礦物質，博德羅格河（Bodrog）和蒂薩河（Tisza）交匯帶來的秋季薄霧，是貴腐菌形成的關鍵自然條件。',
    funFact: '托卡伊阿蘇的甜度用「簍數」（Puttonyos）衡量——傳統上指加入多少簍貴腐葡萄漿，從3到6簍不等，數字越高越甜越珍貴！',
  },
];
