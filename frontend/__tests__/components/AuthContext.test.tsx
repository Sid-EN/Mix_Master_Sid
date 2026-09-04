/**
 * 登入狀態管理測試
 *
 * 重點：權杖的保存與還原、登出時清除同步狀態、
 * 變更密碼後套用新權杖（否則使用者會因舊權杖失效而立刻被登出）。
 */
import { useState } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/AuthContext'

const USER = { id: 1, email: 'alice@example.com', displayName: 'Alice' }

function Probe() {
  const { user, token, ready, login, register, logout, applyToken } = useAuth()
  const [error, setError] = useState('')
  const guard = (fn: () => Promise<void>) => () => {
    fn().catch((e: Error) => setError(e.message))
  }
  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="email">{user?.email ?? '-'}</span>
      <span data-testid="token">{token ?? '-'}</span>
      <span data-testid="error">{error}</span>
      <button onClick={guard(() => login('a@b.c', 'pw'))}>login</button>
      <button onClick={guard(() => register('a@b.c', 'pw', 'Alice'))}>register</button>
      <button onClick={logout}>logout</button>
      <button onClick={() => applyToken('new-token', { ...USER, displayName: 'Renamed' })}>
        apply
      </button>
    </div>
  )
}

function renderProbe() {
  return render(<AuthProvider><Probe /></AuthProvider>)
}

function mockJson(body: any, ok = true, status = 200) {
  global.fetch = jest.fn(() => Promise.resolve({
    ok, status, json: async () => body,
  } as Response)) as any
}

beforeEach(() => {
  localStorage.clear()
  jest.restoreAllMocks()
})

describe('初始狀態', () => {
  it('無權杖時直接標記為就緒且未登入', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
    expect(screen.getByTestId('email')).toHaveTextContent('-')
  })

  it('有權杖時以其還原帳號', async () => {
    localStorage.setItem('mixmaster-token', 'stored-token')
    mockJson(USER)
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('alice@example.com'))
  })

  it('權杖失效時清除，避免每次載入都重試', async () => {
    localStorage.setItem('mixmaster-token', 'expired')
    mockJson({}, false, 401)
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))
    expect(localStorage.getItem('mixmaster-token')).toBeNull()
    expect(screen.getByTestId('email')).toHaveTextContent('-')
  })
})

describe('登入與註冊', () => {
  it('登入後保存權杖與帳號', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))

    mockJson({ access_token: 'jwt-abc', user: USER })
    await act(async () => { screen.getByText('login').click() })

    expect(screen.getByTestId('token')).toHaveTextContent('jwt-abc')
    expect(localStorage.getItem('mixmaster-token')).toBe('jwt-abc')
  })

  it('註冊後同樣保存權杖', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))

    mockJson({ access_token: 'jwt-new', user: USER })
    await act(async () => { screen.getByText('register').click() })

    expect(localStorage.getItem('mixmaster-token')).toBe('jwt-new')
  })

  it('登入失敗時拋出可讀的錯誤訊息', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))

    mockJson({ detail: '電子郵件或密碼錯誤' }, false, 401)
    await act(async () => { screen.getByText('login').click() })

    expect(screen.getByTestId('error')).toHaveTextContent('電子郵件或密碼錯誤')
    // 失敗不應留下權杖
    expect(localStorage.getItem('mixmaster-token')).toBeNull()
  })
})

describe('登出', () => {
  it('清除權杖、帳號與同步狀態', async () => {
    localStorage.setItem('mixmaster-token', 'stored')
    localStorage.setItem('mixmaster-sync-state', '{"my-bar":"[]"}')
    mockJson(USER)
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('alice@example.com'))

    await act(async () => { screen.getByText('logout').click() })

    expect(localStorage.getItem('mixmaster-token')).toBeNull()
    expect(screen.getByTestId('email')).toHaveTextContent('-')
    // 否則下一位登入者會沿用前一位的已同步紀錄
    expect(localStorage.getItem('mixmaster-sync-state')).toBeNull()
  })
})

describe('applyToken', () => {
  it('套用新權杖並更新帳號', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))

    // 變更密碼會使舊權杖失效，必須立即改用回傳的新權杖
    await act(async () => { screen.getByText('apply').click() })

    expect(screen.getByTestId('token')).toHaveTextContent('new-token')
    expect(localStorage.getItem('mixmaster-token')).toBe('new-token')
  })
})

describe('儲存空間異常', () => {
  it('無法寫入 localStorage 時仍可登入', async () => {
    renderProbe()
    await waitFor(() => expect(screen.getByTestId('ready')).toHaveTextContent('true'))

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    mockJson({ access_token: 'jwt-abc', user: USER })
    await act(async () => { screen.getByText('login').click() })

    // 記憶體中的狀態仍應正確，僅是無法跨重新整理保存
    expect(screen.getByTestId('token')).toHaveTextContent('jwt-abc')
  })
})

describe('useAuth', () => {
  it('在 Provider 之外使用會明確報錯', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/AuthProvider/)
    spy.mockRestore()
  })
})
