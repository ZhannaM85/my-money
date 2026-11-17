import { describe, expect, it } from 'vitest'
import type { Asset } from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import {
  breakdownBy,
  historicalNativeNetWorth,
  historicalNetWorth,
  holdingsWithConversion,
  nativeTotalsByCurrency,
  netWorth,
} from '@/domain/netWorth'

function asset(overrides: Partial<Asset> = {}): Asset {
  const now = '2026-01-01T00:00:00.000Z'
  return {
    id: 'cash',
    name: 'Cash',
    assetClass: 'money',
    type: 'cash',
    currency: 'EUR',
    trackingStatus: 'included',
    valuationMethod: 'account_balance',
    updateFrequency: 'manual',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function snap(overrides: Partial<AssetSnapshot>): AssetSnapshot {
  return {
    id: 's-cash',
    assetId: 'cash',
    date: '2026-05-01',
    amount: 40,
    currency: 'EUR',
    createdAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

const cash = asset({ endedOn: '2026-06-01' })
const restored = asset()
const other = asset({ id: 'other', name: 'Other' })
const snapshots = [
  snap({}),
  snap({
    id: 's-later',
    date: '2026-06-15',
    amount: 80,
    createdAt: '2026-06-15T00:00:00.000Z',
  }),
  snap({
    id: 's-other',
    assetId: 'other',
    amount: 10,
    createdAt: '2026-05-01T00:00:00.000Z',
  }),
]

describe('asset end date (#328)', () => {
  it('keeps history before the end date and drops the asset on and after it', () => {
    const before = historicalNetWorth(
      [cash, other],
      snapshots,
      [],
      ['2026-05-31'],
      'EUR',
    )[0]!
    expect(before.total).toBe(50)
    expect(before.holdings.map((row) => row.assetId).sort()).toEqual([
      'cash',
      'other',
    ])

    const onEnd = historicalNetWorth(
      [cash, other],
      snapshots,
      [],
      ['2026-06-01'],
      'EUR',
    )[0]!
    expect(onEnd.total).toBe(10)
    expect(onEnd.holdings.map((row) => row.assetId)).toEqual(['other'])

    const after = historicalNetWorth(
      [cash, other],
      snapshots,
      [],
      ['2026-06-15'],
      'EUR',
    )[0]!
    expect(after.total).toBe(10)
    expect(after.holdings.map((row) => row.assetId)).toEqual(['other'])

    const nativeBefore = historicalNativeNetWorth(
      [cash, other],
      snapshots,
      ['2026-05-31'],
      'EUR',
    )[0]!
    const nativeAfter = historicalNativeNetWorth(
      [cash, other],
      snapshots,
      ['2026-06-15'],
      'EUR',
    )[0]!
    expect(nativeBefore.total).toBe(50)
    expect(nativeAfter.total).toBe(10)
  })

  it('drops the asset from current totals and positions on the end date', () => {
    const beforeEnd = snapshots.filter((row) => row.date < '2026-06-01')
    expect(
      netWorth([cash, other], beforeEnd, [], 'EUR', '2026-05-31').total,
    ).toBe(50)
    expect(
      netWorth([cash, other], snapshots, [], 'EUR', '2026-06-01').total,
    ).toBe(10)
    expect(
      nativeTotalsByCurrency([cash, other], beforeEnd, '2026-05-31'),
    ).toEqual([{ currency: 'EUR', amount: 50 }])
    expect(
      nativeTotalsByCurrency([cash, other], snapshots, '2026-06-01'),
    ).toEqual([{ currency: 'EUR', amount: 10 }])

    const beforeHoldings = holdingsWithConversion(
      [cash, other],
      snapshots,
      [],
      'EUR',
      '2026-05-31',
    )
    const afterHoldings = holdingsWithConversion(
      [cash, other],
      snapshots,
      [],
      'EUR',
      '2026-06-01',
    )
    expect(beforeHoldings.map((row) => row.assetId).sort()).toEqual([
      'cash',
      'other',
    ])
    expect(afterHoldings.map((row) => row.assetId)).toEqual(['other'])

    expect(
      breakdownBy(
        [cash, other],
        snapshots,
        [],
        'EUR',
        (row) => row.assetClass,
        '2026-06-01',
      ).find((row) => row.id === 'money')?.amount,
    ).toBe(10)
  })

  it('restores totals and the later snapshot when the end date is cleared', () => {
    const point = historicalNetWorth(
      [restored, other],
      snapshots,
      [],
      ['2026-06-15'],
      'EUR',
    )[0]!
    expect(point.total).toBe(90)
    expect(point.holdings.map((row) => row.assetId).sort()).toEqual([
      'cash',
      'other',
    ])
    expect(
      netWorth([restored, other], snapshots, [], 'EUR', '2026-06-15').total,
    ).toBe(90)
  })

  it('stops subtracting an ended liability on the end date', () => {
    const loan = asset({
      id: 'loan',
      name: 'Loan',
      assetClass: 'liabilities',
      type: 'personal_loan',
      endedOn: '2026-06-01',
    })
    const rows = [
      snap({ id: 's-loan', assetId: 'loan', amount: 25 }),
      snap({ id: 's-other', assetId: 'other', amount: 10 }),
    ]
    expect(
      historicalNetWorth([loan, other], rows, [], ['2026-05-31'], 'EUR')[0]
        ?.total,
    ).toBe(-15)
    expect(
      historicalNetWorth([loan, other], rows, [], ['2026-06-01'], 'EUR')[0]
        ?.total,
    ).toBe(10)
  })
})
