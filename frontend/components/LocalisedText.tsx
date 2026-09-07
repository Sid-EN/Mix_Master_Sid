'use client'

/**
 * 依目前語言顯示配方內容
 *
 * 配方頁是 Server Component，但語言選擇存在瀏覽器端，伺服器無從得知。
 * 因此兩種語言都送到前端，由此元件依當下語言挑選。
 *
 * 版面寫在元件內部而非以 render prop 傳入：Server Component 不能把
 * 函式當成 props 傳給 Client Component（會直接 500）。
 *
 * 尚未翻譯的欄位回退到中文原文，而不是留白——
 * 看得懂中文的人至少還讀得到內容，留白則是什麼都沒有。
 */
import { useI18n } from './I18nContext'

/** 目前只有英文譯本；其他語言一併回退到中文原文。 */
function pick<T>(zh: T, en: T | undefined | null, locale: string): [T, boolean] {
  if (locale !== 'zh-TW' && en !== undefined && en !== null) {
    const empty = Array.isArray(en) ? en.length === 0 : !en
    if (!empty) return [en, true]
  }
  return [zh, false]
}

/** 明說「這段還沒翻譯」，比讓人以為網站壞了好。 */
function UntranslatedHint({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <p className="font-mono text-[10px] text-charcoal-500 mt-2">
      This section is not yet translated — showing the original Chinese.
    </p>
  )
}

export function LocalisedParagraph({
  zh, en, className, italic = false,
}: {
  zh: string
  en?: string
  className?: string
  italic?: boolean
}) {
  const { locale } = useI18n()
  const [value, translated] = pick(zh, en, locale)
  return (
    <>
      <p className={className} lang={translated ? 'en' : 'zh-Hant'}>
        {italic ? <em>{value}</em> : value}
      </p>
      <UntranslatedHint show={locale !== 'zh-TW' && !translated} />
    </>
  )
}

export function LocalisedSteps({ zh, en }: { zh: string[]; en?: string[] }) {
  const { locale } = useI18n()
  const [steps, translated] = pick(zh, en, locale)
  return (
    <>
      <ol className="space-y-4 list-none" lang={translated ? 'en' : 'zh-Hant'}>
        {steps.map((text, i) => (
          <li key={i} className="flex gap-5">
            <span className="font-mono text-2xl font-bold text-neon-amber/80 text-neon-glow-amber
                             w-10 shrink-0 text-right">
              {String(i + 1).padStart(2, '0')}.
            </span>
            <p className="text-text-secondary leading-relaxed pt-1">{text}</p>
          </li>
        ))}
      </ol>
      <UntranslatedHint show={locale !== 'zh-TW' && !translated} />
    </>
  )
}

export function LocalisedTags({ zh, en }: { zh: string[]; en?: string[] }) {
  const { locale } = useI18n()
  const [items, translated] = pick(zh, en, locale)
  return (
    <>
      <div className="flex flex-wrap gap-2" lang={translated ? 'en' : 'zh-Hant'}>
        {items.map((item, i) => (
          <span
            key={i}
            className="font-mono text-xs px-3 py-1.5 bg-bg-tertiary border border-charcoal-700
                       text-text-secondary rounded-sm"
          >
            {item}
          </span>
        ))}
      </div>
      <UntranslatedHint show={locale !== 'zh-TW' && !translated} />
    </>
  )
}
