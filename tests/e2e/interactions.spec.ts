import { test, expect, assertClean } from './fixtures'

/**
 * 按鈕行為
 *
 * 針對「點擊無效、無法點擊、動作錯誤」這一類問題：
 * 破壞性操作必須先確認、只在真的可用時才顯示按鈕、
 * 停用時要看得出原因，以及畫面上的控制項要真的按得到。
 */
const password = 'a-good-password'
const uniqueEmail = () => `btn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

type Page = import('@playwright/test').Page

async function register(page: Page) {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.click('button[role=tab]:has-text("註冊")')
  await page.fill('input[type=email]', uniqueEmail())
  await page.fill('input[type=password]', password)
  await page.click('button[type=submit]')
  await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
}

async function createRecipe(page: Page, name: string) {
  await page.goto('/recipes/new', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.locator('input').first().fill(name)
  await page.selectOption('select[aria-label="材料 1"]', 'tanqueray-gin')
  await page.fill('input[aria-label="用量 1"]', '2')
  await page.click('button[type=submit]')
  await page.waitForTimeout(1800)
}

test.describe('破壞性操作需二次確認', () => {
  test('刪除配方要按兩次才生效', async ({ page }) => {
    const name = `刪除測試-${Date.now()}`
    await register(page)
    await createRecipe(page, name)
    await page.goto('/recipes/mine', { waitUntil: 'networkidle' })
    // 名稱同時出現在中文與英文欄位，取第一個即可
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: '刪除' }).first().click()
    await expect(page.getByRole('button', { name: '確認刪除？' })).toBeVisible()
    // 第一次點擊絕不能真的刪除
    await expect(page.getByText(name).first()).toBeVisible()

    await page.getByRole('button', { name: '確認刪除？' }).click()
    await expect(page.getByText(name).first()).toBeHidden({ timeout: 10_000 })
  })

  test('清空酒櫃要按兩次才生效', async ({ page }) => {
    await page.goto('/my-bar', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await page.locator('button[aria-pressed]').first().click()
    await page.waitForTimeout(400)

    await page.getByRole('button', { name: '清除全部' }).click()
    await expect(page.getByRole('button', { name: '確認清除全部？' })).toBeVisible()
    // 尚未確認，酒櫃內容仍在
    expect(await page.evaluate(() =>
      JSON.parse(localStorage.getItem('mixmaster-my-bar') || '[]').length)).toBeGreaterThan(0)

    await page.getByRole('button', { name: '確認清除全部？' }).click()
    await page.waitForTimeout(600)
    expect(await page.evaluate(() =>
      JSON.parse(localStorage.getItem('mixmaster-my-bar') || '[]').length)).toBe(0)
  })
})

test.describe('按鈕只在可用時出現', () => {
  test('第三人看不到別人留言的刪除鍵', async ({ page, request }) => {
    // 準備：擁有者分享配方，另一人留言
    const mk = async () => {
      const r = await request.post('/api/v1/auth/register',
        { data: { email: uniqueEmail(), password } })
      return { Authorization: `Bearer ${(await r.json()).access_token}` }
    }
    const owner = await mk()
    const commenter = await mk()
    const created = await request.post('/api/v1/recipes', {
      headers: owner,
      data: { nameZh: `留言權限-${Date.now()}`,
              ingredients: [{ slug: 'tanqueray-gin', amount: 2, unit: 'oz' }] },
    })
    const slug = (await created.json()).slug
    const shareToken = (await (await request.post(
      `/api/v1/recipes/${slug}/share`, { headers: owner })).json()).shareToken
    await request.post(`/api/v1/community/${shareToken}/comments`,
      { headers: commenter, data: { body: '別人的留言' } })

    // 第三人登入後瀏覽
    await register(page)
    await page.goto(`/shared/${shareToken}`, { waitUntil: 'networkidle' })
    await expect(page.getByText('別人的留言')).toBeVisible({ timeout: 10_000 })
    // 後端不會讓第三人刪除，因此按鈕根本不該出現
    await expect(page.getByRole('button', { name: '刪除' })).toHaveCount(0)
  })

  test('留言者看得到自己留言的刪除鍵', async ({ page, request }) => {
    const mk = async () => {
      const r = await request.post('/api/v1/auth/register',
        { data: { email: uniqueEmail(), password } })
      return await r.json()
    }
    const owner = await mk()
    const commenter = await mk()
    const created = await request.post('/api/v1/recipes', {
      headers: { Authorization: `Bearer ${owner.access_token}` },
      data: { nameZh: `自己的留言-${Date.now()}`,
              ingredients: [{ slug: 'tanqueray-gin', amount: 2, unit: 'oz' }] },
    })
    const slug = (await created.json()).slug
    const shareToken = (await (await request.post(`/api/v1/recipes/${slug}/share`,
      { headers: { Authorization: `Bearer ${owner.access_token}` } })).json()).shareToken
    await request.post(`/api/v1/community/${shareToken}/comments`, {
      headers: { Authorization: `Bearer ${commenter.access_token}` },
      data: { body: '我自己的留言' },
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.evaluate(t => localStorage.setItem('mixmaster-token', t), commenter.access_token)
    await page.goto(`/shared/${shareToken}`, { waitUntil: 'networkidle' })
    await expect(page.getByText('我自己的留言')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: '刪除' })).toHaveCount(1)
  })
})

test.describe('停用狀態要說得出原因', () => {
  test('只剩一項材料時移除鍵明確停用', async ({ page, errors }) => {
    await page.goto('/tools/nutrition', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    const remove = page.getByRole('button', { name: '移除此材料' }).first()
    // 先前是可按但點了沒反應，看起來就像壞掉
    await expect(remove).toBeDisabled()
    await expect(remove).toHaveAttribute('title', '至少需要保留一項材料')
    assertClean(errors)
  })

  test('未填電子郵件時仍可點「忘記密碼」並得到提示', async ({ page }) => {
    await page.goto('/account', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const forgot = page.getByRole('button', { name: '忘記密碼？' })
    // 先前在未填 email 時直接停用，忘記密碼的人反而點不了
    await expect(forgot).toBeEnabled()
    await forgot.click()
    await expect(page.getByText(/請先輸入註冊時使用的電子郵件/)).toBeVisible()
  })
})

test.describe('控制項要按得到', () => {
  test('辭典的 A–Z 跳段在小視窗也全部可點', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/glossary', { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)

    const letters = await page.evaluate(() =>
      [...document.querySelectorAll('nav[aria-label="字母快速跳段"] button')]
        .filter(el => !(el as HTMLButtonElement).disabled)
        .map(el => el.textContent?.trim() ?? ''))
    expect(letters.length).toBeGreaterThan(10)

    // 側欄高於視窗；先前 sticky 讓下半部字母永遠停在畫面外，完全點不到
    for (const letter of letters) {
      await page.locator(`button[aria-label="Jump to ${letter}"]`).click({ timeout: 5000 })
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(80)
    }
  })
})
