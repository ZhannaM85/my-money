import { describe, expect, it } from 'vitest'
import { hasDuplicateSnapshot, optionalSnapshotNote, snapshotOnDate } from './AssetSnapshot'

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
