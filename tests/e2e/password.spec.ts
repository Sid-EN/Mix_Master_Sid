import { test, expect, assertClean } from './fixtures'

/** 密碼管理 (I)：變更名稱、變更密碼、忘記密碼。 */
const uniqueEmail = () => `pw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function registerVia(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.click('button[role=tab]:has-text("註冊")')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  await page.click('button[type=submit]')
  await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
}

test.describe('帳號設定', () => {
  test('可更新顯示名稱', async ({ page, errors }) => {
    await registerVia(page, uniqueEmail(), 'first-password')
    await page.locator('section:has-text("帳號設定") input').first().fill('改過的名字')
    await page.click('button:has-text("更新名稱")')
    await expect(page.getByText('顯示名稱已更新')).toBeVisible({ timeout: 10_000 })
    assertClean(errors)
  })

  test('變更密碼後仍保持登入，且新密碼可用', async ({ page, errors }) => {
    const email = uniqueEmail()
    await registerVia(page, email, 'first-password')

    await page.locator('input[autocomplete="current-password"]').fill('first-password')
    await page.locator('input[autocomplete="new-password"]').fill('second-password')
    await page.click('button:has-text("變更密碼")')

    // 變更密碼會使舊權杖失效，前端須改用回傳的新權杖，否則會立刻被登出
    await expect(page.getByText('密碼已變更')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('我的帳號')).toBeVisible()

    await page.click('text=登出')
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', 'second-password')
    await page.click('button[type=submit]')
    await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
    assertClean(errors)
  })

  test('舊密碼在變更後失效', async ({ page, request }) => {
    const email = uniqueEmail()
    await registerVia(page, email, 'first-password')
    await page.locator('input[autocomplete="current-password"]').fill('first-password')
    await page.locator('input[autocomplete="new-password"]').fill('second-password')
    await page.click('button:has-text("變更密碼")')
    await expect(page.getByText('密碼已變更')).toBeVisible({ timeout: 10_000 })

    const res = await request.post('/api/v1/auth/login',
      { data: { email, password: 'first-password' } })
    expect(res.status(), '舊密碼不應仍可登入').toBe(401)
  })

  test('目前密碼錯誤時顯示提示', async ({ page }) => {
    await registerVia(page, uniqueEmail(), 'first-password')
    await page.locator('input[autocomplete="current-password"]').fill('wrong-password')
    await page.locator('input[autocomplete="new-password"]').fill('second-password')
    await page.click('button:has-text("變更密碼")')
    await expect(page.locator('section:has-text("帳號設定") p[role=alert]')).toContainText(/不正確/)
  })

  test('登出後表單回到登入模式', async ({ page }) => {
    await registerVia(page, uniqueEmail(), 'first-password')
    await page.click('text=登出')
    // 迴歸：先前停留在註冊分頁，導致既有帳號登入時回報「此電子郵件已註冊」
    await expect(page.locator('button[role=tab][aria-selected="true"]')).toHaveText('登入')
  })
})

test.describe('忘記密碼', () => {
  test('申請重設一律回報相同訊息', async ({ page, errors }) => {
    await page.goto('/account', { waitUntil: 'networkidle' })
    await page.fill('input[type=email]', uniqueEmail())
    await page.click('button:has-text("忘記密碼")')
    await expect(page.getByText('若該電子郵件已註冊')).toBeVisible({ timeout: 10_000 })
    assertClean(errors)
  })

  test('重設頁缺少權杖時給予提示', async ({ page, errors }) => {
    await page.goto('/account/reset', { waitUntil: 'networkidle' })
    await expect(page.getByText('缺少重設權杖')).toBeVisible()
    assertClean(errors)
  })
})

test.describe('密碼 API 契約', () => {
  test('未登入不可變更密碼', async ({ request }) => {
    const res = await request.post('/api/v1/auth/change-password',
      { data: { currentPassword: 'a', newPassword: 'a-good-password' } })
    expect(res.status()).toBe(401)
  })

  test('忘記密碼不透露帳號是否存在', async ({ request }) => {
    const known = await request.post('/api/v1/auth/forgot-password',
      { data: { email: 'nobody-at-all@example.com' } })
    expect(known.status()).toBe(202)
    expect(await known.text()).not.toContain('token')
  })

  test('無效的重設權杖被拒絕', async ({ request }) => {
    const res = await request.post('/api/v1/auth/reset-password',
      { data: { token: 'not-a-real-token', newPassword: 'a-good-password' } })
    expect(res.status()).toBe(400)
  })
})
