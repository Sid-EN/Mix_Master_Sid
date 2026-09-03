'use client'

import Link from 'next/link'
import { useAuth } from './AuthContext'

/** 導覽列的帳號入口；未登入顯示登入提示，已登入顯示名稱首字。 */
export default function AccountLink() {
  const { user, ready } = useAuth()

  // 尚未確認登入狀態前不顯示，避免已登入者看到「登入」一閃而過
  if (!ready) return <span className="w-8" aria-hidden="true" />

  if (!user) {
    return (
      <Link
        href="/account"
        className="px-2.5 py-1 border border-charcoal-700 font-mono text-[10px]
                   text-charcoal-500 hover:border-neon-amber hover:text-neon-amber
                   transition-colors tracking-widest rounded-sm"
      >
        登入
      </Link>
    )
  }

  const initial = (user.displayName || user.email).trim().charAt(0).toUpperCase()

  return (
    <Link
      href="/account"
      title={`${user.displayName}（${user.email}）`}
      aria-label={`帳號：${user.displayName}`}
      className="w-7 h-7 rounded-full border border-neon-amber/60 text-neon-amber
                 flex items-center justify-center font-mono text-xs
                 hover:bg-neon-amber/10 transition-colors"
    >
      {initial}
    </Link>
  )
}
