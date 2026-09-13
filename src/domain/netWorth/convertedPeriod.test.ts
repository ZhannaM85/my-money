import { describe, expect, it } from 'vitest'
import type { Asset } from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import { convertedPeriodReadModel } from './convertedPeriod'

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

describe('convertedPeriodReadModel (#246)', () => {
  it('returns an empty model when the date window is empty', () => {
    expect(convertedPeriodReadModel([], [], [], [], 'EUR')).toMatchObject({
      series: [],
      breakdown: null,
      changeFrom: 0,
      headlineTo: 0,
      missingRates: [],
    })
  })

  it('shares series, amount-only change, and missing rates for one book', () => {
    const eur = asset({ id: 'eur', name: 'Euro cash', currency: 'EUR' })
    const usd = asset({ id: 'usd', name: 'Dollars', currency: 'USD' })
    const model = convertedPeriodReadModel(
      [eur, usd],
      [
        snap({
          id: 's-eur',
          assetId: 'eur',
          amount: 1000,
          currency: 'EUR',
          date: '2026-08-01',
        }),
        snap({
          id: 's-usd',
          assetId: 'usd',
          amount: 100,
          currency: 'USD',
          date: '2026-08-01',
        }),
      ],
      [
        { date: '2026-08-01', base: 'EUR', quote: 'USD', rate: 1.1 },
        { date: '2026-08-31', base: 'EUR', quote: 'USD', rate: 1.25 },
      ],
      ['2026-08-01', '2026-08-31'],
      'EUR',
    )

    const startTotal = 1000 + 100 / 1.1
    const endTotal = 1000 + 100 / 1.25
    expect(model.series).toHaveLength(2)
    expect(model.startPoint?.total).toBeCloseTo(startTotal)
    expect(model.endPoint?.total).toBeCloseTo(endTotal)
    expect(model.breakdown?.amountChange).toBeCloseTo(0)
    expect(model.breakdown?.rateChange).toBeCloseTo(endTotal - startTotal)
    expect(model.change.absolute).toBeCloseTo(0)
    expect(model.headlineTo).toBeCloseTo(startTotal)
    expect(model.missingRates).toEqual([])
  })

  it('surfaces missing rates from the end point', () => {
    const usd = asset({ id: 'usd', name: 'Dollars', currency: 'USD' })
    const model = convertedPeriodReadModel(
      [usd],
      [
        snap({
          id: 's-usd',
          assetId: 'usd',
          amount: 50,
          currency: 'USD',
          date: '2026-08-01',
        }),
      ],
      [],
      ['2026-08-01'],
      'EUR',
    )
    expect(model.endPoint?.total).toBe(0)
    expect(model.missingRates.map((row) => row.from)).toEqual(['USD'])
  })
})
