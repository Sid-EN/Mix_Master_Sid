/**
 * 站台 metadata
 *
 * 兩個踩過的坑各有測試守著：
 * 1. 中介 layout 若只給字串標題，其下所有頁面都會失去站名後綴。
 * 2. 頁面一旦自行宣告 openGraph，就不會繼承根層的分享預覽圖。
 * 兩者都不會有錯誤訊息，只會讓搜尋結果與分享預覽悄悄變差。
 */
import { OG_IMAGE, SITE_NAME, absoluteUrl, pageMetadata, recipeJsonLd, summarise } from '@/lib/seo'

describe('absoluteUrl', () => {
  it('產生絕對網址', () => {
    expect(absoluteUrl('/recipes')).toMatch(/^https?:\/\/.+\/recipes$/)
  })

  it('根路徑不留下多餘的斜線', () => {
    expect(absoluteUrl('/')).not.toMatch(/\/$/)
  })

  it('接受未帶斜線的路徑', () => {
    expect(absoluteUrl('recipes')).toBe(absoluteUrl('/recipes'))
  })
})

describe('pageMetadata', () => {
  const meta = pageMetadata({ title: '配方資料庫', description: '51 道配方', path: '/recipes' })

  it('標題不自行帶上站名（由樣板負責）', () => {
    // 自己再加一次會變成「配方資料庫 — MixMaster — MixMaster」
    expect(meta.title).toBe('配方資料庫')
  })

  it('中介層額外提供樣板，讓子頁保有站名', () => {
    const seg = pageMetadata({ title: '實用工具', path: '/tools', isSegmentRoot: true })
    expect(seg.title).toEqual({ default: '實用工具', template: `%s — ${SITE_NAME}` })
  })

  it('一律帶上分享預覽圖', () => {
    expect(meta.openGraph?.images).toEqual([OG_IMAGE])
    expect(meta.twitter?.images).toEqual([OG_IMAGE.url])
  })

  it('canonical 與 og:url 為絕對網址', () => {
    expect(meta.alternates?.canonical).toBe(absoluteUrl('/recipes'))
    expect(meta.openGraph?.url).toBe(absoluteUrl('/recipes'))
  })

  it('og 標題帶上站名，讓分享出去看得出來源', () => {
    expect(meta.openGraph?.title).toBe(`配方資料庫 — ${SITE_NAME}`)
  })

  it('未給描述時使用站台預設', () => {
    expect(pageMetadata({ title: 'x' }).description).toBeTruthy()
  })
})

describe('summarise', () => {
  it('壓縮空白', () => {
    expect(summarise('a  b\n c')).toBe('a b c')
  })

  it('過長時截斷並加上刪節號', () => {
    const text = 'あ'.repeat(300)
    const out = summarise(text, 50)
    expect(out).toHaveLength(50)
    expect(out.endsWith('…')).toBe(true)
  })

  it('沒有內容時退回站台描述', () => {
    expect(summarise(undefined)).toBeTruthy()
  })
})

describe('recipeJsonLd', () => {
  const ld = recipeJsonLd({
    nameZh: '經典黛綺麗',
    nameEn: 'Classic Daiquiri',
    slug: 'classic-daiquiri',
    descriptionZh: '完美的蘭姆酸酒。',
    ingredients: [
      { nameZh: '白蘭姆酒', amount: 2, unit: 'oz' },
      { nameZh: '新鮮萊姆汁', amount: 0.75, unit: 'oz' },
    ],
    steps: ['搖盪 12 秒。', '雙重過濾。'],
    garnish: '萊姆輪切',
  })

  it('標示為食譜而非普通文章', () => {
    expect(ld['@type']).toBe('Recipe')
    expect(ld['@context']).toBe('https://schema.org')
  })

  it('材料含用量與單位', () => {
    expect(ld.recipeIngredient).toEqual(['白蘭姆酒 2 oz', '新鮮萊姆汁 0.75 oz'])
  })

  it('步驟依序編號', () => {
    const steps = ld.recipeInstructions as { position: number; text: string }[]
    expect(steps.map(s => s.position)).toEqual([1, 2, 3])
  })

  it('裝飾附在最後一個步驟', () => {
    const steps = ld.recipeInstructions as { text: string }[]
    expect(steps[steps.length - 1].text).toBe('裝飾：萊姆輪切')
  })

  it('沒有裝飾時不多出步驟', () => {
    const plain = recipeJsonLd({ nameZh: 'x', steps: ['a'] })
    expect(plain.recipeInstructions).toHaveLength(1)
  })

  it('資料不全時仍產生有效結構', () => {
    const bare = recipeJsonLd({})
    expect(bare['@type']).toBe('Recipe')
    expect(bare.recipeIngredient).toEqual([])
  })
})
