import { describe, expect, it } from 'vitest'
import type { AssetSnapshot } from '@/domain/snapshot'
import {
  applyHoldingPersistPlan,
  planRemainingPersist,
  planSpendPersist,
} from './persistHolding'

const onDate: AssetSnapshot = {
  id: 's-today',
  assetId: 'cash',
  date: '2026-09-20',
  amount: 8000,
  currency: 'USD',
  createdAt: '2026-09-20T09:00:00.000Z',
  note: 'Old',
}

describe('planRemainingPersist (#284)', () => {
  it('creates a remaining snapshot with the comment', () => {
    expect(
      planRemainingPersist({
        assetId: 'cash',
        date: '2026-09-20',
        currency: 'USD',
        draft: '5700',
        note: '  Travel  ',
        entryMode: 'new_balance',
        onDate: undefined,
        previous: { amount: 8000, currency: 'USD' } as AssetSnapshot,
        requireAmount: true,
      }),
    ).toEqual({
      ok: true,
      plan: {
        toUpdate: [],
        toCreate: [
          {
            assetId: 'cash',
            date: '2026-09-20',
            amount: 5700,
            currency: 'USD',
            note: 'Travel',
          },
        ],
        toDelete: [],
      },
    })
  })

  it('updates only the comment on an existing remaining snapshot', () => {
    expect(
      planRemainingPersist({
        assetId: 'cash',
        date: '2026-09-20',
        currency: 'USD',
        draft: '',
        note: 'New note',
        entryMode: 'new_balance',
        onDate,
        previous: undefined,
        requireAmount: false,
      }),
    ).toEqual({
      ok: true,
      plan: {
        toUpdate: [{ ...onDate, note: 'New note' }],
        toCreate: [],
        toDelete: [],
      },
    })
  })

  it('appends a same-date remaining snapshot instead of updating (#284)', () => {
    expect(
      planRemainingPersist({
        assetId: 'cash',
        date: '2026-09-20',
        currency: 'USD',
        draft: '8000',
        note: '',
        entryMode: 'new_balance',
        onDate,
        previous: undefined,
        requireAmount: true,
        write: 'append',
      }),
    ).toEqual({
      ok: true,
      plan: {
        toUpdate: [],
        toCreate: [
          {
            assetId: 'cash',
            date: '2026-09-20',
            amount: 8000,
            currency: 'USD',
          },
        ],
        toDelete: [],
      },
    })
  })

  it('rejects an empty remaining save when an amount is required', () => {
    expect(
      planRemainingPersist({
        assetId: 'cash',
        date: '2026-09-20',
        currency: 'USD',
        draft: '',
        note: 'Forgot',
        entryMode: 'new_balance',
        onDate: undefined,
        previous: undefined,
        requireAmount: true,
      }),
    ).toEqual({ ok: false, error: 'noop' })
  })
})

describe('planSpendPersist (#284)', () => {
  it('plans a new given/received line for IndexedDB', () => {
    const result = planSpendPersist({
      snapshots: [],
      drafts: [
        {
          key: 'n1',
          amount: '1500',
          note: 'Anton',
          direction: 'given',
        },
      ],
      assetId: 'cash',
      date: '2026-09-20',
      currency: 'USD',
      onDate: undefined,
      previous: { amount: 8000, currency: 'USD' } as AssetSnapshot,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.plan.toCreate).toEqual([
      expect.objectContaining({
        assetId: 'cash',
        date: '2026-09-20',
        amount: 6500,
        currency: 'USD',
        note: 'Anton',
        flow: -1500,
      }),
    ])
  })
})

describe('applyHoldingPersistPlan (#284)', () => {
  it('writes create, update, and delete through the book actions', async () => {
    const created: unknown[] = []
    const updated: unknown[] = []
    const deleted: string[] = []
    await applyHoldingPersistPlan(
      {
        toCreate: [
          {
            assetId: 'cash',
            date: '2026-09-20',
            amount: 5700,
            currency: 'USD',
          },
        ],
        toUpdate: [onDate],
        toDelete: ['gone'],
      },
      {
        saveSnapshots: async (rows) => {
          created.push(...rows)
        },
        updateSnapshot: async (row) => {
          updated.push(row)
        },
        deleteSnapshot: async (id) => {
          deleted.push(id)
        },
      },
    )
    expect(created).toHaveLength(1)
    expect(updated).toEqual([onDate])
    expect(deleted).toEqual(['gone'])
  })
})
