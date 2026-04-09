'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/* ─── Mood / Scenario Data ─────────────────────────────────────── */

interface MoodScenario {
  id: string;
  emoji: string;
  nameZh: string;
  nameEn: string;
  gradient: string;
  glowColor: string;
  description: string;
  keywords: string[];
  recommendedStyles: string;
  musicSuggestion: string;
  tips: string;
}

const MOODS: MoodScenario[] = [
  {
    id: 'romantic-date',
    emoji: '🌹',
    nameZh: '浪漫約會',
    nameEn: 'Romantic Date',
    gradient: 'from-rose-900/60 via-pink-800/40 to-fuchsia-900/30',
    glowColor: 'rgba(244,114,182,0.4)',
    description: '燈光昏暗、氣氛曖昧的夜晚，需要優雅且令人印象深刻的調酒',
    keywords: ['elegant', 'floral', 'sparkling', 'light', 'romantic', 'champagne', 'rose', 'coupe', 'prosecco'],
    recommendedStyles: '香檳調酒、花香系、輕盈且視覺美麗的呈現',
    musicSuggestion: 'Jazz, Bossa Nova',
    tips: '選用漂亮的 Coupe 杯，加上可食用花瓣或玫瑰花瓣裝飾，調製時動作優雅從容',
  },
  {
    id: 'party-time',
    emoji: '🎉',
    nameZh: '派對狂歡',
    nameEn: 'Party Time',
    gradient: 'from-purple-900/60 via-fuchsia-800/40 to-pink-900/30',
    glowColor: 'rgba(168,85,247,0.4)',
    description: '人多熱鬧、需要大量又好喝、容易準備的調酒',
    keywords: ['fun', 'tropical', 'batch', 'easy', 'colorful', 'punch', 'tiki', 'party', 'fruity'],
    recommendedStyles: '批量調酒、Punch、Tiki drinks',
    musicSuggestion: 'EDM, Pop',
    tips: '提前做好大量 Punch 或 Batch cocktail，準備足夠的冰塊，讓賓客自己取用更方便',
  },
  {
    id: 'solo-contemplation',
    emoji: '🌙',
    nameZh: '獨飲沉思',
    nameEn: 'Solo Contemplation',
    gradient: 'from-blue-950/60 via-indigo-900/40 to-slate-900/30',
    glowColor: 'rgba(99,102,241,0.4)',
    description: '安靜的夜晚，一個人細細品味人生',
    keywords: ['strong', 'classic', 'neat', 'contemplative', 'spirit-forward', 'old fashioned', 'manhattan', 'whiskey', 'bourbon', 'bitter'],
    recommendedStyles: 'Old Fashioned、純飲烈酒、Manhattan',
    musicSuggestion: 'Lo-fi, Classical',
    tips: '不趕時間，讓冰球慢慢融化改變風味層次，專注於每一口的變化',
  },
  {
    id: 'summer-afternoon',
    emoji: '☀️',
    nameZh: '夏日午後',
    nameEn: 'Summer Afternoon',
    gradient: 'from-orange-900/60 via-amber-800/40 to-yellow-900/30',
    glowColor: 'rgba(251,191,36,0.4)',
    description: '炎熱的下午需要冰涼解暑的飲品',
    keywords: ['refreshing', 'frozen', 'tropical', 'light', 'citrus', 'spritz', 'highball', 'soda', 'lemon', 'lime', 'cool'],
    recommendedStyles: 'Spritz、冰沙調酒、Highball',
    musicSuggestion: 'Reggae, Tropical House',
    tips: '杯子事先冷凍，使用大量碎冰，加入新鮮水果切片增添視覺與風味',
  },
  {
    id: 'holiday-celebration',
    emoji: '🎄',
    nameZh: '節慶慶祝',
    nameEn: 'Holiday Celebration',
    gradient: 'from-red-900/60 via-amber-900/40 to-yellow-900/30',
    glowColor: 'rgba(239,68,68,0.4)',
    description: '聖誕、新年、生日——值得舉杯慶祝的時刻',
    keywords: ['festive', 'sparkling', 'warm', 'spice', 'celebration', 'champagne', 'egg nog', 'cinnamon', 'nutmeg', 'hot'],
    recommendedStyles: '香檳調酒、熱調酒、Egg Nog',
    musicSuggestion: 'Holiday Jazz, Big Band',
    tips: '準備好香檳或氣泡酒，杯緣沾上糖霜或肉桂粉，營造節慶氛圍',
  },
  {
    id: 'fireside-chat',
    emoji: '🔥',
    nameZh: '壁爐夜話',
    nameEn: 'Fireside Chat',
    gradient: 'from-amber-900/60 via-orange-900/40 to-stone-900/30',
    glowColor: 'rgba(217,119,6,0.4)',
    description: '寒冷的冬夜，壁爐旁的溫暖對話',
    keywords: ['warm', 'rich', 'spirit-forward', 'cozy', 'smooth', 'bourbon', 'whiskey', 'toddy', 'coffee', 'irish', 'brandy', 'cognac'],
    recommendedStyles: '波本調酒、Hot Toddy、Irish Coffee',
    musicSuggestion: 'Acoustic, Folk',
    tips: '使用預熱過的杯具，加入肉桂棒或丁香等香料，讓溫暖從指尖傳到心裡',
  },
  {
    id: 'beach-vacation',
    emoji: '🏖️',
    nameZh: '海灘假期',
    nameEn: 'Beach Vacation',
    gradient: 'from-cyan-900/60 via-teal-800/40 to-emerald-900/30',
    glowColor: 'rgba(6,182,212,0.4)',
    description: '沙灘、陽光、海風——度假就該這樣喝',
    keywords: ['tropical', 'coconut', 'frozen', 'fun', 'beachy', 'pina colada', 'daiquiri', 'mai tai', 'rum', 'pineapple', 'mango'],
    recommendedStyles: 'Piña Colada、Daiquiri、Mai Tai',
    musicSuggestion: 'Reggaeton, Surf Rock',
    tips: '使用 Tiki 杯或椰殼杯盛裝，插上迷你雨傘和鮮花，用吸管享用更有度假感',
  },
  {
    id: 'business-networking',
    emoji: '💼',
    nameZh: '商務社交',
    nameEn: 'Business Networking',
    gradient: 'from-slate-800/60 via-gray-800/40 to-zinc-900/30',
    glowColor: 'rgba(148,163,184,0.4)',
    description: '需要展現品味又不失穩重的商務場合',
    keywords: ['classic', 'sophisticated', 'clean', 'professional', 'dry', 'martini', 'manhattan', 'gimlet', 'gin', 'vermouth', 'elegant'],
    recommendedStyles: 'Dry Martini、Manhattan、Gimlet',
    musicSuggestion: 'Smooth Jazz',
    tips: '選擇經典調酒展現品味，避免過於花俏的裝飾，優雅簡潔最能留下好印象',
  },
];

/* ─── Types ────────────────────────────────────────────────────── */

interface RecipeItem {
  id?: string;
  slug?: string;
  nameEn?: string;
  nameZh?: string;
  name_zh?: string;
  name?: string;
  name_en?: string;
  method?: string;
  glassType?: string;
  glass_type?: string;
  difficulty?: number;
  grade?: string;
  balanceScore?: number;
  balance_score?: number;
  description?: string;
  descriptionZh?: string;
  description_zh?: string;
  tags?: string[];
  ingredients?: Array<{ slug?: string; name?: string; ingredientName?: string; ingredientId?: string }>;
  glassImage?: string;
  glass_image?: string;
}

/* ─── Helper: match recipes to mood keywords ──────────────────── */

function scoreRecipe(recipe: RecipeItem, keywords: string[]): number {
  let score = 0;
  const lower = (s?: string) => (s ?? '').toLowerCase();

  const textFields = [
    lower(recipe.nameEn),
    lower(recipe.nameZh ?? recipe.name_zh ?? recipe.name),
    lower(recipe.description),
    lower(recipe.descriptionZh ?? recipe.description_zh),
    lower(recipe.method),
    lower(recipe.glassType ?? recipe.glass_type),
  ];

  const tagList = (recipe.tags ?? []).map((t) => t.toLowerCase());
  const ingredientNames = (recipe.ingredients ?? []).map((i) =>
    lower(i.slug ?? i.name ?? i.ingredientName ?? i.ingredientId),
  );

  for (const kw of keywords) {
    const kwLower = kw.toLowerCase();
    for (const field of textFields) {
      if (field.includes(kwLower)) score += 2;
    }
    for (const tag of tagList) {
      if (tag.includes(kwLower) || kwLower.includes(tag)) score += 3;
    }
    for (const ing of ingredientNames) {
      if (ing.includes(kwLower)) score += 2;
    }
  }
  return score;
}

function getMatchedRecipes(recipes: RecipeItem[], mood: MoodScenario, max = 6): RecipeItem[] {
  const scored = recipes
    .map((r) => ({ recipe: r, score: scoreRecipe(r, mood.keywords) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, max).map((x) => x.recipe);
}

/* ─── Difficulty display ──────────────────────────────────────── */

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="font-mono text-xs tracking-wide">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < level ? 'text-neon-amber' : 'text-charcoal-700'}>
          ★
        </span>
      ))}
    </span>
  );
}

/* ─── Grade color mapping ─────────────────────────────────────── */

const GRADE_COLORS: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#ef4444',
};

/* ─── Main Page Component ─────────────────────────────────────── */

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<MoodScenario | null>(null);
  const [allRecipes, setAllRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  /* Fetch all recipes once on mount */
  useEffect(() => {
    fetch('/api/v1/recipes?limit=200')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => setAllRecipes(data.items ?? []))
      .catch(() => setAllRecipes([]));
  }, []);

  const handleSelectMood = useCallback((mood: MoodScenario) => {
    setSelectedMood(mood);
    setLoading(true);
    setTimeout(() => {
      setShowDetail(true);
      setLoading(false);
    }, 300);
  }, []);

  const handleBack = useCallback(() => {
    setShowDetail(false);
    setTimeout(() => setSelectedMood(null), 300);
  }, []);

  const matchedRecipes = selectedMood ? getMatchedRecipes(allRecipes, selectedMood) : [];

  /* ── Detail View ────────────────────────────────────────────── */
  if (selectedMood && !loading) {
    return (
      <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
        {/* Back nav */}
        <button
          onClick={handleBack}
          className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors duration-200 tracking-wider"
        >
          ← 返回情境選擇
        </button>

        {/* Mood Banner */}
        <div
          className={`mt-6 rounded-lg overflow-hidden bg-gradient-to-br ${selectedMood.gradient} border border-charcoal-700 p-8 md:p-12 transition-all duration-500 ${showDetail ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ boxShadow: `0 0 40px ${selectedMood.glowColor}` }}
        >
          <div className="text-6xl md:text-7xl mb-4">{selectedMood.emoji}</div>
          <h1 className="font-display text-3xl md:text-4xl text-text-warm mb-1">
            {selectedMood.nameZh}
          </h1>
          <p className="font-mono text-xs text-charcoal-500 tracking-[0.2em] uppercase mb-4">
            {selectedMood.nameEn}
          </p>
          <p className="text-text-secondary leading-relaxed max-w-2xl">{selectedMood.description}</p>

          {/* Music pill */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-charcoal-700 bg-bg-primary/40 backdrop-blur-sm">
            <span className="text-sm">🎵</span>
            <span className="font-mono text-xs text-text-secondary tracking-wide">
              推薦音樂：{selectedMood.musicSuggestion}
            </span>
          </div>
        </div>

        {/* Recommended cocktails */}
        <section
          className={`mt-10 transition-all duration-500 delay-100 ${showDetail ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            RECOMMENDED COCKTAILS
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-gradient-amber mb-2">推薦調酒</h2>
          <p className="text-text-secondary text-sm mb-1">
            推薦風格：
            <span className="text-neon-cyan font-mono text-xs">{selectedMood.recommendedStyles}</span>
          </p>
          <div className="divider-amber mt-4 mb-8" />

          {matchedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedRecipes.map((recipe, idx) => {
                const nameZh = recipe.nameZh ?? recipe.name_zh ?? recipe.name ?? '未知調酒';
                const nameEn = recipe.nameEn ?? recipe.name_en ?? '';
                const slug = recipe.slug ?? recipe.id ?? '';
                const grade = recipe.grade ?? '';
                const score = recipe.balanceScore ?? recipe.balance_score;
                const difficulty = recipe.difficulty ?? 1;
                const glass = recipe.glassImage ?? recipe.glass_image ?? '🍸';

                return (
                  <Link
                    key={slug || idx}
                    href={`/recipes/${slug}`}
                    className="glass-card p-6 hover:border-neon-amber transition-all duration-300 group block animate-fade-in-up"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        {glass}
                      </span>
                      {grade && (
                        <span
                          className="font-mono text-xs font-bold px-2 py-1 rounded-sm"
                          style={{
                            backgroundColor: GRADE_COLORS[grade] ?? '#6B6B80',
                            color: '#fff',
                          }}
                        >
                          {grade} {score != null ? Math.round(score) : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg text-neon-amber group-hover:text-neon-cyan transition-colors duration-200 mb-1">
                      {nameZh}
                    </h3>
                    {nameEn && (
                      <p className="font-mono text-[11px] text-charcoal-500 tracking-wider mb-3">
                        {nameEn}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mb-3">
                      <DifficultyStars level={difficulty} />
                      {recipe.method && (
                        <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider border border-charcoal-700 px-2 py-0.5 rounded-sm">
                          {recipe.method}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-2 border-t border-charcoal-700/50">
                      <span className="font-mono text-[11px] text-charcoal-500 group-hover:text-neon-amber transition-colors duration-200 tracking-wider">
                        查看詳情 →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <p className="text-4xl mb-4">🍹</p>
              <p className="text-text-secondary">
                目前沒有完全匹配的調酒，試試探索
                <Link href="/recipes" className="text-neon-amber hover:underline mx-1">
                  配方庫
                </Link>
                尋找靈感！
              </p>
            </div>
          )}
        </section>

        {/* Tips section */}
        <section
          className={`mt-10 transition-all duration-500 delay-200 ${showDetail ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
            PRO TIPS
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-gradient-amber mb-2">調酒小建議</h2>
          <div className="divider-amber mt-4 mb-6" />
          <div className="glass-card p-6 md:p-8 border-l-2 border-l-neon-amber/60">
            <p className="text-text-secondary leading-relaxed">
              <span className="text-neon-amber mr-2">💡</span>
              {selectedMood.tips}
            </p>
          </div>
        </section>

        {/* Back button */}
        <div
          className={`mt-12 text-center transition-all duration-500 delay-300 ${showDetail ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <button onClick={handleBack} className="btn-neon-amber px-8 py-3 text-sm tracking-wider">
            ← 返回情境選擇
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 mb-4 text-center">
          <p className="font-mono text-[11px] text-charcoal-500 tracking-wider">
            MIXMASTER · 情境酒單 · MOOD MENU
          </p>
        </div>
      </main>
    );
  }

  /* ── Selection Grid View ────────────────────────────────────── */
  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors duration-200 tracking-wider"
      >
        ← 返回首頁
      </Link>

      {/* Page header */}
      <div className="mt-8 mb-10">
        <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-3">
          MOOD MENU
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-2">
          🎵 情境酒單
        </h1>
        <p className="text-text-secondary">
          選擇你的心情，我們為你調一杯
        </p>
        <div className="divider-amber mt-6" />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-5xl mb-4 animate-bounce">🍸</div>
            <p className="font-mono text-sm text-neon-amber tracking-wider animate-pulse">
              調製中...
            </p>
          </div>
        </div>
      )}

      {/* Mood Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {MOODS.map((mood, idx) => (
          <button
            key={mood.id}
            onClick={() => handleSelectMood(mood)}
            className={`group relative rounded-lg overflow-hidden border border-charcoal-700 bg-gradient-to-br ${mood.gradient} p-6 md:p-8 text-left transition-all duration-300 hover:scale-[1.03] hover:border-neon-amber/60 focus:outline-none focus:ring-2 focus:ring-neon-amber/40 animate-fade-in-up`}
            style={{ animationDelay: `${idx * 60}ms` }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${mood.glowColor}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Shimmer overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

            <div className="relative z-10">
              <span className="text-4xl md:text-5xl block mb-4 group-hover:scale-110 transition-transform duration-300">
                {mood.emoji}
              </span>
              <h2 className="font-display text-xl md:text-2xl text-text-warm mb-1 group-hover:text-neon-amber transition-colors duration-200">
                {mood.nameZh}
              </h2>
              <p className="font-mono text-[11px] text-charcoal-500 tracking-[0.2em] uppercase mb-3">
                {mood.nameEn}
              </p>
              <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                {mood.description}
              </p>

              {/* Music tag */}
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-charcoal-700/60 bg-bg-primary/30">
                <span className="text-xs">🎵</span>
                <span className="font-mono text-[10px] text-charcoal-500 tracking-wide">
                  {mood.musicSuggestion}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 mb-4 text-center">
        <p className="font-mono text-[11px] text-charcoal-500 tracking-wider">
          MIXMASTER · 情境酒單 · MOOD MENU
        </p>
      </div>
    </main>
  );
}
