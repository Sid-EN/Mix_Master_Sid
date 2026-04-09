'use client'

import { useState, useRef, useEffect } from 'react'
import { useI18n } from './I18nContext'
import { LOCALES, LOCALE_META } from '../lib/i18n'
import type { Locale } from '../lib/i18n'

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="px-2 py-2 text-charcoal-500 hover:text-neon-amber transition-colors
                   font-mono text-sm"
        title={t('lang_switch')}
        aria-label={t('lang_switch')}
      >
        {LOCALE_META[locale].flag}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[160px] z-[70]
                     border border-charcoal-700 rounded-md shadow-2xl
                     animate-fade-in overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-secondary, #111118)' }}
        >
          <p className="px-3 py-2 font-mono text-[10px] text-charcoal-500 tracking-[0.2em] uppercase border-b border-charcoal-700/50">
            {t('lang_switch')}
          </p>
          {LOCALES.map((l: Locale) => {
            const meta = LOCALE_META[l]
            const active = l === locale
            return (
              <button
                key={l}
                onClick={() => { setLocale(l); setIsOpen(false) }}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5
                           font-mono text-xs tracking-wider transition-all duration-200
                           ${active
                             ? 'text-neon-amber bg-neon-amber/10'
                             : 'text-charcoal-400 hover:text-neon-amber hover:bg-bg-tertiary'
                           }`}
              >
                <span className="text-base">{meta.flag}</span>
                <span className="flex-1">{meta.labelNative}</span>
                {active && (
                  <span className="text-neon-amber text-[10px]">●</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
