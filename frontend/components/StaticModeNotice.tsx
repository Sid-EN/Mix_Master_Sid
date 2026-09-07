'use client'

import Link from 'next/link'
import { FULL_APP_URL } from '@/lib/staticMode'

/**
 * 靜態版中，需要伺服器的功能改以此說明取代。
 *
 * 讓功能靜默失敗會使人以為是壞掉；明講「這是展示版」並指向完整版，
 * 才是誠實且有用的處理方式。
 */
export default function StaticModeNotice({ feature }: { feature: string }) {
  return (
    <main className="min-h-screen px-6 py-16 max-w-lg mx-auto">
      <Link href="/" className="font-mono text-xs text-charcoal-500 hover:text-neon-amber">
        ← 返回首頁
      </Link>

      <div className="glass-card p-8 mt-8">
        <p className="text-3xl mb-4">📖</p>
        <h1 className="font-display text-2xl text-text-warm mb-3">
          {feature}需要完整版
        </h1>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          你目前瀏覽的是<strong className="text-neon-amber">公開展示版</strong>，
          放在 GitHub Pages 上，只提供靜態內容。
          {feature}需要伺服器與資料庫才能運作。
        </p>

        <p className="font-mono text-xs text-text-muted mb-2">展示版仍可使用：</p>
        <ul className="font-mono text-xs text-text-muted space-y-1 mb-6">
          <li>· 51 道經典配方與 18 種備料的完整內容</li>
          <li>· 調酒學院 16 個單元</li>
          <li>· 各項計算器（ABV、稀釋、成本、營養、單位換算）</li>
          <li>· 風味輪、世界地圖、名人堂、測驗</li>
          <li>· 我的酒櫃與收藏（僅存於此瀏覽器，不跨裝置）</li>
        </ul>

        {FULL_APP_URL ? (
          <a
            href={FULL_APP_URL}
            className="inline-block px-4 py-2 font-mono text-xs rounded border border-neon-amber
                       text-neon-amber hover:bg-neon-amber/10 transition-colors"
          >
            前往完整版 →
          </a>
        ) : (
          <p className="font-mono text-[11px] text-charcoal-600">
            完整版尚未部署。
          </p>
        )}
      </div>
    </main>
  )
}
