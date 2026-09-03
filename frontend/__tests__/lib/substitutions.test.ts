import { findSubstitutions, substitutionMap } from '@/lib/substitutions'

describe('findSubstitutions', () => {
  const knownKey = Object.keys(substitutionMap)[0]

  it('已知材料回傳替代清單', () => {
    const r = findSubstitutions(knownKey)
    expect(Array.isArray(r)).toBe(true)
    expect(r!.length).toBeGreaterThan(0)
  })

  it('未知材料回傳 null 而非丟出例外', () => {
    expect(findSubstitutions('完全不存在的材料 xyz')).toBeNull()
  })

  it('空字串不會造成例外', () => {
    expect(() => findSubstitutions('')).not.toThrow()
  })

  it('每筆替代項目都有名稱與比例說明', () => {
    Object.keys(substitutionMap).forEach(k => {
      const items = findSubstitutions(k)
      expect(items).not.toBeNull()
      items!.forEach(it => {
        expect(typeof it.name).toBe('string')
        expect(it.name.length).toBeGreaterThan(0)
      })
    })
  })
})
