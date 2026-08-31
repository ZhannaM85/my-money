import { describe, expect, it } from 'vitest'
import {
  comparisonDelta,
  comparisonRows,
  comparisonTotalDelta,
} from './comparisonRows'

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

  it('copies ownershipShare onto the row (#151)', () => {
    const rows = comparisonRows([
      {
        date: '2026-08-25',
        total: 50,
        missingRates: [],
        holdings: [
          {
            assetId: 'house',
            name: 'Sosnovo',
            currency: 'EUR',
            nativeAmount: 50,
            convertedAmount: 50,
            conversionAvailable: true,
            ownershipShare: '1/2',
          },
        ],
      },
    ])
    expect(rows[0]?.ownershipShare).toBe('1/2')
  })

  it('omits excluded holdings from comparison rows (#150)', () => {
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
          {
            assetId: 'house',
            name: 'Sosnovo',
            currency: 'EUR',
            nativeAmount: 5_000_000,
            convertedAmount: 5_000_000,
            conversionAvailable: true,
            excluded: true,
          },
        ],
      },
    ])
    expect(rows.map((row) => row.name)).toEqual(['Cash'])
  })
})

describe('comparisonDelta (#174)', () => {
  const holding = (
    convertedAmount: number | null,
    conversionAvailable = true,
  ) => ({
    assetId: 'cash',
    name: 'Cash',
    currency: 'EUR',
    nativeAmount: convertedAmount ?? 0,
    convertedAmount,
    conversionAvailable,
  })

  it('returns later minus first when both sides convert', () => {
    expect(comparisonDelta(holding(150), holding(100))).toBe(50)
    expect(comparisonDelta(holding(80), holding(100))).toBe(-20)
  })

  it('is null when unchanged, missing, or unconverted', () => {
    expect(comparisonDelta(holding(100), holding(100))).toBeNull()
    expect(comparisonDelta(holding(100.001), holding(100))).toBeNull()
    expect(comparisonDelta(undefined, holding(100))).toBeNull()
    expect(comparisonDelta(holding(150), undefined)).toBeNull()
    expect(comparisonDelta(holding(null, false), holding(100))).toBeNull()
  })

  it('totals follow the same rule', () => {
    expect(comparisonTotalDelta(250, 100)).toBe(150)
    expect(comparisonTotalDelta(100, 100)).toBeNull()
    expect(comparisonTotalDelta(undefined, 100)).toBeNull()
  })
})
