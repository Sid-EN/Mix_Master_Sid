'use client'

import { useEffect } from 'react'

/**
 * 對話框開啟時鎖住背景捲動。
 *
 * 沒有鎖的時候，滑鼠移到對話框外側滾動會捲到背後的頁面：
 * 對話框本身固定不動、背景卻在跑，看起來就像介面壞了。
 * 一併補上捲軸消失造成的寬度位移，避免版面橫向抖一下。
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { body } = document
    const prevOverflow = body.style.overflow
    const prevPadding = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadding
    }
  }, [active])
}
