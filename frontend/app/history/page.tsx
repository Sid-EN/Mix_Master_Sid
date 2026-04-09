'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ───────────────────────── Era Definitions ───────────────────────── */

interface Era {
  id: string;
  label: string;
  icon: string;
  color: string;        // Tailwind text color
  borderColor: string;  // Tailwind border color
  bgColor: string;      // Tailwind bg color (pill / badge)
  glowColor: string;    // CSS box-shadow color
}

const ERAS: Era[] = [
  { id: 'ancient',      label: '遠古時代',   icon: '🏺', color: 'text-stone-400',   borderColor: 'border-stone-500',   bgColor: 'bg-stone-800/60',   glowColor: 'rgba(168,162,158,0.3)' },
  { id: 'medieval',     label: '中世紀',     icon: '⚗️', color: 'text-purple-400',  borderColor: 'border-purple-500',  bgColor: 'bg-purple-900/50',  glowColor: 'rgba(147,51,234,0.3)' },
  { id: 'exploration',  label: '大航海時代', icon: '⛵', color: 'text-teal-400',    borderColor: 'border-teal-500',    bgColor: 'bg-teal-900/50',    glowColor: 'rgba(20,184,166,0.3)' },
  { id: 'birth',        label: '調酒誕生',   icon: '🍸', color: 'text-amber-400',   borderColor: 'border-amber-500',   bgColor: 'bg-amber-900/50',   glowColor: 'rgba(245,166,35,0.35)' },
  { id: 'prohibition',  label: '禁酒令',     icon: '🚫', color: 'text-red-400',     borderColor: 'border-red-500',     bgColor: 'bg-red-900/50',     glowColor: 'rgba(239,68,68,0.3)' },
  { id: 'classic',      label: '經典復興',   icon: '🌴', color: 'text-orange-400',  borderColor: 'border-orange-500',  bgColor: 'bg-orange-900/50',  glowColor: 'rgba(249,115,22,0.3)' },
  { id: 'modern',       label: '現代復興',   icon: '🧪', color: 'text-cyan-400',    borderColor: 'border-cyan-500',    bgColor: 'bg-cyan-900/50',    glowColor: 'rgba(0,255,255,0.3)' },
];

const eraMap = Object.fromEntries(ERAS.map(e => [e.id, e]));

/* ───────────────────────── Timeline Data ───────────────────────── */

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  era: string;
  icon: string;
}

const TIMELINE: TimelineEvent[] = [
  // ── Ancient ──
  { year: '~7000 BC', title: '最早的發酵飲料', description: '中國賈湖遺址出土的陶器中發現了米酒殘留物，證明人類在九千年前就已掌握發酵技術。這是目前已知最古老的酒精飲料證據。', era: 'ancient', icon: '🍶' },
  { year: '~3000 BC', title: '古埃及啤酒與蜂蜜酒 (Mead)', description: '古埃及人將啤酒視為日常飲品，工人以啤酒作為部分薪資。同時期蜂蜜酒 (Mead) 在歐洲與非洲廣泛流行，被譽為「眾神之飲」。', era: 'ancient', icon: '🍯' },
  { year: '~800 BC', title: '古希臘葡萄酒文化興起', description: '古希臘人發展出成熟的葡萄酒文化，將酒與水混合飲用。酒神戴奧尼索斯 (Dionysus) 成為重要信仰，Symposium 飲酒會成為哲學討論的場所。', era: 'ancient', icon: '🏛️' },
  { year: '~100 AD', title: '羅馬帝國傳播葡萄酒', description: '羅馬帝國的擴張將葡萄種植和釀酒技術帶到歐洲各地，從高盧 (法國) 到日耳曼尼亞 (德國)，奠定了歐洲葡萄酒產區的基礎。', era: 'ancient', icon: '🏛️' },

  // ── Medieval ──
  { year: '~800', title: '阿拉伯煉金術士發明蒸餾術 (Distillation)', description: '阿拉伯煉金術士賈比爾·伊本·哈揚完善了蒸餾器 (Alembic) 的設計，使純化酒精成為可能。這項技術後來傳入歐洲，徹底改變了烈酒的歷史。', era: 'medieval', icon: '⚗️' },
  { year: '~1100', title: '歐洲修道院蒸餾草藥烈酒', description: '歐洲修道院的修士們開始利用蒸餾技術製作草藥烈酒，最初作為藥用。Chartreuse 和 Bénédictine 等經典利口酒的前身在此時期萌芽。', era: 'medieval', icon: '⛪' },
  { year: '~1300', title: 'Aqua Vitae（生命之水）概念傳播', description: '蒸餾烈酒以拉丁語 Aqua Vitae（生命之水）命名，在歐洲各地傳播。法語的 Eau-de-vie、蓋爾語的 Uisce Beatha (威士忌原名) 都源於此概念。', era: 'medieval', icon: '💧' },
  { year: '~1495', title: '蘇格蘭最早的威士忌記錄', description: '蘇格蘭財政部檔案中記載了修士 John Cor 購買麥芽用於蒸餾 Aqua Vitae 的記錄，這是已知最早關於蘇格蘭威士忌生產的文字紀錄。', era: 'medieval', icon: '🥃' },

  // ── Age of Exploration ──
  { year: '1500s', title: '發現龍舌蘭 (Pulque → Tequila)', description: '西班牙殖民者在墨西哥發現原住民飲用由龍舌蘭發酵而成的 Pulque。殖民者運用蒸餾技術製成 Mezcal，最終演化為今日的 Tequila。', era: 'exploration', icon: '🌵' },
  { year: '1600s', title: '加勒比海催生蘭姆酒 (Rum)', description: '加勒比海地區的甘蔗種植園開始將糖蜜副產品蒸餾成蘭姆酒。Rum 迅速成為海盜與英國皇家海軍的標配飲品，也成為三角貿易的重要商品。', era: 'exploration', icon: '🏴‍☠️' },
  { year: '1650s', title: '荷蘭 Genever 問世', description: '荷蘭人開發出以穀物為基底、加入杜松子調味的 Genever，成為現代琴酒 (Gin) 的前身。英國士兵在三十年戰爭中接觸到此酒，稱之為「荷蘭人的勇氣」。', era: 'exploration', icon: '🫒' },
  { year: '1689', title: '英國 Gin Craze 開始', description: '威廉三世登基後對法國白蘭地徵收重稅並放寬蒸餾限制，引發了惡名昭彰的 Gin Craze。廉價琴酒氾濫成災，倫敦幾乎每四戶就有一戶在蒸餾琴酒。', era: 'exploration', icon: '🍸' },

  // ── Birth of Cocktails ──
  { year: '1806', title: '"Cocktail" 一詞首次出現', description: '紐約《The Balance and Columbian Repository》報紙首次定義 Cocktail：「一種由烈酒、糖、水和苦精 (Bitters) 組成的刺激性飲料。」這是調酒歷史的里程碑。', era: 'birth', icon: '📰' },
  { year: '1830s', title: '調酒師 Jerry Thomas 開始執業', description: '被譽為「調酒之父」的 Jerry Thomas 開始在美國各地酒吧執業。他以華麗的調酒表演和創新配方聞名，將調酒師提升為受人尊敬的專業職業。', era: 'birth', icon: '🎩' },
  { year: '1862', title: '《How to Mix Drinks》出版', description: 'Jerry Thomas 出版了《How to Mix Drinks; or, The Bon Vivant\'s Companion》，這是史上第一本調酒配方書，收錄了包括 Blue Blazer 在內的經典配方，被譽為調酒界的聖經。', era: 'birth', icon: '📖' },
  { year: '1870s', title: 'Dry Martini 原型出現', description: 'Martini 的原型開始出現，最初可能源自舊金山的 Martinez 或紐約的 Knickerbocker Hotel。早期版本使用甜苦艾酒，逐漸演變為今日以不甜苦艾酒為主的 Dry Martini。', era: 'birth', icon: '🍸' },
  { year: '1880s', title: 'Manhattan 調酒誕生', description: '傳說 Manhattan 誕生於紐約曼哈頓俱樂部的一場宴會，由威士忌、甜苦艾酒和苦精調製而成。它與 Martini 並列為最具影響力的經典調酒之一。', era: 'birth', icon: '🗽' },
  { year: '1888', title: '第一台商用製冰機改變調酒', description: '商用製冰機的發明讓冰塊不再是奢侈品。調酒師終於能夠穩定取得大量冰塊，搖盪 (Shaking) 和攪拌 (Stirring) 技法從此成為調酒的標準程序。', era: 'birth', icon: '🧊' },

  // ── Prohibition ──
  { year: '1920', title: '美國禁酒令 (Prohibition) 實施', description: '美國憲法第十八修正案正式生效，全面禁止酒精飲料的製造、運輸和銷售。這項法律持續了 13 年，卻意外地催生了豐富的地下酒吧文化。', era: 'prohibition', icon: '⚖️' },
  { year: '1920s', title: 'Speakeasy 地下酒吧文化興起', description: '禁酒令催生了數以萬計的 Speakeasy（地下酒吧），顧客需要暗語才能進入。這些祕密場所反而讓調酒文化更加精緻化，爵士樂與雞尾酒在此交融。', era: 'prohibition', icon: '🚪' },
  { year: '1920s', title: '美國調酒師流亡歐洲', description: '禁酒令迫使大量美國調酒師流亡歐洲，他們在巴黎、倫敦和哈瓦那的頂級酒吧執業，將美式調酒技術帶到歐洲，促成了國際調酒文化的融合。', era: 'prohibition', icon: '🚢' },
  { year: '1933', title: '禁酒令廢除，調酒文化重生', description: '美國憲法第二十一修正案廢除了禁酒令。羅斯福總統據說在簽署當天說：「我想這是喝一杯的好時機。」調酒產業開始漫長的復甦之路。', era: 'prohibition', icon: '🎉' },

  // ── Classic Revival ──
  { year: '1934', title: '《The Official Mixer\'s Manual》出版', description: '禁酒令廢除後，Patrick Gavin Duffy 出版了《The Official Mixer\'s Manual》，系統性地整理了數百種調酒配方，幫助新一代調酒師重建失落的調酒知識。', era: 'classic', icon: '📚' },
  { year: '1940s', title: 'Tiki 文化興起', description: 'Don the Beachcomber 和 Trader Vic 開創了 Tiki 文化，以熱帶風情裝飾和複雜的蘭姆酒調酒著稱。Mai Tai、Zombie 等經典 Tiki 調酒在此時期誕生，風靡全美。', era: 'classic', icon: '🌺' },
  { year: '1950s', title: 'James Bond 與 Vodka Martini', description: 'Ian Fleming 的小說讓 James Bond 的名言 "Shaken, not Stirred" 深入人心，推動 Vodka Martini 成為時尚與優雅的象徵，也讓伏特加在全球銷量大增。', era: 'classic', icon: '🕵️' },
  { year: '1970s', title: '調酒進入低潮期', description: '速食文化影響了調酒界，預調雞尾酒 (Pre-mixed Cocktails) 和劣質烈酒充斥市場。調酒的工藝精神幾乎消失，酸甜混合物 (Sour Mix) 取代了新鮮果汁。', era: 'classic', icon: '📉' },
  { year: '1980s', title: '花式調酒 (Flair Bartending) 興起', description: '受電影《乞乞乞乞》(Cocktail, 1988) 啟發，花式調酒表演風靡一時。調酒師拋擲酒瓶的華麗動作吸引了大眾目光，但也引發了關於「技術 vs 表演」的爭論。', era: 'classic', icon: '🤹' },

  // ── Modern ──
  { year: '1990s', title: 'Dale DeGroff 引領經典調酒復興', description: '被譽為「King Cocktail」的 Dale DeGroff 在紐約 Rainbow Room 重新引入新鮮果汁和經典配方，開啟了經典調酒的復興運動，影響了整整一代調酒師。', era: 'modern', icon: '👑' },
  { year: '2000s', title: '分子調酒 (Molecular Mixology) 誕生', description: '受分子料理啟發，調酒師開始運用球化 (Spherification)、泡沫 (Foam)、煙燻等科學技法創作前衛調酒。調酒從單純的飲品進化為多感官體驗。', era: 'modern', icon: '🔬' },
  { year: '2004', title: 'Milk & Honey 開設', description: 'Sasha Petraske 在紐約開設了傳奇酒吧 Milk & Honey，以禁酒令時代的 Speakeasy 風格為靈感。無菜單、預約制、嚴格酒吧禮儀，重新定義了現代雞尾酒吧的標準。', era: 'modern', icon: '🥛' },
  { year: '2010s', title: '手工調酒 (Craft Cocktail) 全球運動', description: '手工調酒運動從紐約、倫敦、東京擴展至全球。調酒師開始自製糖漿、浸漬烈酒、手切冰塊，追求每一杯調酒的完美品質與獨特風味。', era: 'modern', icon: '✨' },
  { year: '2015+', title: '低酒精/無酒精趨勢興起', description: 'Low-ABV 和 Mocktail 運動興起，反映了健康意識的提升。Seedlip 等無酒精烈酒品牌問世，讓不飲酒的人也能享受精緻調酒的樂趣。', era: 'modern', icon: '🌿' },
  { year: '2020s', title: 'AI 與永續調酒成為主流', description: 'AI 輔助配方設計讓調酒創新加速，永續調酒 (Sustainable Cocktails) 理念推動零浪費吧台運動。從果皮到根莖，每一部分食材都被創意運用。', era: 'modern', icon: '🤖' },
];

/* ───────────────────────── Component ───────────────────────── */

export default function HistoryPage() {
  const [activeEra, setActiveEra] = useState<string | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* Intersection Observer for fade-in */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute('data-idx'));
          if (entry.isIntersecting) {
            setVisibleIds((prev) => {
              const next = new Set(prev);
              next.add(idx);
              return next;
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToEra = useCallback((eraId: string) => {
    setActiveEra(eraId);
    const el = sectionRefs.current[eraId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  /* Group events by era to render dividers */
  let globalIndex = 0;
  const groupedByEra: { era: Era; events: { event: TimelineEvent; globalIdx: number }[] }[] = [];
  let lastEraId = '';

  TIMELINE.forEach((ev) => {
    if (ev.era !== lastEraId) {
      groupedByEra.push({ era: eraMap[ev.era], events: [] });
      lastEraId = ev.era;
    }
    groupedByEra[groupedByEra.length - 1].events.push({ event: ev, globalIdx: globalIndex });
    globalIndex++;
  });

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-10 max-w-5xl mx-auto text-center">
        <a
          href="/"
          className="absolute left-6 top-6 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors"
        >
          ← 返回首頁
        </a>

        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-4 animate-fade-in">
          Cocktail History
        </p>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gradient-amber leading-tight mb-3 animate-fade-in">
          📜 調酒歷史時間軸
        </h1>
        <p className="font-display text-lg md:text-xl text-text-warm mb-2">
          Cocktail History Timeline
        </p>
        <p className="text-text-secondary max-w-2xl mx-auto text-sm md:text-base">
          從遠古發酵到現代分子調酒，探索數千年的飲酒文明
        </p>
      </section>

      {/* ── Era Filter Buttons ─────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-charcoal-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap justify-center gap-2">
          {ERAS.map((era) => (
            <button
              key={era.id}
              onClick={() => scrollToEra(era.id)}
              className={`
                font-mono text-xs px-3 py-1.5 rounded-full border transition-all duration-200
                ${
                  activeEra === era.id
                    ? `${era.bgColor} ${era.borderColor} ${era.color}`
                    : 'border-charcoal-700 text-charcoal-500 hover:text-text-warm hover:border-charcoal-500'
                }
              `}
            >
              {era.icon} {era.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Timeline ───────────────────────────────────────── */}
      <section className="relative max-w-5xl mx-auto px-4 md:px-6 pt-10 pb-24">
        {/* Vertical center line */}
        <div
          className="absolute top-0 bottom-0 left-6 md:left-1/2 w-px"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(245,166,35,0.5) 5%, rgba(245,166,35,0.25) 95%, transparent)',
            boxShadow: '0 0 8px rgba(245,166,35,0.15)',
          }}
        />

        {groupedByEra.map((group) => {
          const era = group.era;
          return (
            <div key={era.id}>
              {/* Era Divider */}
              <div
                ref={(el) => { sectionRefs.current[era.id] = el; }}
                className="relative flex items-center gap-4 my-12 scroll-mt-20"
              >
                {/* line connector dot — left on mobile, center on desktop */}
                <div
                  className={`absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${era.borderColor} ${era.bgColor}`}
                  style={{ boxShadow: `0 0 10px ${era.glowColor}` }}
                />

                {/* era header — pushed right of the line on mobile, centered on desktop */}
                <div className="ml-14 md:ml-0 md:mx-auto flex items-center gap-3 px-5 py-2.5 rounded-full border border-charcoal-700 bg-bg-secondary/90 backdrop-blur-sm">
                  <span className="text-2xl">{era.icon}</span>
                  <span className={`font-display text-lg md:text-xl ${era.color}`}>
                    {era.label}
                  </span>
                </div>
              </div>

              {/* Events */}
              {group.events.map(({ event, globalIdx }) => {
                const isLeft = globalIdx % 2 === 0;
                const visible = visibleIds.has(globalIdx);

                return (
                  <div
                    key={globalIdx}
                    data-idx={globalIdx}
                    ref={(el) => { cardRefs.current[globalIdx] = el; }}
                    className={`
                      relative flex items-start mb-10 transition-all duration-700 ease-out
                      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                    `}
                  >
                    {/* ── Desktop: alternating layout ── */}
                    {/* Left card (even) */}
                    <div
                      className={`
                        hidden md:block w-[calc(50%-2rem)]
                        ${isLeft ? '' : 'invisible'}
                      `}
                    >
                      {isLeft && (
                        <EventCard event={event} era={era} align="right" />
                      )}
                    </div>

                    {/* Center dot */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 mt-5 z-10">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${era.borderColor}`}
                        style={{
                          background: 'var(--color-bg-primary)',
                          boxShadow: `0 0 6px ${era.glowColor}`,
                        }}
                      />
                    </div>

                    {/* Right card (odd) */}
                    <div
                      className={`
                        hidden md:block w-[calc(50%-2rem)] ml-auto
                        ${isLeft ? 'invisible' : ''}
                      `}
                    >
                      {!isLeft && (
                        <EventCard event={event} era={era} align="left" />
                      )}
                    </div>

                    {/* ── Mobile: always right ── */}
                    <div className="md:hidden ml-14 flex-1">
                      <EventCard event={event} era={era} align="left" />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Timeline end cap */}
        <div className="relative flex justify-start md:justify-center mt-4">
          <div
            className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-neon-amber"
            style={{ boxShadow: '0 0 12px rgba(245,166,35,0.5)' }}
          />
          <p className="ml-14 md:ml-0 font-mono text-xs text-charcoal-500 tracking-widest uppercase mt-6">
            歷史持續書寫中…
          </p>
        </div>
      </section>
    </main>
  );
}

/* ───────────────────────── EventCard ───────────────────────── */

function EventCard({
  event,
  era,
  align,
}: {
  event: TimelineEvent;
  era: Era;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`
        glass-card p-5 md:p-6 group hover:border-opacity-80 transition-all duration-300
        ${align === 'right' ? 'text-right' : 'text-left'}
      `}
      style={{
        borderColor: 'var(--color-charcoal-700)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '';
        e.currentTarget.classList.add(era.borderColor);
        e.currentTarget.style.boxShadow = `0 0 20px ${era.glowColor}, inset 0 0 20px ${era.glowColor.replace(/[\d.]+\)$/, '0.05)')}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.classList.remove(era.borderColor);
        e.currentTarget.style.borderColor = 'var(--color-charcoal-700)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Year badge */}
      <div className={`flex items-center gap-2 mb-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <span className="text-2xl">{event.icon}</span>
        <span className={`font-mono text-lg md:text-xl font-bold ${era.color}`}>
          {event.year}
        </span>
      </div>

      {/* Era pill */}
      <div className={`mb-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>
        <span
          className={`inline-block font-mono text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${era.borderColor} ${era.bgColor} ${era.color}`}
        >
          {era.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-base md:text-lg text-text-warm mb-2 leading-snug group-hover:text-neon-amber transition-colors duration-300">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
        {event.description}
      </p>
    </div>
  );
}
