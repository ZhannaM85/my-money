import { describe, expect, it } from 'vitest'
import {
  effectiveAmount,
  formatOwnershipShare,
  ownershipMultiplier,
  parseOwnershipShare,
} from './ownershipShare'

describe('ownershipShare', () => {
  it('parses fractions and defaults to full ownership', () => {
    expect(parseOwnershipShare('1/2')).toEqual({ numerator: 1, denominator: 2 })
    expect(parseOwnershipShare('')).toEqual({ numerator: 1, denominator: 1 })
    expect(parseOwnershipShare('2/3')).toEqual({ numerator: 2, denominator: 3 })
    expect(parseOwnershipShare('3/2')).toBeUndefined()
    expect(parseOwnershipShare('half')).toBeUndefined()
  })

  it('applies the share to amounts', () => {
    expect(
      effectiveAmount(1000, {
        ownershipShareNumerator: 1,
        ownershipShareDenominator: 2,
      }),
    ).toBe(500)
    expect(ownershipMultiplier({})).toBe(1)
    expect(formatOwnershipShare({ numerator: 1, denominator: 2 })).toBe('1/2')
  })
})
