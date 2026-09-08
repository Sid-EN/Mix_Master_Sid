'use client'

/**
 * 需要二次確認的按鈕
 *
 * 破壞性操作（刪除配方、清空酒櫃、刪除留言）先前都是一點就執行，
 * 誤點一次資料就沒了，且多半無法復原。
 *
 * 採用「同一顆按鈕按兩次」而非瀏覽器的 confirm()：
 * confirm() 會凍結整個分頁、在某些情境下被瀏覽器封鎖，
 * 外觀也與站台格格不入。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export default function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = '確認？',
  disabled = false,
  className = '',
  confirmClassName = '',
  timeoutMs = 5000,
  'aria-label': ariaLabel,
}: {
  onConfirm: () => void
  children: React.ReactNode
  confirmLabel?: string
  disabled?: boolean
  className?: string
  confirmClassName?: string
  timeoutMs?: number
  'aria-label'?: string
}) {
  const [armed, setArmed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const disarm = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setArmed(false)
  }, [])

  // 元件卸載時清掉計時器，否則會對已移除的元件 setState
  useEffect(() => disarm, [disarm])

  const handle = () => {
    if (!armed) {
      setArmed(true)
      // 沒有第二次點擊就自動復原，避免按鈕一直停在待確認狀態
      timer.current = setTimeout(() => setArmed(false), timeoutMs)
      return
    }
    disarm()
    onConfirm()
  }

  return (
    <button
      type="button"
      onClick={handle}
      onBlur={disarm}
      disabled={disabled}
      aria-label={ariaLabel}
      className={armed ? confirmClassName || className : className}
    >
      {armed ? confirmLabel : children}
    </button>
  )
}
