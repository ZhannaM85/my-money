import { describe, expect, it } from 'vitest'
import { pinZeroBalanceHoldingsLast } from './pinZeroBalanceHoldingsLast'

describe('pinZeroBalanceHoldingsLast', () => {
  it('moves zero native balances after non-zeros and keeps relative order (#325)', () => {
    const rows = [
      { id: 'a', nativeAmount: 0 },
      { id: 'b', nativeAmount: 100 },
      { id: 'c', nativeAmount: 0 },
      { id: 'd', nativeAmount: -50 },
      { id: 'e', nativeAmount: 20 },
    ]
    expect(pinZeroBalanceHoldingsLast(rows).map((row) => row.id)).toEqual([
      'b',
      'd',
      'e',
      'a',
      'c',
    ])
  })

  it('returns the same sequence when nothing is zero', () => {
    const rows = [
      { id: 'a', nativeAmount: 1 },
      { id: 'b', nativeAmount: 2 },
    ]
    expect(pinZeroBalanceHoldingsLast(rows).map((row) => row.id)).toEqual([
      'a',
      'b',
    ])
  })
})
