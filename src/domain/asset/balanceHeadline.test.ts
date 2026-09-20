import { describe, expect, it } from 'vitest'
import type { AssetSnapshot } from '@/domain/snapshot'
import {
  applyBalanceEntry,
  assetBalanceHeadline,
  cumulativeGivenSpent,
  headlineNativeAmount,
  snapshotsChronological,
  snapshotsFromSpendLines,
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

describe('cumulativeGivenSpent (#280)', () => {
  it('sums tagged explicit flows only, not lifetime remaining drawdowns', () => {
    expect(
      cumulativeGivenSpent(
        [
          snap({ id: 's1', date: '2026-08-01', amount: 8000 }),
          snap({
            id: 's2',
            date: '2026-09-20',
            amount: 6500,
            flow: -1500,
            createdAt: '2026-09-20T10:00:00.000Z',
          }),
          snap({
            id: 's3',
            date: '2026-09-20',
            amount: 5700,
            flow: -800,
            createdAt: '2026-09-20T11:00:00.000Z',
          }),
        ],
        'a1',
      ),
    ).toBe(2300)
  })

  it('does not count single-day Остаток updates as given/received', () => {
    expect(
      cumulativeGivenSpent(
        [
          snap({ id: 's1', date: '2025-12-01', amount: 15000 }),
          snap({ id: 's2', date: '2026-01-01', amount: 1000 }),
          snap({ id: 's3', date: '2026-08-25', amount: 8000 }),
          snap({ id: 's4', date: '2026-09-03', amount: 8000 }),
          snap({ id: 's5', date: '2026-09-20', amount: 5700 }),
        ],
        'a1',
      ),
    ).toBe(0)
  })

  it('counts untagged #279 same-day multi-line drops as explicit given', () => {
    expect(
      cumulativeGivenSpent(
        [
          snap({ id: 's0', date: '2026-09-03', amount: 8000 }),
          snap({
            id: 's1',
            date: '2026-09-20',
            amount: 6500,
            createdAt: '2026-09-20T10:00:00.000Z',
          }),
          snap({
            id: 's2',
            date: '2026-09-20',
            amount: 5700,
            createdAt: '2026-09-20T11:00:00.000Z',
          }),
        ],
        'a1',
      ),
    ).toBe(2300)
  })

  it('nets received (+) against given (−) (#282)', () => {
    expect(
      cumulativeGivenSpent(
        [
          snap({ id: 's1', date: '2026-09-20', amount: 6500, flow: -1500 }),
          snap({
            id: 's2',
            date: '2026-09-21',
            amount: 7300,
            flow: 800,
          }),
        ],
        'a1',
      ),
    ).toBe(700)
  })
})

describe('snapshotsChronological (#276)', () => {
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

describe('snapshotsFromSpendLines (#279, #282)', () => {
  it('writes one remaining per line so the sum is the net decrease', () => {
    expect(
      snapshotsFromSpendLines(8000, [
        { amount: 1000, note: 'Gift' },
        { amount: 2000, note: 'Travel' },
      ]),
    ).toEqual([
      { remaining: 7000, flow: -1000, note: 'Gift' },
      { remaining: 5000, flow: -2000, note: 'Travel' },
    ])
  })

  it('increases remaining for a received line', () => {
    expect(
      snapshotsFromSpendLines(5700, [{ amount: 800, direction: 'received' }]),
    ).toEqual([{ remaining: 6500, flow: 800 }])
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
