import { describe, expect, it } from 'vitest'
import { comparisonRows } from './comparisonRows'

describe('comparisonRows (#137)', () => {
  it('unions assets across dates and leaves missing days empty', () => {
    const rows = comparisonRows([
      {
        date: '2026-08-25',
        total: 100,
        missingRates: [],
        holdings: [
          {
            assetId: 'cash',
            name: 'Cash',
            currency: 'EUR',
            nativeAmount: 100,
            convertedAmount: 100,
            conversionAvailable: true,
          },
        ],
      },
      {
        date: '2026-08-29',
        total: 250,
        missingRates: [],
        holdings: [
          {
            assetId: 'cash',
            name: 'Cash',
            currency: 'EUR',
            nativeAmount: 150,
            convertedAmount: 150,
            conversionAvailable: true,
          },
          {
            assetId: 'usd',
            name: 'USD cash',
            currency: 'USD',
            nativeAmount: 100,
            convertedAmount: 100,
            conversionAvailable: true,
          },
        ],
      },
    ])

    expect(rows.map((row) => row.name)).toEqual(['Cash', 'USD cash'])
    expect(rows[0]?.byDate['2026-08-25']?.nativeAmount).toBe(100)
    expect(rows[0]?.byDate['2026-08-29']?.nativeAmount).toBe(150)
    expect(rows[1]?.byDate['2026-08-25']).toBeUndefined()
    expect(rows[1]?.byDate['2026-08-29']?.assetId).toBe('usd')
  })
})
