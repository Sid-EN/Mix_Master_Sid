'use client'

import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'mixmaster-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches
    || (window.navigator as any).standalone === true
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * 安裝為應用程式的提示。
 *
 * Chrome 系瀏覽器提供 beforeinstallprompt 事件可直接觸發安裝；
 * iOS Safari 不支援該事件，只能引導使用者手動加入主畫面。
 * 已安裝或使用者關閉過提示時不再顯示。
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSHint, setShowIOSHint] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return
    } catch {
      /* 私密瀏覽可能拒絕存取 */
    }
    if (isStandalone()) return

    if (isIOS()) {
      setShowIOSHint(true)
      return
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()          // 阻止瀏覽器自帶的提示，改用本站樣式
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, '1') } catch { /* 忽略 */ }
    setDeferred(null)
    setShowIOSHint(false)
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    dismiss()
  }

  if (!deferred && !showIOSHint) return null

  return (
    <div
      role="dialog"
      aria-label="安裝 MixMaster"
      className="no-print fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50
                 glass-card p-4 border border-neon-amber/40"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">🍸</span>
        <div className="flex-1">
          <p className="font-display text-base text-text-warm mb-1">安裝 MixMaster</p>
          {showIOSHint ? (
            <p className="font-mono text-[11px] text-text-muted leading-relaxed">
              點選下方的「分享」按鈕，選擇「加入主畫面」即可安裝。
            </p>
          ) : (
            <p className="font-mono text-[11px] text-text-muted leading-relaxed">
              安裝後可離線瀏覽配方，並從主畫面直接開啟。
            </p>
          )}

          <div className="flex gap-2 mt-3">
            {deferred && (
              <button
                onClick={install}
                className="px-3 py-1.5 font-mono text-xs rounded border border-neon-amber
                           text-neon-amber hover:bg-neon-amber/10 transition-colors"
              >
                安裝
              </button>
            )}
            <button
              onClick={dismiss}
              className="px-3 py-1.5 font-mono text-xs rounded border border-charcoal-700
                         text-text-muted hover:text-text-warm transition-colors"
            >
              不用了
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
