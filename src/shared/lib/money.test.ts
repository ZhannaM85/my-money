import { describe, expect, it } from 'vitest'
import {
  chartAxisScale,
  compactAxisFractionDigits,
  formatCalendarDate,
  formatChartAxisDate,
  formatConvertedWithNativeAmount,
  formatDateTime,
  formatCompactNumber,
  formatEditableAmount,
  formatEditableRate,
  formatSignedAmount,
  formatSignedAmountWithCode,
  parseAmount,
  parseRate,
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

  it('treats more than two fraction digits as grouping (money, not FX)', () => {
    expect(parseAmount('0.0119474')).toBe(119474)
  })

  it('round-trips locale-formatted editable amounts', () => {
    expect(parseAmount(formatEditableAmount(116420, 'en', 'EUR'))).toBe(116420)
    expect(parseAmount(formatEditableAmount(116420.11, 'ru', 'RUB'))).toBe(
      116420.11,
    )
  })
})

describe('parseRate (#93)', () => {
  it('keeps more than two fraction digits (1 RUB in USD)', () => {
    expect(parseRate('0.0119474')).toBeCloseTo(0.0119474)
    expect(parseRate('0,0119474')).toBeCloseTo(0.0119474)
    expect(parseRate('0.0119474')).not.toBe(119474)
  })

  it('round-trips through the rate editor format', () => {
    const rate = 0.0119474
    expect(parseRate(formatEditableRate(rate, 'en'))).toBeCloseTo(rate)
    expect(parseRate(formatEditableRate(rate, 'ru'))).toBeCloseTo(rate)
  })
})

describe('formatConvertedWithNativeAmount (#303)', () => {
  it('appends a signed native amount and code for another currency', () => {
    expect(formatConvertedWithNativeAmount(450, 'EUR', 500, 'USD', 'en')).toBe(
      `${formatSignedAmount(450, 'EUR', 'en')} (${formatSignedAmountWithCode(500, 'USD', 'en')})`,
    )
    expect(formatConvertedWithNativeAmount(450, 'EUR', 500, 'USD', 'en')).toBe(
      '+€450.00 (+500.00 USD)',
    )
    expect(formatConvertedWithNativeAmount(-100, 'EUR', -50, 'USD', 'en')).toBe(
      '−€100.00 (−50.00 USD)',
    )
  })

  it('leaves base-currency rows without brackets', () => {
    expect(formatConvertedWithNativeAmount(100, 'EUR', 100, 'EUR', 'en')).toBe(
      formatSignedAmount(100, 'EUR', 'en'),
    )
    expect(
      formatConvertedWithNativeAmount(100, 'EUR', 100, 'EUR', 'en'),
    ).not.toMatch(/[()]/)
  })

  it('keeps the Russian locale grouping and the same minus sign', () => {
    expect(
      formatConvertedWithNativeAmount(2000, 'RUB', -500, 'USD', 'ru'),
    ).toBe(
      `${formatSignedAmount(2000, 'RUB', 'ru')} (${formatSignedAmountWithCode(-500, 'USD', 'ru')})`,
    )
    expect(formatSignedAmountWithCode(-500, 'USD', 'ru')).toMatch(/^−/)
    expect(formatSignedAmountWithCode(-500, 'USD', 'ru')).toContain('USD')
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

  it('does not pad the Y domain below zero when values are non-negative (#110)', () => {
    const { domain, ticks } = chartAxisScale(5_000, 80_000, 'ru')
    expect(domain[0]).toBeGreaterThanOrEqual(0)
    expect(Math.min(...ticks)).toBeGreaterThanOrEqual(0)
  })

  it('still allows a negative Y domain when the series has negatives (#110)', () => {
    const { domain } = chartAxisScale(-20_000, 80_000, 'ru')
    expect(domain[0]).toBeLessThan(0)
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

describe('formatCalendarDate (#192)', () => {
  it('includes day, month, and year', () => {
    const en = formatCalendarDate('2025-11-22', 'en')
    const ru = formatCalendarDate('2025-11-22', 'ru')
    expect(en).toMatch(/22/)
    expect(en).toMatch(/Nov/i)
    expect(en).toMatch(/2025/)
    expect(ru).toMatch(/22/)
    expect(ru).toMatch(/2025/)
  })
})

describe('formatDateTime', () => {
  it('includes a calendar day and a clock time (#188)', () => {
    const label = formatDateTime('2026-09-01T11:29:00.000Z', 'en')
    expect(label).toMatch(/2026/)
    expect(label).toMatch(/1|01/)
    expect(label).toMatch(/\d/)
    expect(label.length).toBeGreaterThan(8)
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
