import { describe, expect, it } from 'vitest'
import { parseAmount } from './money'

describe('parseAmount', () => {
  it('accepts a comma decimal from an iPhone numeric keypad', () => {
    expect(parseAmount('16155,11')).toBe(16155.11)
  })

  it('accepts plain, grouped, and comma-decimal numbers', () => {
    expect(parseAmount('1000.5')).toBe(1000.5)
    expect(parseAmount('1,000.50')).toBe(1000.5)
    expect(parseAmount('1000,5')).toBe(1000.5)
    expect(parseAmount('16 155,11')).toBe(16155.11)
    expect(parseAmount('nope')).toBeUndefined()
    expect(parseAmount('')).toBeUndefined()
    expect(parseAmount('   ')).toBeUndefined()
  })
})
