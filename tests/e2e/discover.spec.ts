import { test, expect, assertClean } from './fixtures'

/**
 * 公開配方目錄與追蹤創作者（新功能 7、9）
 *
 * 最重要的一條界線：只產生分享連結不等於公開。
 * 使用者以為把連結傳給朋友，作品卻出現在全站目錄，是不能發生的事。
 */
const password = 'a-good-password'
const uniqueEmail = () => `dis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

type Request = import('@playwright/test').APIRequestContext

async function apiAccount(request: Request) {
  const r = await request.post('/api/v1/auth/register',
    { data: { email: uniqueEmail(), password } })
  expect(r.status()).toBe(201)
  const body = await r.json()
  return { headers: { Authorization: `Bearer ${body.access_token}` } }
}

async function createRecipe(request: Request, headers: Record<string, string>, name: string) {
  const r = await request.post('/api/v1/recipes', {
    headers,
    data: { nameZh: name, ingredients: [{ slug: 'tanqueray-gin', amount: 2, unit: 'oz' }] },
  })
  expect(r.status()).toBe(201)
  return (await r.json()).slug as string
}

async function myId(request: Request, headers: Record<string, string>) {
  return (await (await request.get('/api/v1/auth/me', { headers })).json()).id as number
}

test.describe('公開目錄 API 契約', () => {
  test('僅產生分享連結不會出現在公開目錄', async ({ request }) => {
    const { headers } = await apiAccount(request)
    const slug = await createRecipe(request, headers, `只分享-${Date.now()}`)
    await request.post(`/api/v1/recipes/${slug}/share`, { headers })

    const listed = await (await request.get('/api/v1/discover/recipes?limit=100')).json()
    expect(listed.items.map((i: { slug: string }) => i.slug)).not.toContain(slug)
  })

  test('發布後可在目錄找到並點得進去', async ({ request }) => {
    const { headers } = await apiAccount(request)
    const name = `公開作品-${Date.now()}`
    const slug = await createRecipe(request, headers, name)
    const published = await request.post(`/api/v1/discover/recipes/${slug}/publish`, { headers })
    expect(published.status()).toBe(200)

    const found = await (await request.get(`/api/v1/discover/recipes?q=${encodeURIComponent(name)}`)).json()
    expect(found.items).toHaveLength(1)
    // 目錄上的配方必須有可開啟的網址，否則列表只是死的
    const shared = await request.get(`/api/v1/recipes/shared/${found.items[0].shareToken}`)
    expect(shared.status()).toBe(200)
  })

  test('目錄不外洩電子郵件', async ({ request }) => {
    const { headers } = await apiAccount(request)
    const slug = await createRecipe(request, headers, `檢查外洩-${Date.now()}`)
    await request.post(`/api/v1/discover/recipes/${slug}/publish`, { headers })
    const body = await (await request.get('/api/v1/discover/recipes?limit=100')).text()
    expect(body).not.toMatch(/@example\.com/)
  })

  test('他人無法發布你的配方', async ({ request }) => {
    const owner = await apiAccount(request)
    const other = await apiAccount(request)
    const slug = await createRecipe(request, owner.headers, `他人不可發布-${Date.now()}`)
    const r = await request.post(`/api/v1/discover/recipes/${slug}/publish`,
      { headers: other.headers })
    expect(r.status()).toBe(404)
  })

  test('下架後目錄找不到，但既有連結仍可開啟', async ({ request }) => {
    const { headers } = await apiAccount(request)
    const name = `會下架-${Date.now()}`
    const slug = await createRecipe(request, headers, name)
    const token = (await (await request.post(
      `/api/v1/discover/recipes/${slug}/publish`, { headers })).json()).shareToken

    expect((await request.delete(`/api/v1/discover/recipes/${slug}/publish`,
      { headers })).status()).toBe(204)

    const listed = await (await request.get(`/api/v1/discover/recipes?q=${encodeURIComponent(name)}`)).json()
    expect(listed.items).toHaveLength(0)
    expect((await request.get(`/api/v1/recipes/shared/${token}`)).status()).toBe(200)
  })
})

test.describe('追蹤 API 契約', () => {
  test('追蹤後動態牆只顯示追蹤對象的公開作品', async ({ request }) => {
    const follower = await apiAccount(request)
    const author = await apiAccount(request)
    const stranger = await apiAccount(request)

    const wanted = await createRecipe(request, author.headers, `想看的-${Date.now()}`)
    const unwanted = await createRecipe(request, stranger.headers, `不想看的-${Date.now()}`)
    await request.post(`/api/v1/discover/recipes/${wanted}/publish`, { headers: author.headers })
    await request.post(`/api/v1/discover/recipes/${unwanted}/publish`, { headers: stranger.headers })

    const authorId = await myId(request, author.headers)
    expect((await request.post(`/api/v1/discover/creators/${authorId}/follow`,
      { headers: follower.headers })).status()).toBe(204)

    const feed = await (await request.get('/api/v1/discover/feed',
      { headers: follower.headers })).json()
    const slugs = feed.items.map((i: { slug: string }) => i.slug)
    expect(slugs).toContain(wanted)
    expect(slugs).not.toContain(unwanted)
  })

  test('不能追蹤自己', async ({ request }) => {
    const { headers } = await apiAccount(request)
    const id = await myId(request, headers)
    expect((await request.post(`/api/v1/discover/creators/${id}/follow`, { headers })).status())
      .toBe(422)
  })

  test('追蹤名單為追蹤者私有', async ({ request }) => {
    const a = await apiAccount(request)
    const b = await apiAccount(request)
    await request.post(`/api/v1/discover/creators/${await myId(request, b.headers)}/follow`,
      { headers: a.headers })
    const seenByB = await (await request.get('/api/v1/discover/following',
      { headers: b.headers })).json()
    expect(seenByB.total).toBe(0)
  })

  test('未登入無法追蹤', async ({ request }) => {
    expect((await request.post('/api/v1/discover/creators/1/follow')).status()).toBe(401)
  })
})

test.describe('公開目錄介面', () => {
  test('未登入可瀏覽目錄', async ({ page, request, errors }) => {
    const { headers } = await apiAccount(request)
    const name = `介面測試-${Date.now()}`
    const slug = await createRecipe(request, headers, name)
    await request.post(`/api/v1/discover/recipes/${slug}/publish`, { headers })

    await page.goto('/discover', { waitUntil: 'networkidle' })
    await page.fill('#discover-q', name)
    await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 })
    assertClean(errors)
  })

  test('未登入時追蹤動態改為引導登入', async ({ page, errors }) => {
    await page.goto('/discover', { waitUntil: 'networkidle' })
    await page.getByRole('tab', { name: '追蹤動態' }).click()
    await expect(page.getByText('登入後即可看到追蹤對象的最新作品')).toBeVisible()
    assertClean(errors)
  })

  test('可切換排序而不出錯', async ({ page, errors }) => {
    await page.goto('/discover', { waitUntil: 'networkidle' })
    await page.selectOption('#discover-sort', 'rating')
    await page.waitForTimeout(800)
    await page.selectOption('#discover-sort', 'name')
    await page.waitForTimeout(800)
    assertClean(errors)
  })
})
