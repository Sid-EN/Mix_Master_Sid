import { test, expect, assertClean } from './fixtures'

/** 資料備份 (H)：匯出為 JSON 檔、由備份還原。 */
const password = 'a-good-password'
const uniqueEmail = () => `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

async function registerVia(page: import('@playwright/test').Page) {
  await page.goto('/account', { waitUntil: 'networkidle' })
  await page.click('button[role=tab]:has-text("註冊")')
  await page.fill('input[type=email]', uniqueEmail())
  await page.fill('input[type=password]', password)
  await page.click('button[type=submit]')
  await expect(page.getByText('我的帳號')).toBeVisible({ timeout: 15_000 })
  return page.evaluate(() => localStorage.getItem('mixmaster-token'))
}

async function apiAccount(request: import('@playwright/test').APIRequestContext) {
  const r = await request.post('/api/v1/auth/register',
    { data: { email: uniqueEmail(), password } })
  return { Authorization: `Bearer ${(await r.json()).access_token}` }
}

test.describe('備份介面', () => {
  test('可匯出備份檔', async ({ page, request, errors }) => {
    const token = await registerVia(page)
    await request.put('/api/v1/sync/my-bar',
      { data: { value: ['tanqueray-gin'] }, headers: { Authorization: `Bearer ${token}` } })

    await page.goto('/account', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const download = page.waitForEvent('download', { timeout: 15_000 })
    await page.click('button:has-text("匯出備份")')
    const file = await download
    expect(file.suggestedFilename()).toMatch(/^mixmaster-backup-\d{4}-\d{2}-\d{2}\.json$/)
    await expect(page.getByText(/已匯出/)).toBeVisible({ timeout: 10_000 })
    assertClean(errors)
  })

  test('說明匯入為合併式還原', async ({ page }) => {
    await registerVia(page)
    await page.goto('/account', { waitUntil: 'networkidle' })
    await expect(page.getByText('不會刪除現有資料')).toBeVisible()
  })
})

test.describe('備份 API 契約', () => {
  test('匯出與匯入需要認證', async ({ request }) => {
    expect((await request.get('/api/v1/backup/export')).status()).toBe(401)
    expect((await request.post('/api/v1/backup/import', { data: { version: 1 } })).status()).toBe(401)
  })

  test('備份可還原至另一帳號', async ({ request }) => {
    const alice = await apiAccount(request)
    const bob = await apiAccount(request)

    await request.put('/api/v1/sync/my-bar',
      { data: { value: ['tanqueray-gin', 'campari'] }, headers: alice })
    await request.post('/api/v1/recipes', {
      data: {
        nameZh: '備份配方', method: 'build',
        ingredients: [{ slug: 'tanqueray-gin', amount: 2 }], steps: ['加冰'],
      }, headers: alice,
    })

    const backup = await (await request.get('/api/v1/backup/export', { headers: alice })).json()
    const res = await request.post('/api/v1/backup/import', { data: backup, headers: bob })
    expect(res.status()).toBe(200)

    const synced = await (await request.get('/api/v1/sync', { headers: bob })).json()
    expect(synced['my-bar']).toEqual(['tanqueray-gin', 'campari'])
    const mine = await (await request.get('/api/v1/recipes/mine', { headers: bob })).json()
    expect(mine.total).toBe(1)
  })

  test('略過白名單之外的資料', async ({ request }) => {
    const headers = await apiAccount(request)
    const body = await (await request.post('/api/v1/backup/import', {
      data: { version: 1, data: { 'my-bar': ['campari'], arbitrary: { x: 1 } } }, headers,
    })).json()
    expect(body.importedKeys).toEqual(['my-bar'])
    expect(body.skippedKeys).toContain('arbitrary')
  })

  test('拒絕更高版本的備份格式', async ({ request }) => {
    const headers = await apiAccount(request)
    expect((await request.post('/api/v1/backup/import',
      { data: { version: 999 }, headers })).status()).toBe(422)
  })

  test('匯出不含分享權杖', async ({ request }) => {
    const headers = await apiAccount(request)
    const created = await request.post('/api/v1/recipes', {
      data: {
        nameZh: '分享中', method: 'build',
        ingredients: [{ slug: 'tanqueray-gin', amount: 2 }], steps: ['加冰'],
      }, headers,
    })
    const id = (await created.json()).id
    await request.post(`/api/v1/recipes/${id}/share`, { headers })
    const backup = await (await request.get('/api/v1/backup/export', { headers })).json()
    expect(JSON.stringify(backup)).not.toContain('shareToken')
  })
})

test.describe('列印', () => {
  test('分享頁提供列印按鈕', async ({ page, request, errors }) => {
    const headers = await apiAccount(request)
    const created = await request.post('/api/v1/recipes', {
      data: {
        nameZh: '可列印配方', method: 'build',
        ingredients: [{ slug: 'tanqueray-gin', amount: 2 }], steps: ['加冰'],
      }, headers,
    })
    const id = (await created.json()).id
    const token = (await (await request.post(`/api/v1/recipes/${id}/share`, { headers })).json()).shareToken

    await page.goto(`/shared/${token}`, { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /列印配方/ })).toBeVisible()
    assertClean(errors)
  })
})
