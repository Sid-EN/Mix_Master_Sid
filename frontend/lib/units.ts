/**
 * 調酒用量的單位換算
 *
 * 換算表與後端 backend/engine/balance_model.py 的 VOLUME_OZ 一致；
 * 該處以 oz 為基準，此處以 ml 為基準（採購與庫存都以 ml 計）。
 * 兩邊若不同步，同一份配方在購物清單與平衡分析中會得到不同的用量。
 *
 * 「顆」「片」「葉」之類的單位無法換算成容積，也不應該假裝可以——
 * 一片檸檬換算成幾毫升沒有意義。這些一律回傳 null，由呼叫端另行處理。
 */
export const OZ_TO_ML = 29.5735

/** 各單位對應的毫升數 */
export const VOLUME_ML: Record<string, number> = {
  oz: OZ_TO_ML,
  ml: 1,
  cl: 10,
  tsp: OZ_TO_ML / 6,
  bsp: OZ_TO_ML / 8,
  dash: OZ_TO_ML / 32,
  dashes: OZ_TO_ML / 32,
  drop: OZ_TO_ML / 600,
  drops: OZ_TO_ML / 600,
  // 糖、鹽等以重量計的材料，於調酒用量下以 1 g ≈ 1 ml 近似
  g: 1,
}

/** 無法換算成容積的單位 */
export const NON_VOLUME_UNITS = new Set([
  'whole', 'leaf', 'leaves', 'slice', 'slices', 'sprig', 'sprigs',
  'wedge', 'wedges', 'pinch', 'piece', 'pieces', '個', '根', '枝', '顆',
])

/**
 * 換算為毫升；無法換算時回傳 null。
 *
 * 回傳 null 而非 0，是為了讓呼叫端能區分「這項不佔容積」與
 * 「這項有用量但我算不出來」——後者若當成 0 會讓採購量短缺。
 */
export function toMl(amount: number, unit?: string | null): number | null {
  if (!Number.isFinite(amount)) return null
  const u = (unit ?? 'oz').trim().toLowerCase()
  if (u in VOLUME_ML) return amount * VOLUME_ML[u]
  if (NON_VOLUME_UNITS.has(u) || [...NON_VOLUME_UNITS].some(n => u.includes(n))) return null
  return null
}

/** 是否為可換算的容積單位 */
export function isVolumeUnit(unit?: string | null): boolean {
  return toMl(1, unit) !== null
}

/** 顯示用的毫升字串；小量保留一位小數，大量取整 */
export function formatMl(ml: number): string {
  if (!Number.isFinite(ml)) return '—'
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`
  if (ml >= 10) return `${Math.round(ml)} ml`
  return `${ml.toFixed(1)} ml`
}

/** 解析配方中的用量欄位；資料中同時存在數字與字串（例如 "0.75"） */
export function parseAmount(amount: unknown): number {
  if (typeof amount === 'number') return amount
  if (typeof amount === 'string') {
    const n = parseFloat(amount)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}
