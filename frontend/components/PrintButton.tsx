'use client'

/** 列印配方。按鈕本身在列印時會被樣式隱藏。 */
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print px-4 py-2 font-mono text-xs rounded border border-charcoal-700
                 text-text-muted hover:border-neon-amber hover:text-neon-amber transition-colors"
    >
      🖨 列印配方
    </button>
  )
}
