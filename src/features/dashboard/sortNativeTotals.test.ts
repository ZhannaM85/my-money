import { describe, expect, it } from 'vitest'
import { sortNativeTotalsLargestFirst } from './sortNativeTotals'

describe('sortNativeTotalsLargestFirst (#256)', () => {
  it('puts the largest absolute native total first', () => {
    expect(
      sortNativeTotalsLargestFirst([
        { currency: 'EUR', amount: 1000 },
        { currency: 'RUB', amount: 20000 },
        { currency: 'USD', amount: -50 },
      ]).map((row) => row.currency),
    ).toEqual(['RUB', 'EUR', 'USD'])
  })
})
