import { getCurrentSeason, seasons } from '@/lib/seasonalData'

describe('seasonalData', () => {
  it('回傳的季節屬於已定義集合', () => {
    const s = getCurrentSeason()
    expect(seasons.map((x: any) => x.id ?? x.key ?? x.name)).toContain(
      (s as any).id ?? (s as any).key ?? (s as any).name
    )
  })

  it('季節定義不重複且非空', () => {
    expect(seasons.length).toBeGreaterThan(0)
    const ids = seasons.map((x: any) => x.id ?? x.key ?? x.name)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
