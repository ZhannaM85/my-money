import { describe, expect, it } from 'vitest'
import {
  hasDuplicateSnapshot,
  optionalSnapshotNote,
  snapshotBeforeDate,
  snapshotOnDate,
  snapshotsOnOrBefore,
} from './AssetSnapshot'
import {
  indexSnapshotsByAssetId,
  latestIndexedSnapshotOnOrBefore,
} from './snapshotIndex'

describe('optionalSnapshotNote', () => {
  it('trims text and drops empty notes so they do not persist', () => {
    expect(optionalSnapshotNote('  Bonus  ')).toBe('Bonus')
    expect(optionalSnapshotNote('   ')).toBeUndefined()
    expect(optionalSnapshotNote(undefined)).toBeUndefined()
  })
})

describe('hasDuplicateSnapshot (#115)', () => {
  const rows = [
    {
      id: 's1',
      assetId: 'a1',
      date: '2026-08-11',
      amount: 15400,
      currency: 'USD',
      createdAt: '2026-08-11T10:00:00.000Z',
    },
  ]

  it('detects the same date and amount on the asset', () => {
    expect(
      hasDuplicateSnapshot(rows, {
        assetId: 'a1',
        date: '2026-08-11',
        amount: 15400,
        currency: 'USD',
      }),
    ).toBe(true)
  })

  it('ignores different amounts or dates', () => {
    expect(
      hasDuplicateSnapshot(rows, {
        assetId: 'a1',
        date: '2026-08-11',
        amount: 15401,
        currency: 'USD',
      }),
    ).toBe(false)
    expect(
      hasDuplicateSnapshot(rows, {
        assetId: 'a1',
        date: '2026-08-12',
        amount: 15400,
        currency: 'USD',
      }),
    ).toBe(false)
  })

  it('can exclude the row being edited', () => {
    expect(
      hasDuplicateSnapshot(rows, {
        assetId: 'a1',
        date: '2026-08-11',
        amount: 15400,
        currency: 'USD',
        excludeId: 's1',
      }),
    ).toBe(false)
  })
})

describe('snapshotOnDate (#176)', () => {
  it('returns only an exact date, not an earlier carry-forward', () => {
    const rows = [
      {
        id: 's1',
        assetId: 'a1',
        date: '2026-08-01',
        amount: 1000,
        currency: 'EUR',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ]
    expect(snapshotOnDate(rows, 'a1', '2026-08-01')?.amount).toBe(1000)
    expect(snapshotOnDate(rows, 'a1', '2026-08-31')).toBeUndefined()
  })
})

describe('snapshotBeforeDate (#180)', () => {
  const rows = [
    {
      id: 's1',
      assetId: 'a1',
      date: '2026-08-01',
      amount: 1000,
      currency: 'EUR',
      createdAt: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 's2',
      assetId: 'a1',
      date: '2026-08-25',
      amount: 2000,
      currency: 'EUR',
      createdAt: '2026-08-25T00:00:00.000Z',
    },
  ]

  it('returns the last snapshot strictly before the date, not overall latest', () => {
    expect(snapshotBeforeDate(rows, 'a1', '2026-08-10')?.amount).toBe(1000)
    expect(snapshotBeforeDate(rows, 'a1', '2026-08-25')?.amount).toBe(1000)
    expect(snapshotBeforeDate(rows, 'a1', '2026-08-31')?.amount).toBe(2000)
  })

  it('returns undefined when nothing is earlier', () => {
    expect(snapshotBeforeDate(rows, 'a1', '2026-08-01')).toBeUndefined()
  })
})

describe('indexSnapshotsByAssetId', () => {
  it('picks the same on-or-before snapshot as a full scan (#240)', () => {
    const rows = [
      {
        id: 'a-early',
        assetId: 'a',
        date: '2026-07-01',
        amount: 10,
        currency: 'EUR',
        createdAt: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'b-only',
        assetId: 'b',
        date: '2026-08-01',
        amount: 99,
        currency: 'USD',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'a-late',
        assetId: 'a',
        date: '2026-08-01',
        amount: 20,
        currency: 'EUR',
        createdAt: '2026-08-01T08:00:00.000Z',
      },
      {
        id: 'a-same-day-newer',
        assetId: 'a',
        date: '2026-08-01',
        amount: 21,
        currency: 'EUR',
        createdAt: '2026-08-01T12:00:00.000Z',
      },
    ]
    const indexed = indexSnapshotsByAssetId(rows)
    expect(indexed.get('a')?.map((row) => row.id)).toEqual([
      'a-early',
      'a-late',
      'a-same-day-newer',
    ])
    expect(
      latestIndexedSnapshotOnOrBefore(indexed.get('a'), '2026-08-01')?.id,
    ).toBe(snapshotsOnOrBefore(rows, 'a', '2026-08-01')?.id)
    expect(
      latestIndexedSnapshotOnOrBefore(indexed.get('a'), '2026-07-15')?.id,
    ).toBe('a-early')
    expect(
      latestIndexedSnapshotOnOrBefore(indexed.get('b'), '2026-07-15'),
    ).toBeUndefined()
  })
})
