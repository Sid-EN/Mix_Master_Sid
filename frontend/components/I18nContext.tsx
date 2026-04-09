'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Locale, TranslationSet } from '../lib/i18n'
import { DEFAULT_LOCALE, LOCALES } from '../lib/i18n'
import zhTW from '../lib/locales/zh-TW'
import en from '../lib/locales/en'
import ja from '../lib/locales/ja'

const translations: Record<Locale, TranslationSet> = {
  'zh-TW': zhTW,
  en,
  ja,
}

const STORAGE_KEY = 'mixmaster-locale'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof TranslationSet) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LOCALES.includes(stored as Locale)) {
      setLocaleState(stored as Locale)
    }
    setMounted(true)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
    // Update html lang attribute
    const langMap: Record<Locale, string> = {
      'zh-TW': 'zh-Hant',
      en: 'en',
      ja: 'ja',
    }
    document.documentElement.setAttribute('lang', langMap[l])
  }, [])

  const t = useCallback(
    (key: keyof TranslationSet): string => {
      // Current locale → fallback zh-TW → return raw key
      const val = translations[locale]?.[key]
      if (val) return val
      const fallback = translations[DEFAULT_LOCALE]?.[key]
      if (fallback) return fallback
      return key
    },
    [locale],
  )

  // Prevent hydration mismatch: render children immediately but with default locale
  // The locale will update on the client after mount
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
