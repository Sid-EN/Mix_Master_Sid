import { LOCALES, LOCALE_META, DEFAULT_LOCALE } from '@/lib/i18n'
import zhTW from '@/lib/locales/zh-TW'
import en from '@/lib/locales/en'
import ja from '@/lib/locales/ja'

const BUNDLES = { 'zh-TW': zhTW, en, ja } as unknown as Record<string, Record<string, string>>

describe('i18n', () => {
  it('預設語系包含在支援清單中', () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE)
  })

  it('每個語系都有顯示資訊', () => {
    LOCALES.forEach(l => {
      expect(LOCALE_META[l]).toBeDefined()
      expect(LOCALE_META[l].labelNative).toBeTruthy()
    })
  })

  it.each(LOCALES)('%s 的翻譯鍵與預設語系一致', (locale) => {
    const base = Object.keys(BUNDLES[DEFAULT_LOCALE]).sort()
    const keys = Object.keys(BUNDLES[locale]).sort()
    const missing = base.filter(k => !keys.includes(k))
    const extra = keys.filter(k => !base.includes(k))
    expect({ missing, extra }).toEqual({ missing: [], extra: [] })
  })

  it.each(LOCALES)('%s 沒有空白翻譯', (locale) => {
    const empty = Object.entries(BUNDLES[locale])
      .filter(([, v]) => typeof v === 'string' && v.trim() === '')
      .map(([k]) => k)
    expect(empty).toEqual([])
  })
})
