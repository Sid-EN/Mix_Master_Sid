'use client'

/**
 * 分享對話框
 *
 * 複製連結只在「傳給不在場的人」時有用。把手機拿給對面的人看時，
 * 掃碼才是順手的做法，因此連結與 QR 碼並列。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { QrError, qrSvg } from '@/lib/qrcode'
import Portal from './Portal'
import { useScrollLock } from '../lib/useScrollLock'

export default function ShareDialog({
  url,
  title,
  onClose,
}: {
  url: string
  title: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const svg = useMemo(() => {
    try {
      return qrSvg(url, { size: 220 })
    } catch (err) {
      // 網址異常地長時寧可只顯示連結，也不要顯示一張掃不出來的圖
      if (err instanceof QrError) return null
      throw err
    }
  }, [url])

  // 對話框開啟時鎖住背景捲動
  useScrollLock(true)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 非安全來源時瀏覽器會拒絕剪貼簿存取，退而讓使用者自行選取
      window.prompt('複製此連結：', url)
    }
  }

  const download = () => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `${title || 'mixmaster'}-qrcode.svg`
    a.click()
    URL.revokeObjectURL(href)
  }

  return (
    /* Portal：祖先的 transform 會讓 fixed 錨定錯位，詳見 Portal.tsx */
    <Portal>
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm glass-card p-6"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`分享「${title}」`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-charcoal-500 tracking-wider">SHARE</p>
            <h2 className="font-display text-lg text-text-warm truncate">{title}</h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="關閉分享視窗"
            className="text-charcoal-500 hover:text-neon-amber transition-colors px-1"
          >
            ✕
          </button>
        </div>

        {svg ? (
          <div className="flex justify-center mb-4">
            <div
              className="bg-white p-3 rounded"
              // 內容由本機的編碼器產生，不含外部輸入
              dangerouslySetInnerHTML={{ __html: svg }}
              role="img"
              aria-label="分享連結的 QR Code"
            />
          </div>
        ) : (
          <p className="text-center text-text-muted font-mono text-xs py-6">
            此連結過長，無法產生 QR Code
          </p>
        )}

        <p className="font-mono text-[11px] text-charcoal-500 break-all mb-4 select-all">
          {url}
        </p>

        <div className="flex gap-2">
          <button
            onClick={copy}
            className="flex-1 px-3 py-2 font-mono text-xs border border-neon-amber/60 text-neon-amber
                       rounded hover:bg-neon-amber/10 transition-colors"
          >
            {copied ? '已複製' : '複製連結'}
          </button>
          {svg && (
            <button
              onClick={download}
              className="px-3 py-2 font-mono text-xs border border-charcoal-700 text-text-muted
                         rounded hover:border-neon-cyan hover:text-neon-cyan transition-colors"
            >
              下載 QR
            </button>
          )}
        </div>
      </div>
    </div>
    </Portal>
  )
}
