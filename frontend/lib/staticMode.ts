/**
 * 靜態匯出模式
 *
 * GitHub Pages 只能提供靜態檔案，無法執行後端與資料庫。
 * 靜態版保留經典配方、學院與各項計算器（這些資料本就在 repo 內），
 * 但帳號、同步、分享、社群與智慧配方引擎需要伺服器，於此模式下停用。
 *
 * 以建置期的環境變數決定，同一份程式碼可同時產出兩種版本。
 */
export const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_MODE === '1'

/** 完整版的網址，靜態版用於引導使用者前往可用的完整功能。 */
export const FULL_APP_URL = process.env.NEXT_PUBLIC_FULL_APP_URL || ''
