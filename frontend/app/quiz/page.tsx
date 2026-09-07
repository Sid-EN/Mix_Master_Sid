'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useProgress } from '../../components/ProgressContext'
import {
  quizQuestions,
  QUIZ_CATEGORIES,
  QUESTIONS_PER_ROUND,
  type QuizQuestion,
  type QuizCategory,
} from '../../lib/quizData'

/* ── localStorage helpers ── */

interface QuizHistory {
  completed: number
  bestScores: Record<string, number>
}

const STORAGE_KEY = 'mixmaster-quiz-history'

function loadHistory(): QuizHistory {
  if (typeof window === 'undefined') return { completed: 0, bestScores: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as QuizHistory
  } catch { /* ignore */ }
  return { completed: 0, bestScores: {} }
}

function saveHistory(h: QuizHistory) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) } catch { /* ignore */ }
}

/* ── shuffle util ── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ── Component ── */

type Phase = 'select' | 'playing' | 'result'

export default function QuizPage() {
  const { addQuizComplete } = useProgress()

  const [phase, setPhase] = useState<Phase>('select')
  const [history, setHistory] = useState<QuizHistory>({ completed: 0, bestScores: {} })
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory['id'] | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [chosenOption, setChosenOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])

  useEffect(() => { setHistory(loadHistory()) }, [])

  const currentQuestion = questions[currentIdx] ?? null

  /* ── Start a quiz round ── */
  const startQuiz = useCallback((catId: QuizCategory['id']) => {
    const pool = catId === 'random'
      ? quizQuestions
      : quizQuestions.filter(q => q.category === catId)
    const picked = shuffle(pool).slice(0, QUESTIONS_PER_ROUND)
    setSelectedCategory(catId)
    setQuestions(picked)
    setCurrentIdx(0)
    setChosenOption(null)
    setScore(0)
    setAnswers([])
    setPhase('playing')
  }, [])

  /* ── Select an answer ── */
  const handleAnswer = useCallback((optIdx: number) => {
    if (chosenOption !== null) return
    setChosenOption(optIdx)
    const correct = currentQuestion?.correctIndex === optIdx
    if (correct) setScore(prev => prev + 1)
    setAnswers(prev => [...prev, optIdx])
  }, [chosenOption, currentQuestion])

  /* ── Next question or finish ── */
  const handleNext = useCallback(() => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1)
      setChosenOption(null)
    } else {
      addQuizComplete()
      const catKey = selectedCategory ?? 'random'
      setHistory(prev => {
        const best = prev.bestScores[catKey] ?? 0
        const updated: QuizHistory = {
          completed: prev.completed + 1,
          bestScores: { ...prev.bestScores, [catKey]: Math.max(best, score) },
        }
        saveHistory(updated)
        return updated
      })
      setPhase('result')
    }
  }, [currentIdx, questions.length, addQuizComplete, selectedCategory, score])

  /* ── Back to category select ── */
  const resetToSelect = useCallback(() => {
    setPhase('select')
    setSelectedCategory(null)
    setQuestions([])
    setCurrentIdx(0)
    setChosenOption(null)
    setScore(0)
    setAnswers([])
    setHistory(loadHistory())
  }, [])

  /* ── Option style helpers ── */
  const optionLabel = (i: number) => ['A', 'B', 'C', 'D'][i]

  const optionClass = (i: number) => {
    if (chosenOption === null) {
      return 'glass-card p-4 cursor-pointer hover:border-neon-amber transition-all duration-200 text-left group'
    }
    const isCorrect = i === currentQuestion?.correctIndex
    const isChosen = i === chosenOption
    if (isCorrect) {
      return 'glass-card p-4 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] text-left'
    }
    if (isChosen && !isCorrect) {
      return 'glass-card p-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] text-left'
    }
    return 'glass-card p-4 opacity-50 text-left'
  }

  /* ── Render: Category Selection ── */
  if (phase === 'select') {
    return (
      <main className="min-h-screen bg-bg-primary">
        <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-4 animate-fade-in">
            Knowledge Quiz
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-gradient-amber leading-tight mb-4">
            知識測驗
          </h1>
          <p className="font-mono text-sm text-charcoal-500 mb-2">
            每輪 {QUESTIONS_PER_ROUND} 題 · 完成可獲得 25 XP
          </p>
          <p className="font-mono text-xs text-charcoal-500 mb-12">
            已完成 {history.completed} 次測驗
          </p>

          <div className="divider-amber mb-10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {QUIZ_CATEGORIES.map(cat => {
              const best = history.bestScores[cat.id]
              return (
                <button
                  key={cat.id}
                  onClick={() => startQuiz(cat.id)}
                  className="glass-card p-8 group hover:border-neon-amber transition-all duration-300 text-left"
                >
                  <span className="text-3xl mb-3 block">{cat.icon}</span>
                  <h2 className="font-display text-xl text-text-warm mb-1">
                    {cat.label}
                  </h2>
                  <p className="font-mono text-xs text-charcoal-500 tracking-wider uppercase mb-3">
                    {cat.labelEn}
                  </p>
                  {best !== undefined && (
                    <p className="font-mono text-xs text-neon-amber">
                      最佳成績：{best}/{QUESTIONS_PER_ROUND}
                    </p>
                  )}
                </button>
              )
            })}
          </div>

          <Link href="/" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber transition-colors">
            ← 返回首頁 Back to Home
          </Link>
        </section>
      </main>
    )
  }

  /* ── Render: Results ── */
  if (phase === 'result') {
    const pct = Math.round((score / questions.length) * 100)
    const grade = pct >= 90 ? 'S' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D'
    const gradeColor: Record<string, string> = {
      S: 'text-neon-amber text-neon-glow-amber',
      A: 'text-green-400',
      B: 'text-neon-cyan',
      C: 'text-yellow-400',
      D: 'text-red-400',
    }

    return (
      <main className="min-h-screen bg-bg-primary">
        <section className="px-6 pt-20 pb-16 max-w-3xl mx-auto text-center animate-fade-in">
          <p className="font-mono text-neon-amber text-xs tracking-[0.3em] uppercase mb-4">
            Quiz Complete
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-gradient-amber leading-tight mb-6">
            測驗結果
          </h1>

          <div className="glass-card p-10 mb-8">
            <p className={`font-display text-8xl mb-4 ${gradeColor[grade]}`}>
              {grade}
            </p>
            <p className="font-display text-3xl text-text-warm mb-2">
              {score} / {questions.length}
            </p>
            <p className="font-mono text-sm text-charcoal-500 mb-6">
              正確率 {pct}% · +25 XP
            </p>

            <div className="divider-amber mb-6" />

            <div className="space-y-3 text-left">
              {questions.map((q, qi) => {
                const userAns = answers[qi]
                const correct = userAns === q.correctIndex
                return (
                  <div key={q.id} className="flex items-start gap-3 font-mono text-sm">
                    <span className={`mt-0.5 ${correct ? 'text-green-400' : 'text-red-400'}`}>
                      {correct ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="text-text-warm">{q.question}</p>
                      {!correct && (
                        <p className="text-charcoal-500 text-xs mt-1">
                          正確答案：{q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => startQuiz(selectedCategory ?? 'random')} className="btn-neon-amber">
              再測一次
            </button>
            <button onClick={resetToSelect} className="btn-neon-cyan">
              選擇分類
            </button>
          </div>
        </section>
      </main>
    )
  }

  /* ── Render: Playing ── */
  return (
    <main className="min-h-screen bg-bg-primary">
      <section className="px-6 pt-20 pb-16 max-w-3xl mx-auto animate-fade-in">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-mono text-xs text-charcoal-500">
            第 {currentIdx + 1} / {questions.length} 題
          </p>
          <p className="font-mono text-xs text-neon-amber">
            目前得分：{score}
          </p>
        </div>
        <div className="w-full h-1 bg-charcoal-900 rounded-full mb-8">
          <div
            className="h-1 bg-neon-amber rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Category badge */}
        {currentQuestion && (
          <p className="font-mono text-xs text-charcoal-500 tracking-wider uppercase mb-4">
            {QUIZ_CATEGORIES.find(c => c.id === currentQuestion.category)?.labelEn ?? ''}
          </p>
        )}

        {/* Question */}
        <div className="glass-card p-8 mb-6">
          <h2 className="font-display text-xl md:text-2xl text-text-warm leading-relaxed">
            {currentQuestion?.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion?.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={chosenOption !== null}
              className={`${optionClass(i)} w-full`}
            >
              <span className="flex items-center gap-3">
                <span className={`font-mono text-sm font-bold ${
                  chosenOption === null
                    ? 'text-neon-amber group-hover:text-text-warm'
                    : i === currentQuestion.correctIndex
                      ? 'text-green-400'
                      : i === chosenOption
                        ? 'text-red-400'
                        : 'text-charcoal-500'
                }`}>
                  {optionLabel(i)}
                </span>
                <span className="text-text-warm font-sans">{opt}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Explanation (after answering) */}
        {chosenOption !== null && currentQuestion && (
          <div className="glass-card p-6 mb-6 border-neon-amber animate-fade-in">
            <p className="font-mono text-xs text-neon-amber tracking-wider uppercase mb-2">
              {chosenOption === currentQuestion.correctIndex ? '✓ 回答正確！' : '✗ 答錯了'}
            </p>
            <p className="text-sm text-charcoal-500 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Next / Finish button */}
        {chosenOption !== null && (
          <div className="text-center animate-fade-in">
            <button onClick={handleNext} className="btn-neon-amber">
              {currentIdx + 1 < questions.length ? '下一題 →' : '查看結果'}
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
