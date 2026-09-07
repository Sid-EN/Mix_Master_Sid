/**
 * 酒櫃庫存與成本
 *
 * 「我的酒櫃」原本只記錄「有沒有這瓶」。要回答「這杯成本多少」
 * 與「剩下的量還能調幾杯」，還需要容量、價格與剩餘量。
 * 這些資訊是選填的——只勾選擁有、不填價格仍然可用，
 * 只是成本會標示為未知，而不是當成 0（當成 0 會讓總成本嚴重低估）。
 */
import { parseAmount, toMl } from './units'

export interface BottleInfo {
  /** 整瓶容量（ml） */
  bottleMl: number
  /** 整瓶售價（元） */
  price: number
  /** 目前剩餘量（ml）；未填時視為滿瓶 */
  remainingMl?: number
}

export type Inventory = Record<string, BottleInfo>

export const INVENTORY_KEY = 'mixmaster-inventory'

export function loadInventory(): Inventory {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(INVENTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveInventory(inv: Inventory): void {
  try {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv))
  } catch {
    /* 私密瀏覽或儲存空間已滿時忽略 */
  }
}

/** 每毫升成本；資料不足時回傳 null 而非 0 */
export function costPerMl(info: BottleInfo | undefined): number | null {
  if (!info) return null
  if (!Number.isFinite(info.bottleMl) || info.bottleMl <= 0) return null
  if (!Number.isFinite(info.price) || info.price < 0) return null
  return info.price / info.bottleMl
}

/** 剩餘量；未填視為滿瓶 */
export function remainingMl(info: BottleInfo | undefined): number {
  if (!info) return 0
  const r = info.remainingMl
  if (r === undefined || r === null || !Number.isFinite(r)) return Math.max(0, info.bottleMl)
  return Math.max(0, Math.min(r, info.bottleMl))
}

export interface RecipeIngredient {
  slug: string
  amount: number | string
  unit?: string | null
  name?: string
  nameZh?: string
}

export interface RecipeCost {
  /** 已知價格部分的成本合計 */
  total: number
  /** 缺少價格資訊的材料 slug */
  unknown: string[]
  /** 無法換算成容積、因此無法計價的材料 slug */
  unmeasurable: string[]
}

/**
 * 單杯成本。
 *
 * 缺少資料的材料分開列出而不是靜靜略過——
 * 一杯只填了糖漿價格的調酒若顯示「成本 3 元」會嚴重誤導。
 */
export function recipeCost(
  ingredients: RecipeIngredient[],
  inv: Inventory,
): RecipeCost {
  let total = 0
  const unknown: string[] = []
  const unmeasurable: string[] = []

  for (const ing of ingredients ?? []) {
    const ml = toMl(parseAmount(ing.amount), ing.unit)
    if (ml === null) {
      unmeasurable.push(ing.slug)
      continue
    }
    const perMl = costPerMl(inv[ing.slug])
    if (perMl === null) {
      unknown.push(ing.slug)
      continue
    }
    total += perMl * ml
  }
  return { total, unknown, unmeasurable }
}

/**
 * 以目前庫存還能調幾杯。
 *
 * 取所有材料中最少的可調杯數；任一材料沒有庫存資料即回傳 null，
 * 因為此時給出的數字只會是猜測。
 */
export function servingsAvailable(
  ingredients: RecipeIngredient[],
  inv: Inventory,
): number | null {
  let least = Infinity
  let counted = 0

  for (const ing of ingredients ?? []) {
    const ml = toMl(parseAmount(ing.amount), ing.unit)
    if (ml === null || ml <= 0) continue          // 裝飾等不佔容積的材料不列入限制
    const info = inv[ing.slug]
    if (!info) return null
    least = Math.min(least, Math.floor(remainingMl(info) / ml))
    counted++
  }
  if (counted === 0) return null
  return Number.isFinite(least) ? Math.max(0, least) : null
}
