import { describe, expect, it } from 'vitest'
import type { Asset } from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import { emptyPersistPlan } from '@/features/assets/persistHolding'
import { planUpdatePersistRow } from './updateFieldPersist'

const asset: Asset = {
  id: 'cash',
  name: 'Cash',
  assetClass: 'money',
  type: 'cash',
  currency: 'USD',
  trackingStatus: 'included',
  valuationMethod: 'account_balance',
  updateFrequency: 'manual',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
}

const onDate: AssetSnapshot = {
  id: 's-today',
  assetId: 'cash',
  date: '2026-08-01',
  amount: 1000,
  currency: 'USD',
  createdAt: '2026-08-01T00:00:00.000Z',
}

describe('planUpdatePersistRow (#290)', () => {
  it('does not surface the internal noop sentinel as an error', () => {
    const result = planUpdatePersistRow({
      row: { asset, onDate, previous: undefined },
      scope: 'remaining',
      asOf: '2026-08-01',
      locale: 'en',
      drafts: { cash: '1,000.00' },
      notes: {},
      editing: { cash: true },
      spendLines: {},
      snapshots: [onDate],
      enterNumberFor: (name) => `Enter a number for ${name}`,
    })
    expect(result).toEqual({ ok: true, plan: emptyPersistPlan() })
  })
})
