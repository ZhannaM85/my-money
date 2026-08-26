import { describe, expect, it } from 'vitest'
import { holdingsForSelectedChartDay } from './holdingsForSelectedChartDay'

describe('holdingsForSelectedChartDay (#112)', () => {
  const series = [
    {
      date: '2026-08-06',
      total: 116_420,
      holdings: [
        {
          assetId: 'cash',
          name: 'Cash',
          currency: 'RUB',
          nativeAmount: 116_420,
          convertedAmount: 116_420,
          conversionAvailable: true,
        },
      ],
    },
    {
      date: '2026-08-25',
      total: 101_100,
      holdings: [
        {
          assetId: 'cash',
          name: 'Cash',
          currency: 'RUB',
          nativeAmount: 101_100,
          convertedAmount: 101_100,
          conversionAvailable: true,
        },
      ],
    },
  ]
  const fallback = [
    {
      assetId: 'cash',
      name: 'Cash',
      currency: 'RUB',
      nativeAmount: 101_100,
      convertedAmount: 101_100,
      conversionAvailable: true,
    },
  ]

  it('uses the selected day’s holdings so Positions match the tooltip', () => {
    const { point, holdings } = holdingsForSelectedChartDay(
      series,
      '2026-08-06',
      fallback,
    )
    expect(point?.date).toBe('2026-08-06')
    expect(holdings[0]?.nativeAmount).toBe(116_420)
  })

  it('falls back to latest when nothing is selected', () => {
    const { point, holdings } = holdingsForSelectedChartDay(
      series,
      null,
      fallback,
    )
    expect(point).toBeUndefined()
    expect(holdings[0]?.nativeAmount).toBe(101_100)
  })

  it('uses an outside-series point from the date field (#117)', () => {
    const outside = {
      date: '2026-01-13',
      total: 50,
      holdings: [
        {
          assetId: 'cash',
          name: 'Cash',
          currency: 'RUB',
          nativeAmount: 50,
          convertedAmount: 50,
          conversionAvailable: true,
        },
      ],
    }
    const { point, holdings } = holdingsForSelectedChartDay(
      series,
      '2026-01-13',
      fallback,
      outside,
    )
    expect(point?.date).toBe('2026-01-13')
    expect(holdings[0]?.nativeAmount).toBe(50)
  })
})
