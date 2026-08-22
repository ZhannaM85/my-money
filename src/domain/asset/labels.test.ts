import { describe, expect, it } from 'vitest'
import { TYPES_BY_CLASS } from './labels'

describe('TYPES_BY_CLASS (#99)', () => {
  it('lists debit card under Money, not with credit-card debt', () => {
    expect(TYPES_BY_CLASS.money).toEqual([
      'bank',
      'savings',
      'cash',
      'deposit',
      'debit_card',
    ])
    expect(TYPES_BY_CLASS.liabilities).toContain('credit_card')
    expect(TYPES_BY_CLASS.liabilities).not.toContain('debit_card')
    expect(TYPES_BY_CLASS.money).not.toContain('credit_card')
  })
})
