// ESLint 9 flat config。
// Next 16 移除了 next lint（改為直接執行 eslint），設定格式亦由
// .eslintrc.json 遷移至此。eslint-config-next 16 已原生支援 flat config，
// 因此直接展開其匯出，不需 FlatCompat 轉接。
import coreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: ['node_modules/**', '.next/**', 'coverage/**', 'next-env.d.ts'],
  },
  ...coreWebVitals,
  {
    rules: {
      '@next/next/no-img-element': 'warn',

      // 本專案的客戶端資料（收藏、酒櫃、進度等）存於 localStorage，
      // 必須在 effect 中讀取後再 setState，否則伺服器與瀏覽器的首次渲染
      // 會不一致。這是 SSR 下的標準水合寫法，而非可直接改寫的缺陷；
      // 該規則針對的是 React Compiler，本專案尚未採用，故降為警告。
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default config
