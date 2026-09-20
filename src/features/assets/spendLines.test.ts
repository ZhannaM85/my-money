import { describe, expect, it } from 'vitest'
import type { AssetSnapshot, SameDaySpendEntry } from '@/domain/snapshot'
import {
  parseSpendLineDrafts,
  planSameDaySpendPersist,
  spendBaselineAmount,
  spendLineDraftsFromEntries,
  spendLineIsEditing,
  spendLinesMatchSaved,
  spendLinesOrDefault,
} from './spendLines'

const saved: SameDaySpendEntry[] = [
  {
    id: 's1',
    remaining: 7000,
    drop: 1000,
    direction: 'given',
    flow: -1000,
    currency: 'USD',
    note: 'Gift',
  },
  {
    id: 's2',
    remaining: 5000,
    drop: 2000,
    direction: 'given',
    flow: -2000,
    currency: 'USD',
    note: 'Travel',
  },
]

const existing: AssetSnapshot[] = [
  {
    id: 's1',
    assetId: 'usd-cash',
    date: '2026-09-20',
    amount: 7000,
    currency: 'USD',
    createdAt: '2026-09-20T10:00:00.000Z',
    note: 'Gift',
    flow: -1000,
  },
  {
    id: 's2',
    assetId: 'usd-cash',
    date: '2026-09-20',
    amount: 5000,
    currency: 'USD',
    createdAt: '2026-09-20T11:00:00.000Z',
    note: 'Travel',
    flow: -2000,
  },
]

describe('parseSpendLineDrafts (#279)', () => {
  it('keeps amounts and trims notes; skips empty and note-only rows', () => {
    expect(
      parseSpendLineDrafts([
        { key: '1', amount: '1000', note: '  Gift  ', direction: 'given' },
        { key: '2', amount: '', note: 'Forgot', direction: 'given' },
        { key: '3', amount: '2000', note: '   ', direction: 'received' },
      ]),
    ).toEqual([
      { amount: 1000, direction: 'given', note: 'Gift' },
      { amount: 2000, direction: 'received' },
    ])
  })

  it('gives a stable empty line when nothing is drafted yet', () => {
    expect(spendLinesOrDefault(undefined, 'usd-cash')[0]?.key).toBe(
      'usd-cash-spend-0',
    )
  })
})

describe('spendLineIsEditing (#283)', () => {
  it('starts unsaved lines editable and saved lines read-only', () => {
    expect(spendLineIsEditing({})).toBe(true)
    expect(spendLineIsEditing({ snapshotId: 's1' })).toBe(false)
  })

  it('lets pencil force edit and save force view', () => {
    expect(spendLineIsEditing({ snapshotId: 's1' }, 'edit')).toBe(true)
    expect(spendLineIsEditing({}, 'view')).toBe(false)
  })
})

describe('saved spend line drafts (#280)', () => {
  it('loads drop amounts and notes into editable drafts', () => {
    expect(spendLineDraftsFromEntries(saved, 'en', 'usd-cash')).toEqual([
      {
        key: 's1',
        snapshotId: 's1',
        amount: '1,000.00',
        note: 'Gift',
        direction: 'given',
      },
      {
        key: 's2',
        snapshotId: 's2',
        amount: '2,000.00',
        note: 'Travel',
        direction: 'given',
      },
    ])
  })

  it('uses the remaining just before the first spend as the baseline', () => {
    expect(
      spendBaselineAmount(
        saved,
        { amount: 5000, currency: 'USD' },
        { amount: 8000, currency: 'USD' },
        'USD',
      ),
    ).toBe(8000)
  })

  it('treats unchanged loaded drafts as matching saved rows', () => {
    expect(
      spendLinesMatchSaved(
        spendLineDraftsFromEntries(saved, 'en', 'usd-cash'),
        saved,
      ),
    ).toBe(true)
    expect(
      spendLinesMatchSaved(
        [
          {
            key: 's1',
            snapshotId: 's1',
            amount: '1,200.00',
            note: 'Gift',
            direction: 'given',
          },
          {
            key: 's2',
            snapshotId: 's2',
            amount: '2,000.00',
            note: 'Travel',
            direction: 'given',
          },
        ],
        saved,
      ),
    ).toBe(false)
  })

  it('updates remaining on an edited line and deletes a removed snapshot', () => {
    const plan = planSameDaySpendPersist({
      existingSpends: existing,
      drafts: [
        {
          key: 's1',
          snapshotId: 's1',
          amount: '1200',
          note: 'Gift',
          direction: 'given',
        },
      ],
      baseline: 8000,
      assetId: 'usd-cash',
      date: '2026-09-20',
      currency: 'USD',
      nowMs: Date.parse('2026-09-20T12:00:00.000Z'),
    })
    expect(plan.toUpdate).toEqual([
      {
        ...existing[0],
        amount: 6800,
        flow: -1200,
      },
    ])
    expect(plan.toCreate).toEqual([])
    expect(plan.toDelete).toEqual(['s2'])
  })
})
