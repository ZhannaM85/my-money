import { describe, expect, it } from 'vitest'
import {
  chartAxisScale,
  compactAxisFractionDigits,
  formatChartAxisDate,
  formatCompactNumber,
  formatEditableAmount,
  parseAmount,
  reformatAmountInput,
  uniqueChartAxisDates,
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

describe('compact chart axis labels', () => {
  it('does not round a 1.97 million series to 2 млн', () => {
    const value = 1_969_089
    const digits = compactAxisFractionDigits(value, value, 'ru')
    expect(formatCompactNumber(value, 'ru', digits)).toMatch(/1,97/)
    expect(formatCompactNumber(value, 'ru', digits)).not.toBe(
      formatCompactNumber(2_000_000, 'ru', 0),
    )
  })

  it('keeps nearby million-scale ticks distinct', () => {
    const { ticks, digits } = chartAxisScale(1_850_000, 2_050_000, 'ru')
    const labels = ticks.map((tick) => formatCompactNumber(tick, 'ru', digits))
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('keeps padded ticks distinct when the series is a round 2 million', () => {
    const digits = compactAxisFractionDigits(2_000_000, 2_000_000, 'ru')
    const padded = [1_900_000, 1_950_000, 2_000_000, 2_050_000, 2_100_000]
    const labels = padded.map((tick) => formatCompactNumber(tick, 'ru', digits))
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('gives a flat ~2 million series unique compact Y labels', () => {
    const { ticks, digits } = chartAxisScale(1_969_089, 1_969_089, 'ru')
    const labels = ticks.map((tick) => formatCompactNumber(tick, 'ru', digits))
    expect(labels.length).toBeGreaterThan(1)
    expect(new Set(labels).size).toBe(labels.length)
  })
})

describe('chart X-axis dates', () => {
  it('keeps one tick per snapshot day', () => {
    expect(
      uniqueChartAxisDates(['2026-08-18', '2026-08-18', '2026-08-21']),
    ).toEqual(['2026-08-18', '2026-08-21'])
  })

  it('labels ticks with day and month, not the day number alone', () => {
    const en = formatChartAxisDate('2026-08-18', 'en')
    const ru = formatChartAxisDate('2026-08-18', 'ru')
    expect(en).toMatch(/18/)
    expect(en).toMatch(/Aug/i)
    expect(en).not.toBe('18')
    expect(ru).toMatch(/18/)
    expect(ru.toLowerCase()).toMatch(/авг/)
    expect(ru).not.toBe('18')
  })

  it('gives distinct labels for different snapshot days', () => {
    const labels = uniqueChartAxisDates([
      '2026-08-18',
      '2026-08-18',
      '2026-08-21',
    ]).map((date) => formatChartAxisDate(date, 'en'))
    expect(new Set(labels).size).toBe(labels.length)
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
