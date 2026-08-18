import { describe, expect, it } from 'vitest'
import {
  formatEditableAmount,
  parseAmount,
  reformatAmountInput,
} from './money'

describe('parseAmount', () => {
  it('accepts a comma decimal from an iPhone numeric keypad', () => {
    expect(parseAmount('16155,11')).toBe(16155.11)
  })

  it('accepts plain, grouped, and comma-decimal numbers', () => {
    expect(parseAmount('1000.5')).toBe(1000.5)
    expect(parseAmount('1,000.50')).toBe(1000.5)
    expect(parseAmount('1.000,50')).toBe(1000.5)
    expect(parseAmount('1000,5')).toBe(1000.5)
    expect(parseAmount('1,000')).toBe(1000)
    expect(parseAmount('16 155,11')).toBe(16155.11)
    expect(parseAmount('nope')).toBeUndefined()
    expect(parseAmount('')).toBeUndefined()
    expect(parseAmount('   ')).toBeUndefined()
  })

  it('round-trips locale-formatted editable amounts', () => {
    expect(parseAmount(formatEditableAmount(116420, 'en', 'EUR'))).toBe(116420)
    expect(parseAmount(formatEditableAmount(116420.11, 'ru', 'RUB'))).toBe(
      116420.11,
    )
  })
})

describe('formatEditableAmount', () => {
  it('groups thousands and keeps fraction digits without a currency symbol', () => {
    const formatted = formatEditableAmount(116420, 'en', 'EUR')
    expect(formatted).not.toBe('116420')
    expect(formatted).toMatch(/116/)
    expect(formatted).toMatch(/420/)
    expect(formatted).toMatch(/00/)
    expect(formatted).not.toMatch(/€|EUR/)
  })
})

describe('reformatAmountInput', () => {
  it('formats a valid draft and leaves invalid text unchanged', () => {
    expect(reformatAmountInput('116420', 'en', 'EUR')).toBe(
      formatEditableAmount(116420, 'en', 'EUR'),
    )
    expect(reformatAmountInput('nope', 'en', 'EUR')).toBe('nope')
    expect(reformatAmountInput('', 'en', 'EUR')).toBe('')
  })
})
