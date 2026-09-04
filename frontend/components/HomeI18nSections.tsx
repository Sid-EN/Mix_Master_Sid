'use client'

import Link from 'next/link'
import { useI18n } from './I18nContext'

export function HomeHeroText() {
  const { t } = useI18n()

  return (
    <>
      <p className="font-mono text-neon-amber text-xs tracking-[0.35em] uppercase mb-6 opacity-60 animate-fade-in">
        {t('home_subtitle')}
      </p>

      <h1 className="font-display text-7xl md:text-9xl font-bold text-gradient-amber text-neon-glow-amber animate-fade-in leading-tight">
        MixMaster
      </h1>

      <p className="font-display italic text-text-secondary text-xl md:text-2xl mt-6 animate-fade-in">
        {t('home_tagline')}
      </p>
      <p className="text-text-muted text-sm mt-2 font-mono tracking-wider animate-fade-in">
        {t('home_aiPlatform')}
      </p>
    </>
  )
}

export function HomeCtaButtons() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
      <Link href="/engine" className="btn-neon-amber">
        <span className="mr-2">🧪</span>{t('home_ctaEngine')}
      </Link>
      <Link href="/academy" className="btn-neon-cyan">
        <span className="mr-2">🎓</span>{t('home_ctaAcademy')}
      </Link>
      <Link href="/recipes"
        className="border border-charcoal-600 text-text-secondary px-6 py-3 text-sm tracking-widest uppercase
                   hover:border-neon-amber hover:text-neon-amber transition-all duration-300
                   inline-flex items-center justify-center gap-2"
      >
        <span>📚</span>{t('home_ctaRecipes')}
      </Link>
    </div>
  )
}

export function HomeSectionTitle({ subtitleKey, titleKey }: { subtitleKey: string; titleKey: string }) {
  const { t } = useI18n()

  return (
    <div className="text-center mb-12">
      <p className="font-mono text-xs text-neon-cyan tracking-[0.3em] uppercase mb-3">
        {t(subtitleKey as any)}
      </p>
      <h2 className="font-display text-3xl md:text-4xl text-text-warm">
        {t(titleKey as any)}
      </h2>
    </div>
  )
}
