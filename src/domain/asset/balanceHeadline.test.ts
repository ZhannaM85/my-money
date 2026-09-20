import { describe, expect, it } from 'vitest'
import type { AssetSnapshot } from '@/domain/snapshot'
import {
  applyBalanceEntry,
  assetBalanceHeadline,
  cumulativeGivenSpent,
  headlineNativeAmount,
  snapshotsChronological,
  updateBaselineAmount,
} from './balanceHeadline'

const now = '2026-08-17T00:00:00.000Z'

function snap(
  partial: Pick<AssetSnapshot, 'id' | 'date' | 'amount'> &
    Partial<AssetSnapshot>,
): AssetSnapshot {
  return {
    assetId: 'a1',
    currency: 'USD',
    createdAt: now,
    ...partial,
  }
}

describe('assetBalanceHeadline (#276)', () => {
  it('defaults to remaining when the field is omitted', () => {
    expect(assetBalanceHeadline({})).toBe('remaining')
    expect(assetBalanceHeadline({ balanceHeadline: 'given_spent' })).toBe(
      'given_spent',
    )
  })
})

describe('cumulativeGivenSpent (#276)', () => {
  it('sums consecutive decreases for the 8000 → 5700 gift case', () => {
    expect(
      cumulativeGivenSpent(
        [
          snap({ id: 's1', date: '2026-08-01', amount: 8000 }),
          snap({ id: 's2', date: '2026-08-20', amount: 5700 }),
        ],
        'a1',
      ),
    ).toBe(2300)
  })

  it('ignores increases and currency breaks', () => {
    expect(
      cumulativeGivenSpent(
        [
          snap({ id: 's1', date: '2026-08-01', amount: 8000 }),
          snap({ id: 's2', date: '2026-08-10', amount: 5700 }),
          snap({ id: 's3', date: '2026-08-12', amount: 6000 }),
          snap({
            id: 's4',
            date: '2026-08-15',
            amount: 5000,
            currency: 'EUR',
          }),
        ],
        'a1',
      ),
    ).toBe(2300)
  })

  it('orders same-day rows by createdAt', () => {
    expect(
      snapshotsChronological(
        [
          snap({
            id: 's2',
            date: '2026-08-01',
            amount: 5700,
            createdAt: '2026-08-01T12:00:00.000Z',
          }),
          snap({
            id: 's1',
            date: '2026-08-01',
            amount: 8000,
            createdAt: '2026-08-01T08:00:00.000Z',
          }),
        ],
        'a1',
      ).map((row) => row.id),
    ).toEqual(['s1', 's2'])
  })
})

describe('applyBalanceEntry (#276)', () => {
  it('writes an absolute remaining or applies ± to the baseline', () => {
    expect(applyBalanceEntry('new_balance', 5700, 8000)).toBe(5700)
    expect(applyBalanceEntry('add', 200, 5700)).toBe(5900)
    expect(applyBalanceEntry('remove', 2300, 8000)).toBe(5700)
    expect(applyBalanceEntry('remove', -100, 5700)).toBe(5600)
  })
})

describe('headlineNativeAmount and baseline (#276)', () => {
  it('picks remaining or cumulative given', () => {
    expect(headlineNativeAmount('remaining', 5700, 2300)).toBe(5700)
    expect(headlineNativeAmount('given_spent', 5700, 2300)).toBe(2300)
    expect(headlineNativeAmount('remaining', undefined, 0)).toBeUndefined()
    expect(headlineNativeAmount('given_spent', undefined, 0)).toBe(0)
  })

  it('uses the on-date amount, then the previous same-currency snapshot', () => {
    expect(
      updateBaselineAmount(
        { amount: 5700, currency: 'USD' },
        { amount: 8000, currency: 'USD' },
        'USD',
      ),
    ).toBe(5700)
    expect(
      updateBaselineAmount(undefined, { amount: 8000, currency: 'USD' }, 'USD'),
    ).toBe(8000)
    expect(
      updateBaselineAmount(undefined, { amount: 8000, currency: 'EUR' }, 'USD'),
    ).toBe(0)
  })
})
