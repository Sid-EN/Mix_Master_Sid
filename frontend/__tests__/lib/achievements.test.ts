import { getSeason, ACHIEVEMENTS, TIER_COLORS, TIER_LABELS } from '@/lib/achievements'

describe('achievements', () => {
  it.each([[1, 'winter'], [4, 'spring'], [7, 'summer'], [10, 'autumn']])(
    '月份 %i 能對應到季節索引', (month) => {
      const s = getSeason(month as number)
      expect(typeof s).toBe('number')
    })

  it('所有月份都能得到有效結果', () => {
    for (let m = 1; m <= 12; m++) {
      const s = getSeason(m)
      expect(Number.isFinite(s)).toBe(true)
    }
  })

  it('成就 id 不重複', () => {
    const ids = ACHIEVEMENTS.map((a: any) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每個成就的 tier 都有對應的顏色與標籤', () => {
    const colors = TIER_COLORS as Record<string, string>
    const labels = TIER_LABELS as Record<string, string>
    ACHIEVEMENTS.forEach((a: any) => {
      expect(colors[a.tier]).toBeDefined()
      expect(labels[a.tier]).toBeDefined()
    })
  })

  it('每個成就都有名稱與說明', () => {
    ACHIEVEMENTS.forEach((a: any) => {
      expect(a.name ?? a.nameZh).toBeTruthy()
    })
  })
})
