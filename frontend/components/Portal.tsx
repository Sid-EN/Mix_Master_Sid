'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * 把覆蓋層渲染到 <body> 底下。
 *
 * CSS 規範裡，只要祖先有 transform／filter／perspective／contain:paint，
 * 該祖先就會成為 position: fixed 的包含區塊——fixed 不再以視窗為準，
 * 而是以那個祖先為準。首頁的 .scroll-reveal 進場動畫正是這種祖先
 * （它永遠帶著 translateY，即使動畫結束也是 translateY(0) 而非 none），
 * 於是「風味偏好設定」從首頁區塊開啟時，整條頁尾按鈕列會被推到視窗外，
 * 使用者完全點不到「重置／取消／儲存偏好」。從 Navbar 開啟卻正常，
 * 因為那份渲染在頂層——同一個元件，位置不同就壞掉。
 *
 * 改用 portal 之後，覆蓋層永遠是 <body> 的子節點，
 * 不管被放在頁面多深的地方都不會再被祖先影響。
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // 伺服器端沒有 document，掛載後才能開洞
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}
