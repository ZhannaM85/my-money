import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Asset } from '@/domain/asset'
import { historicalNetWorth } from '@/domain/netWorth'
import * as snapshot from '@/domain/snapshot'
import type { AssetSnapshot } from '@/domain/snapshot'
import { addDaysIso } from '@/shared/lib/dates'

vi.mock('@/domain/snapshot', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domain/snapshot')>()
  return {
    ...actual,
    indexSnapshotsByAssetId: vi.fn(actual.indexSnapshotsByAssetId),
    latestIndexedSnapshotOnOrBefore: vi.fn(
      actual.latestIndexedSnapshotOnOrBefore,
    ),
    snapshotsOnOrBefore: vi.fn(actual.snapshotsOnOrBefore),
  }
})

const ASSET_COUNT = 20
const SNAPSHOTS_PER_ASSET = 50
const DATE_COUNT = 365
const START = '2025-01-01'
/** Generous vs a year-chart hitch; the indexed path is typically tens of ms. */
const ACCEPTABLE_MS = 2_000

function scaleAsset(index: number): Asset {
  const now = `${START}T00:00:00.000Z`
  return {
    id: `asset-${index}`,
    name: `Asset ${index}`,
    assetClass: 'money',
    type: 'bank',
    currency: 'EUR',
    trackingStatus: 'included',
    valuationMethod: 'account_balance',
    updateFrequency: 'weekly',
    createdAt: now,
    updatedAt: now,
  }
}

function snapshotAmount(assetIndex: number, snapshotIndex: number): number {
  return (assetIndex + 1) * 100 + snapshotIndex
}

function snapshotDate(snapshotIndex: number): string {
  return addDaysIso(START, snapshotIndex * 7)
}

function scaleBook(): {
  assets: Asset[]
  snapshots: AssetSnapshot[]
  dates: string[]
} {
  const assets = Array.from({ length: ASSET_COUNT }, (_, index) =>
    scaleAsset(index),
  )
  const snapshots: AssetSnapshot[] = []
  for (let assetIndex = 0; assetIndex < ASSET_COUNT; assetIndex++) {
    for (let snapIndex = 0; snapIndex < SNAPSHOTS_PER_ASSET; snapIndex++) {
      const date = snapshotDate(snapIndex)
      snapshots.push({
        id: `snap-${assetIndex}-${snapIndex}`,
        assetId: `asset-${assetIndex}`,
        date,
        amount: snapshotAmount(assetIndex, snapIndex),
        currency: 'EUR',
        createdAt: `${date}T00:00:00.000Z`,
      })
    }
  }
  const dates = Array.from({ length: DATE_COUNT }, (_, index) =>
    addDaysIso(START, index),
  )
  return { assets, snapshots, dates }
}

function expectedTotalOn(date: string): number {
  let total = 0
  for (let assetIndex = 0; assetIndex < ASSET_COUNT; assetIndex++) {
    let latest: number | undefined
    for (let snapIndex = 0; snapIndex < SNAPSHOTS_PER_ASSET; snapIndex++) {
      if (snapshotDate(snapIndex) <= date) {
        latest = snapshotAmount(assetIndex, snapIndex)
      }
    }
    if (latest !== undefined) total += latest
  }
  return total
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('historicalNetWorth scale (#250)', () => {
  it('uses the pre-index path and finishes 20×50×365 within budget', () => {
    const { assets, snapshots, dates } = scaleBook()
    expect(assets).toHaveLength(ASSET_COUNT)
    expect(snapshots).toHaveLength(ASSET_COUNT * SNAPSHOTS_PER_ASSET)
    expect(dates).toHaveLength(DATE_COUNT)

    const started = performance.now()
    const points = historicalNetWorth(assets, snapshots, [], dates, 'EUR')
    const elapsed = performance.now() - started

    expect(snapshot.indexSnapshotsByAssetId).toHaveBeenCalledTimes(1)
    expect(snapshot.indexSnapshotsByAssetId).toHaveBeenCalledWith(snapshots)
    expect(snapshot.snapshotsOnOrBefore).not.toHaveBeenCalled()
    expect(snapshot.latestIndexedSnapshotOnOrBefore).toHaveBeenCalledTimes(
      ASSET_COUNT * DATE_COUNT,
    )

    expect(elapsed).toBeLessThan(ACCEPTABLE_MS)
    expect(points).toHaveLength(DATE_COUNT)
    expect(points[0]?.date).toBe(START)
    expect(points[0]?.total).toBe(expectedTotalOn(START))
    expect(points[7]?.total).toBe(expectedTotalOn(dates[7]!))
    expect(points[DATE_COUNT - 1]?.total).toBe(
      expectedTotalOn(dates[DATE_COUNT - 1]!),
    )
    expect(points[DATE_COUNT - 1]?.holdings).toHaveLength(ASSET_COUNT)
  })
})
