import { describe, expect, it } from 'vitest'
import { lookupRate, mergeRateTables } from '@/domain/fx'

describe('mergeRateTables', () => {
  it('prefers manual quotes over system quotes for the same pair', () => {
    const merged = mergeRateTables(
      [{ date: '2026-08-18', base: 'EUR', quote: 'RUB', rate: 90 }],
      [{ date: '2026-08-18', base: 'EUR', quote: 'RUB', rate: 98.5 }],
    )
    expect(lookupRate(merged, 'EUR', 'RUB', '2026-08-18')).toBe(98.5)
    expect(lookupRate(merged, 'RUB', 'EUR', '2026-08-18')).toBeCloseTo(1 / 98.5)
  })

  it('keeps system quotes that have no manual override', () => {
    const merged = mergeRateTables(
      [
        { date: '2026-08-18', base: 'EUR', quote: 'USD', rate: 1.1 },
        { date: '2026-08-18', base: 'EUR', quote: 'RUB', rate: 90 },
      ],
      [{ date: '2026-08-18', base: 'EUR', quote: 'RUB', rate: 98.5 }],
    )
    expect(lookupRate(merged, 'EUR', 'USD', '2026-08-18')).toBe(1.1)
    expect(lookupRate(merged, 'EUR', 'RUB', '2026-08-18')).toBe(98.5)
  })
})
