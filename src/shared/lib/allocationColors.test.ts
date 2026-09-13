import { describe, expect, it } from 'vitest'
import { allocationSliceColor } from './allocationColors'

describe('allocationSliceColor (#255)', () => {
  it('maps class, type, and currency ids — not list order', () => {
    expect(allocationSliceColor('investments')).toBe(
      'var(--asset-investments)',
    )
    expect(allocationSliceColor('liabilities')).toBe(
      'var(--asset-liabilities)',
    )
    expect(allocationSliceColor('money::EUR')).toBe('var(--asset-money)')
    expect(allocationSliceColor('brokerage')).toBe('var(--asset-investments)')
    expect(allocationSliceColor('mortgage')).toBe('var(--asset-liabilities)')
    expect(allocationSliceColor('EUR')).toBe('var(--currency-eur)')
    expect(allocationSliceColor('investments')).not.toBe(
      allocationSliceColor('liabilities'),
    )
  })

  it('keeps the same class color when row order changes', () => {
    const ids = ['liabilities', 'money', 'investments']
    const shuffled = ['investments', 'liabilities', 'money']
    expect(ids.map(allocationSliceColor)).toEqual([
      'var(--asset-liabilities)',
      'var(--asset-money)',
      'var(--asset-investments)',
    ])
    expect(shuffled.map(allocationSliceColor)).toEqual([
      'var(--asset-investments)',
      'var(--asset-liabilities)',
      'var(--asset-money)',
    ])
  })
})
