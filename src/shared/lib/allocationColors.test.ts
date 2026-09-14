import { describe, expect, it } from 'vitest'
import { allocationSliceColor } from './allocationColors'

describe('allocationSliceColor (#255, #269)', () => {
  it('maps class, type, and currency ids — not list order', () => {
    expect(allocationSliceColor('investments')).toBe(
      'var(--asset-investments)',
    )
    expect(allocationSliceColor('liabilities')).toBe(
      'var(--asset-liabilities)',
    )
    expect(allocationSliceColor('money::EUR')).toBe('var(--asset-money)')
    expect(allocationSliceColor('brokerage')).toBe('var(--asset-brokerage)')
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

  it('gives money types distinct colors (#269)', () => {
    const cash = allocationSliceColor('cash')
    const deposit = allocationSliceColor('deposit')
    const bank = allocationSliceColor('bank')
    const savings = allocationSliceColor('savings')
    expect(cash).toBe('var(--asset-cash)')
    expect(deposit).toBe('var(--asset-deposit)')
    expect(bank).toBe('var(--asset-bank)')
    expect(savings).toBe('var(--asset-savings)')
    expect(new Set([cash, deposit, bank, savings]).size).toBe(4)
  })

  it('keeps type colors when Type-view row order changes (#269)', () => {
    const ids = ['bank', 'cash', 'deposit']
    const shuffled = ['deposit', 'bank', 'cash']
    expect(ids.map(allocationSliceColor)).toEqual([
      'var(--asset-bank)',
      'var(--asset-cash)',
      'var(--asset-deposit)',
    ])
    expect(shuffled.map(allocationSliceColor)).toEqual([
      'var(--asset-deposit)',
      'var(--asset-bank)',
      'var(--asset-cash)',
    ])
  })

  it('keeps nearby Type pairs visually distinct (#269 on-device)', () => {
    expect(allocationSliceColor('bank')).toBe('var(--asset-bank)')
    expect(allocationSliceColor('debit_card')).toBe('var(--asset-debit-card)')
    expect(allocationSliceColor('bank')).not.toBe(
      allocationSliceColor('debit_card'),
    )
    expect(allocationSliceColor('apartment')).toBe('var(--asset-apartment)')
    expect(allocationSliceColor('house')).toBe('var(--asset-house)')
    expect(allocationSliceColor('apartment')).not.toBe(
      allocationSliceColor('house'),
    )
  })

  it('keeps common currencies on distinct tokens (#269 on-device)', () => {
    expect(allocationSliceColor('EUR')).toBe('var(--currency-eur)')
    expect(allocationSliceColor('USD')).toBe('var(--currency-usd)')
    expect(allocationSliceColor('RUB')).toBe('var(--currency-rub)')
    expect(allocationSliceColor('GEL')).toBe('var(--currency-gel)')
    const hues = ['EUR', 'USD', 'RUB', 'GEL', 'GBP'].map(allocationSliceColor)
    expect(new Set(hues).size).toBe(5)
  })
})
