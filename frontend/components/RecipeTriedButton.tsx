'use client'

import { useProgress } from './ProgressContext'

export default function RecipeTriedButton({ slug }: { slug: string }) {
  const { markRecipeTried, isRecipeTried } = useProgress()
  const tried = isRecipeTried(slug)

  return (
    <button
      onClick={() => markRecipeTried(slug)}
      disabled={tried}
      className={`
        inline-flex items-center gap-2 font-mono text-sm px-5 py-2.5 border rounded-sm
        transition-all duration-300
        ${tried
          ? 'border-green-500/60 text-green-400 bg-green-500/10 cursor-default'
          : 'border-charcoal-700 text-charcoal-400 hover:border-neon-cyan hover:text-neon-cyan hover:bg-neon-cyan/5'
        }
      `}
    >
      <span className="text-lg">{tried ? '✅' : '☑️'}</span>
      {tried ? '已嘗試 Tried' : '標記已嘗試 Mark as Tried'}
    </button>
  )
}
