import { describe, expect, it } from 'vitest'
import type { Asset } from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import { nativeTotalsByCurrency, netWorth } from '@/domain/netWorth'
import {
  assetEndCaption,
  assetListedAt,
  removedAfterAsOf,
  snapshotsOnBookDate,
} from './assetsAsOf'

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

function snap(overrides: Partial<AssetSnapshot> = {}): AssetSnapshot {
  return {
    id: 's1',
    assetId: 'cash',
    date: '2026-05-01',
    amount: 40,
    currency: 'EUR',
    createdAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('assets as-of book (#329)', () => {
  const cash = asset({ endedOn: '2026-06-01' })
  const open = asset({ id: 'open', name: 'Open' })
  const archived = asset({
    id: 'old',
    name: 'Old',
    trackingStatus: 'archived',
  })
  const snapshots = [
    snap(),
    snap({
      id: 's-later',
      date: '2026-06-15',
      amount: 80,
      createdAt: '2026-06-15T00:00:00.000Z',
    }),
    snap({
      id: 's-open',
      assetId: 'open',
      amount: 10,
    }),
  ]

  it('keeps a later-ended asset on a past day and drops it on the end date', () => {
    expect(assetListedAt(cash, '2026-05-31', 'all')).toBe(true)
    expect(assetListedAt(cash, '2026-05-31', 'money')).toBe(true)
    expect(assetListedAt(cash, '2026-05-31', 'investments')).toBe(false)
    expect(assetListedAt(cash, '2026-05-31', 'archived')).toBe(false)
    expect(removedAfterAsOf(cash, '2026-05-31')).toBe(true)
    expect(assetEndCaption(cash, '2026-05-31', '2026-11-17')).toBe('removed')

    expect(assetListedAt(cash, '2026-06-01', 'all')).toBe(false)
    expect(assetListedAt(cash, '2026-06-01', 'archived')).toBe(true)
    expect(removedAfterAsOf(cash, '2026-06-01')).toBe(false)
    expect(assetEndCaption(cash, '2026-06-01', '2026-11-17')).toBe('removed')
  })

  it('keeps a future end date as “ends” only while viewing today', () => {
    expect(assetEndCaption(cash, '2026-05-01', '2026-05-01')).toBe('ends')
    expect(assetListedAt(archived, '2026-05-31', 'all')).toBe(false)
    expect(assetListedAt(archived, '2026-05-31', 'archived')).toBe(true)
    expect(assetListedAt(open, '2026-06-15', 'all')).toBe(true)
    expect(assetEndCaption(open, '2026-06-15', '2026-11-17')).toBeNull()
  })

  it('totals and lists balances from snapshots on or before the day', () => {
    const onMay = snapshotsOnBookDate(snapshots, '2026-05-31')
    expect(onMay.map((row) => row.id).sort()).toEqual(['s-open', 's1'])
    expect(netWorth([cash, open], onMay, [], 'EUR', '2026-05-31').total).toBe(
      50,
    )
    expect(nativeTotalsByCurrency([cash, open], onMay, '2026-05-31')).toEqual([
      { currency: 'EUR', amount: 50 },
    ])

    const onEnd = snapshotsOnBookDate(snapshots, '2026-06-01')
    expect(netWorth([cash, open], onEnd, [], 'EUR', '2026-06-01').total).toBe(
      10,
    )

    const after = snapshotsOnBookDate(snapshots, '2026-06-15')
    expect(netWorth([open], after, [], 'EUR', '2026-06-15').total).toBe(10)
    expect(
      netWorth([asset({ id: 'cash' }), open], after, [], 'EUR', '2026-06-15')
        .total,
    ).toBe(90)
  })
})
