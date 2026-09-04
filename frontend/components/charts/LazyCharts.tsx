'use client'

import dynamic from 'next/dynamic'

/**
 * recharts 以動態載入方式引入。
 *
 * 靜態匯入時，這個約 340 KB 的圖表函式庫會併入頁面的初始 bundle，
 * 使 /tools/cost、/compare、/engine 三頁的 JS 由約 550 KB 增至約 900 KB，
 * 但圖表其實位於畫面下方且非首屏必要。改為動態載入後只在實際渲染時才取得。
 *
 * ssr: false —— 圖表需量測容器尺寸，本就無法於伺服器端有意義地渲染。
 * 選項須為物件字面值：Turbopack 於編譯期解析此參數，無法追蹤共用變數。
 */

export const ResponsiveContainer = dynamic(
  () => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })
export const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
export const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false })
export const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false })
export const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
export const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false })
export const RadarChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false })
export const PolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false })
export const PolarAngleAxis = dynamic(
  () => import('recharts').then(m => m.PolarAngleAxis), { ssr: false })
export const PolarRadiusAxis = dynamic(
  () => import('recharts').then(m => m.PolarRadiusAxis), { ssr: false })
export const Radar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false })
