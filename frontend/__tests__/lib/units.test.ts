/**
 * 單位換算
 *
 * 換算表必須與後端 balance_model.py 的 VOLUME_OZ 一致，
 * 否則同一份配方在購物清單與平衡分析中會得到不同用量。
 */
import parity from '../../../tests/fixtures/unit_parity.json'
import { OZ_TO_ML, formatMl, isVolumeUnit, parseAmount, toMl } from '@/lib/units'

describe('toMl', () => {
  it('換算常見容積單位', () => {
    expect(toMl(1, 'oz')).toBeCloseTo(29.5735, 4)
    expect(toMl(30, 'ml')).toBe(30)
    expect(toMl(1, 'cl')).toBe(10)
  })

  it('換算調酒特有的小單位', () => {
    expect(toMl(1, 'dash')).toBeCloseTo(OZ_TO_ML / 32, 6)
    expect(toMl(1, 'bsp')).toBeCloseTo(OZ_TO_ML / 8, 6)
    expect(toMl(1, 'drop')).toBeCloseTo(OZ_TO_ML / 600, 6)
  })

  it('未指定單位時視為 oz', () => {
    // 配方資料中偶有缺漏；與後端 to_oz 的預設一致
    expect(toMl(2, undefined)).toBeCloseTo(2 * OZ_TO_ML, 4)
  })

  it('大小寫與空白不影響結果', () => {
    expect(toMl(1, ' OZ ')).toBeCloseTo(OZ_TO_ML, 4)
  })

  it('非容積單位回傳 null 而非 0', () => {
    // 回傳 0 會讓採購量短缺，且無法與「不佔容積」區分
    for (const u of ['whole', 'leaves', 'slice', 'sprig', '顆', '片葉']) {
      expect(toMl(1, u)).toBeNull()
    }
  })

  it('無法辨識的單位回傳 null', () => {
    expect(toMl(1, 'furlong')).toBeNull()
  })

  it('非數值用量回傳 null', () => {
    expect(toMl(NaN, 'oz')).toBeNull()
  })
})

describe('isVolumeUnit', () => {
  it('分辨可換算與不可換算', () => {
    expect(isVolumeUnit('ml')).toBe(true)
    expect(isVolumeUnit('leaves')).toBe(false)
  })
})

describe('parseAmount', () => {
  it('接受數字與字串', () => {
    // 配方資料中兩種形態都有
    expect(parseAmount(0.75)).toBe(0.75)
    expect(parseAmount('0.75')).toBe(0.75)
  })

  it('無法解析時回傳 0', () => {
    expect(parseAmount('適量')).toBe(0)
    expect(parseAmount(null)).toBe(0)
  })
})

describe('formatMl', () => {
  it('大量以公升顯示', () => {
    expect(formatMl(1500)).toBe('1.50 L')
  })

  it('一般量取整', () => {
    expect(formatMl(44.35)).toBe('44 ml')
  })

  it('小量保留一位小數', () => {
    expect(formatMl(0.92)).toBe('0.9 ml')
  })
})

describe('與後端換算表的一致性', () => {
  // 基準值由 backend/engine/balance_model.py 產生（scripts/gen_unit_parity.py）。
  // 兩邊描述的是同一套換算，不同步時不會有任何錯誤訊息，只會悄悄算錯用量。
  it('1 oz 的毫升數一致', () => {
    expect(OZ_TO_ML).toBeCloseTo(parity.ozToMl, 10)
  })

  it('各單位換算結果一致', () => {
    for (const c of parity.volumes) {
      expect(toMl(c.amount, c.unit)).toBeCloseTo(c.ml, 9)
    }
  })

  it('非容積單位的認定一致', () => {
    for (const u of parity.nonVolume) {
      expect(toMl(1, u)).toBeNull()
    }
  })
})
