import { describe, expect, it } from 'vitest'
import { isoDatesInclusive } from '@/shared/lib/dates'
import { assetChartPoints } from './assetChartPoints'

const usdCash = {
  id: 's1',
  assetId: 'a1',
  date: '2025-12-08',
  amount: 8000,
  currency: 'USD',
  createdAt: '2025-12-08T00:00:00.000Z',
}

describe('assetChartPoints (#144)', () => {
  it('spaces May→August farther apart than a two-week December gap', () => {
    const snapshots = [
      usdCash,
      { ...usdCash, id: 's2', date: '2025-12-21', createdAt: '2025-12-21T00:00:00.000Z' },
      { ...usdCash, id: 's3', date: '2026-01-30', createdAt: '2026-01-30T00:00:00.000Z' },
      { ...usdCash, id: 's4', date: '2026-05-07', createdAt: '2026-05-07T00:00:00.000Z' },
      { ...usdCash, id: 's5', date: '2026-08-25', createdAt: '2026-08-25T00:00:00.000Z' },
    ]
    const points = assetChartPoints(
      'a1',
      snapshots,
      isoDatesInclusive('2025-12-08', '2026-08-25'),
      'native',
      [],
      'USD',
    )
    const index = (date: string) => points.findIndex((point) => point.date === date)
    const decemberGap = index('2025-12-21') - index('2025-12-08')
    const mayAugustGap = index('2026-08-25') - index('2026-05-07')
    expect(decemberGap).toBe(13)
    expect(mayAugustGap).toBeGreaterThan(90)
    expect(mayAugustGap).toBeGreaterThan(decemberGap)
  })

  it('carries the last snapshot forward on days in between', () => {
    const points = assetChartPoints(
      'a1',
      [usdCash],
      isoDatesInclusive('2025-12-08', '2025-12-10'),
      'native',
      [],
      'USD',
    )
    expect(points.map((point) => point.total)).toEqual([8000, 8000, 8000])
  })
})
