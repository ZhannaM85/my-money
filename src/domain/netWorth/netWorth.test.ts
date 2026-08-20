import { describe, expect, it } from 'vitest'
import type { Asset } from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import { convertAmount, lookupRate, lookupRateOnOrBefore, type FxRateQuote } from '@/domain/fx'
import {
  allocation,
  assetPerformance,
  breakdownBy,
  historicalNativeNetWorth,
  historicalNetWorth,
  holdingsWithConversion,
  nativeTotalsByCurrency,
  netWorth,
  periodChange,
} from '@/domain/netWorth'

function asset(overrides: Partial<Asset>): Asset {
  const now = '2026-01-01T00:00:00.000Z'
  return {
    id: 'asset-1',
    name: 'Checking',
    assetClass: 'money',
    type: 'bank',
    currency: 'EUR',
    trackingStatus: 'included',
    valuationMethod: 'account_balance',
    updateFrequency: 'weekly',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function snap(overrides: Partial<AssetSnapshot>): AssetSnapshot {
  return {
    id: 'snap-1',
    assetId: 'asset-1',
    date: '2026-08-01',
    amount: 100,
    currency: 'EUR',
    createdAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  }
}

const eurUsd: FxRateQuote = {
  date: '2026-08-01',
  base: 'EUR',
  quote: 'USD',
  rate: 1.1,
}

describe('convertAmount / lookupRate', () => {
  it('uses rate 1 for the same currency with no table', () => {
    expect(lookupRate([], 'EUR', 'EUR', '2026-08-01')).toBe(1)
    expect(convertAmount(50, 1)).toBe(50)
  })

  it('finds a direct quote and the inverse', () => {
    expect(lookupRate([eurUsd], 'EUR', 'USD', '2026-08-01')).toBe(1.1)
    expect(lookupRate([eurUsd], 'USD', 'EUR', '2026-08-01')).toBeCloseTo(
      1 / 1.1,
    )
  })

  it('does not use a quote from a different date', () => {
    expect(lookupRate([eurUsd], 'EUR', 'USD', '2026-07-01')).toBeUndefined()
  })

  it('carries the last earlier quote when the requested day is missing', () => {
    expect(lookupRateOnOrBefore([eurUsd], 'EUR', 'USD', '2026-08-01')).toBe(1.1)
    expect(lookupRateOnOrBefore([eurUsd], 'EUR', 'USD', '2026-08-19')).toBe(1.1)
    expect(lookupRateOnOrBefore([eurUsd], 'EUR', 'USD', '2026-07-01')).toBeUndefined()
  })
})

describe('netWorth', () => {
  it('is 0 for an empty book', () => {
    expect(netWorth([], [], [], 'EUR').total).toBe(0)
  })

  it('subtracts included liabilities', () => {
    const loan = asset({
      id: 'loan',
      name: 'Loan',
      assetClass: 'liabilities',
      type: 'personal_loan',
    })
    const result = netWorth(
      [loan],
      [snap({ id: 's', assetId: 'loan', amount: 500 })],
      [],
      'EUR',
    )
    expect(result.total).toBe(-500)
    expect(
      result.byClass.find((row) => row.assetClass === 'liabilities')?.amount,
    ).toBe(-500)
  })

  it('converts mixed currencies with an injected rate table', () => {
    const usd = asset({ id: 'usd', currency: 'USD' })
    const result = netWorth(
      [usd],
      [snap({ id: 's', assetId: 'usd', amount: 110, currency: 'USD' })],
      [eurUsd],
      'EUR',
    )
    expect(result.total).toBeCloseTo(100)
  })

  it('ignores excluded and archived assets', () => {
    const excluded = asset({ id: 'ex', trackingStatus: 'excluded' })
    const archived = asset({ id: 'ar', trackingStatus: 'archived' })
    const result = netWorth(
      [excluded, archived],
      [
        snap({ id: 's1', assetId: 'ex', amount: 999 }),
        snap({ id: 's2', assetId: 'ar', amount: 999 }),
      ],
      [],
      'EUR',
    )
    expect(result.total).toBe(0)
  })

  it('applies ownership share to included assets', () => {
    const house = asset({
      id: 'house',
      assetClass: 'property',
      type: 'house',
      ownershipShareNumerator: 1,
      ownershipShareDenominator: 2,
    })
    const result = netWorth(
      [house],
      [snap({ id: 's', assetId: 'house', amount: 1000 })],
      [],
      'EUR',
    )
    expect(result.total).toBe(500)
  })
})

describe('allocation / periodChange / history / performance', () => {
  it('splits percents by absolute contribution', () => {
    const rows = allocation([
      { assetClass: 'money', amount: 75 },
      { assetClass: 'investments', amount: 25 },
      { assetClass: 'property', amount: 0 },
      { assetClass: 'valuables', amount: 0 },
      { assetClass: 'liabilities', amount: -25 },
    ])
    const money = rows.find((row) => row.assetClass === 'money')
    const debt = rows.find((row) => row.assetClass === 'liabilities')
    expect(money?.percent).toBe(60)
    expect(debt?.percent).toBe(20)
  })

  it('computes absolute and percent change', () => {
    expect(periodChange(100, 110)).toEqual({ absolute: 10, percent: 10 })
    expect(periodChange(0, 50)).toEqual({ absolute: 50, percent: null })
  })

  it('uses the snapshot-date FX for historical points, not a later rate', () => {
    const usd = asset({ id: 'usd', currency: 'USD' })
    const points = historicalNetWorth(
      [usd],
      [
        snap({
          id: 's',
          assetId: 'usd',
          amount: 110,
          currency: 'USD',
          date: '2026-07-01',
        }),
      ],
      [
        { date: '2026-07-01', base: 'EUR', quote: 'USD', rate: 1.1 },
        { date: '2026-08-01', base: 'EUR', quote: 'USD', rate: 2 },
      ],
      ['2026-07-01', '2026-08-01'],
      'EUR',
    )
    expect(points[0].total).toBeCloseTo(100)
    expect(points[1].total).toBeCloseTo(55)
  })

  it('does not drop a holding on a day that only lacks a same-day quote', () => {
    const eur = asset({ id: 'eur', name: 'Test', currency: 'EUR' })
    const rub = asset({ id: 'rub', name: 'Russian bank', currency: 'RUB' })
    const points = historicalNetWorth(
      [eur, rub],
      [
        snap({
          id: 's-eur',
          assetId: 'eur',
          amount: 1200,
          currency: 'EUR',
          date: '2026-08-18',
        }),
        snap({
          id: 's-rub',
          assetId: 'rub',
          amount: 22000,
          currency: 'RUB',
          date: '2026-08-18',
        }),
      ],
      [{ date: '2026-08-18', base: 'EUR', quote: 'RUB', rate: 100 }],
      ['2026-08-18', '2026-08-19'],
      'EUR',
    )
    expect(points[0].total).toBeCloseTo(1420)
    expect(points[1].total).toBeCloseTo(1420)
    expect(points[1].missingRates).toEqual([])
  })

  it('reports native performance even when FX is missing', () => {
    const result = assetPerformance(
      [
        snap({ id: 'a', amount: 100, date: '2026-07-01' }),
        snap({ id: 'b', amount: 120, date: '2026-08-01' }),
      ],
      [],
      'USD',
    )
    expect(result?.nativeAbsolute).toBe(20)
    expect(result?.nativePercent).toBe(20)
    expect(result?.baseAbsolute).toBeNull()
  })
})

describe('breakdownBy', () => {
  it('groups signed amounts and percents by class', () => {
    const cash = asset({ id: 'cash', name: 'Cash', type: 'cash' })
    const loan = asset({
      id: 'loan',
      name: 'Loan',
      assetClass: 'liabilities',
      type: 'personal_loan',
    })
    const rows = breakdownBy(
      [cash, loan],
      [
        snap({ id: 's1', assetId: 'cash', amount: 100 }),
        snap({
          id: 's2',
          assetId: 'loan',
          amount: 25,
        }),
      ],
      [],
      'EUR',
      (row) => row.assetClass,
    )
    expect(rows).toEqual([
      { id: 'money', amount: 100, percent: 80 },
      { id: 'liabilities', amount: -25, percent: 20 },
    ])
  })
})

describe('holdingsWithConversion', () => {
  it('keeps missing-rate holdings visible with conversionAvailable false', () => {
    const eur = asset({ id: 'eur', name: 'Euro cash', currency: 'EUR' })
    const rub = asset({ id: 'rub', name: 'Ruble cash', currency: 'RUB' })
    const rows = holdingsWithConversion(
      [eur, rub],
      [
        snap({ id: 's1', assetId: 'eur', amount: 1000, currency: 'EUR' }),
        snap({
          id: 's2',
          assetId: 'rub',
          amount: 20000,
          currency: 'RUB',
        }),
      ],
      [],
      'EUR',
    )
    expect(rows).toEqual([
      {
        assetId: 'eur',
        name: 'Euro cash',
        currency: 'EUR',
        nativeAmount: 1000,
        convertedAmount: 1000,
        conversionAvailable: true,
      },
      {
        assetId: 'rub',
        name: 'Ruble cash',
        currency: 'RUB',
        nativeAmount: 20000,
        convertedAmount: null,
        conversionAvailable: false,
      },
    ])
    expect(netWorth([eur, rub], [
      snap({ id: 's1', assetId: 'eur', amount: 1000, currency: 'EUR' }),
      snap({ id: 's2', assetId: 'rub', amount: 20000, currency: 'RUB' }),
    ], [], 'EUR').total).toBe(1000)
  })

  it('includes converted amounts when a rate exists', () => {
    const rub = asset({ id: 'rub', name: 'Ruble cash', currency: 'RUB' })
    const rows = holdingsWithConversion(
      [rub],
      [snap({ id: 's1', assetId: 'rub', amount: 20000, currency: 'RUB' })],
      [{ date: '2026-08-01', base: 'EUR', quote: 'RUB', rate: 100 }],
      'EUR',
    )
    expect(rows[0]?.convertedAmount).toBeCloseTo(200)
    expect(rows[0]?.conversionAvailable).toBe(true)
  })
})

describe('nativeTotalsByCurrency', () => {
  it('keeps every native currency even when FX is missing', () => {
    const eur = asset({ id: 'eur', currency: 'EUR' })
    const rub = asset({ id: 'rub', name: 'Ruble cash', currency: 'RUB' })
    expect(
      nativeTotalsByCurrency(
        [eur, rub],
        [
          snap({ id: 's1', assetId: 'eur', amount: 1000, currency: 'EUR' }),
          snap({
            id: 's2',
            assetId: 'rub',
            amount: 20000,
            currency: 'RUB',
          }),
        ],
      ),
    ).toEqual([
      { currency: 'EUR', amount: 1000 },
      { currency: 'RUB', amount: 20000 },
    ])
  })
})

describe('historicalNativeNetWorth', () => {
  it('sums only the selected native currency over time', () => {
    const eur = asset({ id: 'eur', currency: 'EUR' })
    const rub = asset({ id: 'rub', currency: 'RUB' })
    expect(
      historicalNativeNetWorth(
        [eur, rub],
        [
          snap({
            id: 's1',
            assetId: 'eur',
            date: '2026-08-01',
            amount: 900,
            currency: 'EUR',
          }),
          snap({
            id: 's2',
            assetId: 'rub',
            date: '2026-08-01',
            amount: 20000,
            currency: 'RUB',
          }),
          snap({
            id: 's3',
            assetId: 'eur',
            date: '2026-08-02',
            amount: 1000,
            currency: 'EUR',
          }),
        ],
        ['2026-08-01', '2026-08-02'],
        'EUR',
      ),
    ).toEqual([
      { date: '2026-08-01', total: 900 },
      { date: '2026-08-02', total: 1000 },
    ])
  })
})
