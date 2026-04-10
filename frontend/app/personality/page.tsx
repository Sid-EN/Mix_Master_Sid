'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

/* ─── Types ──────────────────────────────────────────────────────── */

type PersonalityKey = 'Classic' | 'Tropical' | 'Party' | 'Creative' | 'Explorer' | 'Contemplative'

interface Choice {
  label: string
  points: Partial<Record<PersonalityKey, number>>
}

interface Question {
  question: string
  choices: Choice[]
}

interface PersonalityProfile {
  key: PersonalityKey
  icon: string
  name: string
  color: string
  colorClass: string
  glowClass: string
  bgAccent: string
  borderAccent: string
  description: string
  cocktails: string[]
  spirits: string[]
  bars: string[]
}

/* ─── Quiz Data ──────────────────────────────────────────────────── */

const questions: Question[] = [
  {
    question: '你理想的週五夜晚是？',
    choices: [
      { label: 'A. 獨自在家看電影配一杯好酒', points: { Classic: 3, Contemplative: 1 } },
      { label: 'B. 和朋友在屋頂酒吧狂歡', points: { Party: 3, Tropical: 1 } },
      { label: 'C. 嘗試一間新開的秘密酒吧', points: { Explorer: 3, Classic: 1 } },
      { label: 'D. 在家試做一款新調酒', points: { Creative: 3, Explorer: 1 } },
    ],
  },
  {
    question: '你最喜歡的食物風格？',
    choices: [
      { label: 'A. 日式精緻料理', points: { Classic: 3, Contemplative: 2 } },
      { label: 'B. 墨西哥燒烤派對', points: { Tropical: 3, Party: 1 } },
      { label: 'C. 分子料理餐廳', points: { Creative: 3, Explorer: 2 } },
      { label: 'D. 舒適的義式家常菜', points: { Classic: 2, Party: 2 } },
    ],
  },
  {
    question: '選一個最吸引你的城市？',
    choices: [
      { label: 'A. 東京', points: { Classic: 3, Contemplative: 2 } },
      { label: 'B. 邁阿密', points: { Tropical: 3, Party: 2 } },
      { label: 'C. 柏林', points: { Explorer: 3, Creative: 1 } },
      { label: 'D. 紐約', points: { Creative: 2, Explorer: 2 } },
    ],
  },
  {
    question: '你的穿衣風格？',
    choices: [
      { label: 'A. 經典西裝/洋裝，永恆不敗', points: { Classic: 3 } },
      { label: 'B. 鮮豔色彩，引人注目', points: { Tropical: 3, Party: 1 } },
      { label: 'C. 黑色極簡，低調有型', points: { Contemplative: 3, Creative: 1 } },
      { label: 'D. 混搭實驗，獨樹一格', points: { Creative: 3, Explorer: 1 } },
    ],
  },
  {
    question: '你在酒吧通常怎麼點酒？',
    choices: [
      { label: 'A. 永遠點同一款經典調酒', points: { Classic: 3, Contemplative: 1 } },
      { label: 'B. 「給我最受歡迎的那款」', points: { Party: 3, Tropical: 1 } },
      { label: 'C. 「你們有什麼特別的？」', points: { Explorer: 3, Creative: 1 } },
      { label: 'D. 「我要自己調配比例」', points: { Creative: 3 } },
    ],
  },
  {
    question: '選一種音樂風格？',
    choices: [
      { label: 'A. Jazz / Bossa Nova', points: { Classic: 3, Contemplative: 2 } },
      { label: 'B. Reggaeton / Pop', points: { Party: 3, Tropical: 2 } },
      { label: 'C. 電子 / Techno', points: { Explorer: 3, Creative: 1 } },
      { label: 'D. Indie / Lo-fi', points: { Contemplative: 3, Creative: 1 } },
    ],
  },
  {
    question: '旅行時你最想做什麼？',
    choices: [
      { label: 'A. 拜訪歷史悠久的酒莊', points: { Classic: 3, Contemplative: 2 } },
      { label: 'B. 在海灘酒吧喝椰子酒', points: { Tropical: 3, Party: 2 } },
      { label: 'C. 探索當地的地下酒吧', points: { Explorer: 3, Creative: 1 } },
      { label: 'D. 參加烹飪/調酒課程', points: { Creative: 3, Explorer: 1 } },
    ],
  },
  {
    question: '你更喜歡哪種風味？',
    choices: [
      { label: 'A. 煙燻、橡木、複雜', points: { Contemplative: 3, Classic: 2 } },
      { label: 'B. 甜蜜、果香、清爽', points: { Tropical: 3, Party: 1 } },
      { label: 'C. 苦、草本、神秘', points: { Explorer: 3, Creative: 2 } },
      { label: 'D. 酸甜平衡、完美和諧', points: { Classic: 2, Creative: 2 } },
    ],
  },
  {
    question: '你的社交風格？',
    choices: [
      { label: 'A. 小圈圈深度對話', points: { Contemplative: 3, Classic: 1 } },
      { label: 'B. 派對中心，認識所有人', points: { Party: 3, Tropical: 1 } },
      { label: 'C. 角落觀察者，偶爾驚豔全場', points: { Explorer: 3, Contemplative: 1 } },
      { label: 'D. 主動分享新發現和知識', points: { Creative: 3, Explorer: 1 } },
    ],
  },
  {
    question: '如果你的靈魂有一種顏色？',
    choices: [
      { label: 'A. 琥珀金 — 溫暖、經典、深沉', points: { Classic: 3, Contemplative: 2 } },
      { label: 'B. 珊瑚粉 — 活潑、溫暖、歡樂', points: { Tropical: 3, Party: 2 } },
      { label: 'C. 靛藍 — 神秘、深邃、獨特', points: { Explorer: 3, Contemplative: 2 } },
      { label: 'D. 霓虹綠 — 創新、大膽、未來感', points: { Creative: 3, Explorer: 1 } },
    ],
  },
]

const profiles: PersonalityProfile[] = [
  {
    key: 'Classic',
    icon: '🥃',
    name: '經典主義者 (The Classicist)',
    color: '#F5A623',
    colorClass: 'text-[#F5A623]',
    glowClass: 'shadow-[0_0_30px_rgba(245,166,35,0.4)]',
    bgAccent: 'bg-[#F5A623]/10',
    borderAccent: 'border-[#F5A623]/50',
    description:
      '你是調酒界的老靈魂。你相信完美來自於傳統，一杯做到極致的 Old Fashioned 勝過任何花俏的分子調酒。你欣賞歷史、工藝與不受時間考驗的經典。',
    cocktails: ['Old Fashioned', 'Manhattan', 'Martini'],
    spirits: ['Bourbon', 'Rye Whiskey'],
    bars: ['The Connaught', 'Bar High Five'],
  },
  {
    key: 'Tropical',
    icon: '🏝️',
    name: '熱帶冒險家 (The Tropical Adventurer)',
    color: '#00D4AA',
    colorClass: 'text-[#00D4AA]',
    glowClass: 'shadow-[0_0_30px_rgba(0,212,170,0.4)]',
    bgAccent: 'bg-[#00D4AA]/10',
    borderAccent: 'border-[#00D4AA]/50',
    description:
      '你的血液裡流著椰子水和蘭姆酒。你相信人生苦短，應該永遠在度假狀態。色彩繽紛、果香四溢、帶著小傘的調酒才是你的菜。',
    cocktails: ['Mai Tai', 'Piña Colada', 'Zombie'],
    spirits: ['Rum', 'Tequila'],
    bars: ["Smuggler's Cove", 'Three Dots and a Dash'],
  },
  {
    key: 'Party',
    icon: '🎉',
    name: '派對靈魂 (The Party Spirit)',
    color: '#FF6B9D',
    colorClass: 'text-[#FF6B9D]',
    glowClass: 'shadow-[0_0_30px_rgba(255,107,157,0.4)]',
    bgAccent: 'bg-[#FF6B9D]/10',
    borderAccent: 'border-[#FF6B9D]/50',
    description:
      '哪裡有你，哪裡就是派對。你喜歡容易分享、大家一起喝的調酒。你是那個會帶一大壺 Sangria 去朋友家的人。',
    cocktails: ['Margarita', 'Aperol Spritz', 'Punch'],
    spirits: ['Tequila', 'Prosecco'],
    bars: ['Employees Only', 'Paradiso'],
  },
  {
    key: 'Creative',
    icon: '🔬',
    name: '創意煉金師 (The Creative Alchemist)',
    color: '#A855F7',
    colorClass: 'text-[#A855F7]',
    glowClass: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    bgAccent: 'bg-[#A855F7]/10',
    borderAccent: 'border-[#A855F7]/50',
    description:
      '你不滿足於現有的規則，你要創造新的。自製浸泡酒、實驗性配方、分子調酒——你的廚房就是實驗室。',
    cocktails: ['Paper Plane', 'Last Word', '自創配方'],
    spirits: ['Mezcal', 'Absinthe', 'Chartreuse'],
    bars: ['The Aviary', 'Lyaness'],
  },
  {
    key: 'Explorer',
    icon: '🗺️',
    name: '探索者 (The Explorer)',
    color: '#14B8A6',
    colorClass: 'text-[#14B8A6]',
    glowClass: 'shadow-[0_0_30px_rgba(20,184,166,0.4)]',
    bgAccent: 'bg-[#14B8A6]/10',
    borderAccent: 'border-[#14B8A6]/50',
    description:
      '你永遠在尋找下一個驚喜。每到一個新城市，第一件事就是找當地最好的酒吧。你的口袋名單比大多數人的調酒知識還豐富。',
    cocktails: ['Negroni Sbagliato', 'Vieux Carré', '當地特色調酒'],
    spirits: ['Amaro', 'Vermouth', '各國特色烈酒'],
    bars: ['Atlas', 'Coa'],
  },
  {
    key: 'Contemplative',
    icon: '🌙',
    name: '沉思者 (The Contemplator)',
    color: '#6366F1',
    colorClass: 'text-[#6366F1]',
    glowClass: 'shadow-[0_0_30px_rgba(99,102,241,0.4)]',
    bgAccent: 'bg-[#6366F1]/10',
    borderAccent: 'border-[#6366F1]/50',
    description:
      '你把喝酒視為一種冥想。一杯 Scotch neat，一張好的黑膠唱片，一個人的深夜——這就是你的完美。',
    cocktails: ['Scotch Neat', 'Sazerac', 'Rob Roy'],
    spirits: ['Single Malt Scotch', 'Cognac'],
    bars: ['Star Bar Ginza', 'Bar Benfiddich'],
  },
]

const allKeys: PersonalityKey[] = ['Classic', 'Tropical', 'Party', 'Creative', 'Explorer', 'Contemplative']

const keyLabels: Record<PersonalityKey, string> = {
  Classic: '經典',
  Tropical: '熱帶',
  Party: '派對',
  Creative: '創意',
  Explorer: '探索',
  Contemplative: '沉思',
}

function emptyScores(): Record<PersonalityKey, number> {
  return { Classic: 0, Tropical: 0, Party: 0, Creative: 0, Explorer: 0, Contemplative: 0 }
}

/* ─── Slug helper for cocktail links ─────────────────────────────── */

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/* ─── Component ──────────────────────────────────────────────────── */

type Step = 'intro' | 'quiz' | 'result'

export default function PersonalityPage() {
  const [step, setStep] = useState<Step>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [scores, setScores] = useState<Record<PersonalityKey, number>>(emptyScores)
  const [result, setResult] = useState<PersonalityProfile | null>(null)
  const [fadeKey, setFadeKey] = useState(0)

  /* Restore saved result on mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mixmaster-personality')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.key && parsed?.scores) {
          const profile = profiles.find((p) => p.key === parsed.key)
          if (profile) {
            setResult(profile)
            setScores(parsed.scores)
          }
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const startQuiz = useCallback(() => {
    setScores(emptyScores())
    setCurrentQ(0)
    setResult(null)
    setFadeKey((k) => k + 1)
    setStep('quiz')
  }, [])

  const selectChoice = useCallback(
    (choice: Choice) => {
      const next = { ...scores }
      for (const [key, val] of Object.entries(choice.points)) {
        next[key as PersonalityKey] += val as number
      }
      setScores(next)

      if (currentQ < questions.length - 1) {
        setFadeKey((k) => k + 1)
        setCurrentQ((q) => q + 1)
      } else {
        // Calculate result
        let maxKey: PersonalityKey = 'Classic'
        let maxVal = -1
        for (const k of allKeys) {
          if (next[k] > maxVal) {
            maxVal = next[k]
            maxKey = k
          }
        }
        const profile = profiles.find((p) => p.key === maxKey)!
        setResult(profile)
        try {
          localStorage.setItem(
            'mixmaster-personality',
            JSON.stringify({ key: maxKey, scores: next, timestamp: Date.now() })
          )
        } catch {
          // ignore
        }
        setFadeKey((k) => k + 1)
        setStep('result')
      }
    },
    [scores, currentQ]
  )

  const maxScore = Math.max(...allKeys.map((k) => scores[k]), 1)

  return (
    <main className="min-h-screen px-4 sm:px-6 py-12 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors mb-8"
      >
        ← 返回首頁
      </Link>

      {/* ─── INTRO ──────────────────────────────────────────── */}
      {step === 'intro' && (
        <section key="intro" className="animate-fade-in-up text-center py-12">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-4">
            Cocktail Personality
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-gradient-amber mb-4">
            🎭 你的調酒人格
          </h1>
          <p className="text-lg text-charcoal-400 mb-2">Cocktail Personality Test</p>
          <p className="text-charcoal-500 mb-10">
            回答 10 個問題，發現最適合你的調酒風格
          </p>
          <div className="divider-amber mb-10" />

          {result && (
            <div className="glass-card p-6 mb-8 text-left">
              <p className="font-mono text-xs text-charcoal-500 mb-2">上次測驗結果</p>
              <p className="text-xl font-display" style={{ color: result.color }}>
                {result.icon} {result.name}
              </p>
            </div>
          )}

          <button
            onClick={startQuiz}
            className="btn-neon-amber text-base px-10 py-4 animate-pulse-slow"
          >
            開始測驗
          </button>
        </section>
      )}

      {/* ─── QUIZ ───────────────────────────────────────────── */}
      {step === 'quiz' && (
        <section key="quiz">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs text-charcoal-400">
                問題 {currentQ + 1} / {questions.length}
              </span>
              <span className="font-mono text-xs text-neon-amber">
                {Math.round(((currentQ + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((currentQ + 1) / questions.length) * 100}%`,
                  background: 'linear-gradient(90deg, var(--color-neon-amber), #F5C563)',
                  boxShadow: '0 0 12px rgba(245,166,35,0.5)',
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div key={fadeKey} className="animate-fade-in-up">
            <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-8">
              Q{currentQ + 1}. {questions[currentQ].question}
            </h2>

            <div className="flex flex-col gap-3">
              {questions[currentQ].choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => selectChoice(choice)}
                  className="glass-card w-full text-left px-6 py-4 border border-charcoal-700 hover:border-neon-amber
                    transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    text-text-primary hover:text-neon-amber group cursor-pointer"
                >
                  <span className="text-base leading-relaxed group-hover:translate-x-1 inline-block transition-transform">
                    {choice.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── RESULT ─────────────────────────────────────────── */}
      {step === 'result' && result && (
        <section key="result" className="animate-fade-in-up">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-4 text-center">
            Your Cocktail Personality
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-gradient-amber mb-6 text-center">
            測驗結果
          </h1>
          <div className="divider-amber mb-8" />

          {/* Profile card */}
          <div
            className={`glass-card p-8 mb-8 text-center border ${result.borderAccent} ${result.glowClass}`}
          >
            <div className="text-6xl mb-4">{result.icon}</div>
            <h2
              className="font-display text-3xl md:text-4xl mb-2"
              style={{ color: result.color }}
            >
              {result.name}
            </h2>
            <p className="text-charcoal-400 text-base leading-relaxed mt-4 max-w-lg mx-auto">
              {result.description}
            </p>
          </div>

          {/* DNA bar chart */}
          <div className="glass-card p-6 mb-8">
            <h3 className="font-display text-xl text-text-primary mb-1">
              🧬 你的調酒 DNA
            </h3>
            <p className="font-mono text-xs text-charcoal-500 mb-5">Score Breakdown</p>
            <div className="space-y-3">
              {allKeys.map((k) => {
                const profile = profiles.find((p) => p.key === k)!
                const pct = maxScore > 0 ? (scores[k] / maxScore) * 100 : 0
                return (
                  <div key={k}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-xs text-charcoal-400">
                        {profile.icon} {keyLabels[k]}
                      </span>
                      <span className="font-mono text-xs" style={{ color: profile.color }}>
                        {scores[k]}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-charcoal-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: profile.color,
                          boxShadow: `0 0 8px ${profile.color}66`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommended cocktails */}
          <div className="glass-card p-6 mb-8">
            <h3 className="font-display text-xl text-text-primary mb-1">
              🍸 代表調酒
            </h3>
            <p className="font-mono text-xs text-charcoal-500 mb-4">Signature Cocktails</p>
            <div className="flex flex-wrap gap-2">
              {result.cocktails.map((c) => (
                <Link
                  key={c}
                  href={`/recipes/${toSlug(c)}`}
                  className={`inline-block px-4 py-2 rounded-full text-sm border transition-all duration-200
                    hover:scale-105 ${result.borderAccent} ${result.bgAccent}`}
                  style={{ color: result.color }}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended spirits */}
          <div className="glass-card p-6 mb-8">
            <h3 className="font-display text-xl text-text-primary mb-1">
              🥂 推薦基酒
            </h3>
            <p className="font-mono text-xs text-charcoal-500 mb-4">Recommended Spirits</p>
            <div className="flex flex-wrap gap-2">
              {result.spirits.map((s) => (
                <span
                  key={s}
                  className={`inline-block px-4 py-2 rounded-full text-sm border ${result.borderAccent} ${result.bgAccent}`}
                  style={{ color: result.color }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended bars */}
          <div className="glass-card p-6 mb-8">
            <h3 className="font-display text-xl text-text-primary mb-1">
              🏠 適合酒吧
            </h3>
            <p className="font-mono text-xs text-charcoal-500 mb-4">Recommended Bars</p>
            <div className="flex flex-wrap gap-2">
              {result.bars.map((b) => (
                <span
                  key={b}
                  className={`inline-block px-4 py-2 rounded-full text-sm border ${result.borderAccent} ${result.bgAccent}`}
                  style={{ color: result.color }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Share section */}
          <div className="glass-card p-6 mb-8 text-center">
            <h3 className="font-display text-xl text-text-primary mb-3">
              📤 分享結果
            </h3>
            <p className="text-charcoal-400 text-sm leading-relaxed max-w-md mx-auto">
              我的調酒人格是「{result.icon} {result.name}」！
              <br />
              來 MixMaster 測測你的調酒人格吧 🍸
            </p>
          </div>

          {/* Retake button */}
          <div className="text-center">
            <button onClick={startQuiz} className="btn-neon-amber text-base px-10 py-4">
              🔄 重新測驗
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="font-mono text-[11px] text-charcoal-500 tracking-wider">
              MixMaster — Cocktail Personality Test v1.0
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
