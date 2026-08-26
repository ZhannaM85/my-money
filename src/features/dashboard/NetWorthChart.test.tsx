import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { formatAmount } from '@/shared/lib/money'
import { NetWorthChart, NetWorthChartTooltip } from './NetWorthChart'

describe('NetWorthChartTooltip', () => {
  it('lists holdings for the active chart point', () => {
    render(
      <NetWorthChartTooltip
        active
        currency="EUR"
        payload={[
          {
            payload: {
              date: '2026-08-19',
              total: 1200,
              holdings: [
                {
                  assetId: 'rub',
                  name: 'Russian bank',
                  currency: 'RUB',
                  nativeAmount: 22000,
                  convertedAmount: null,
                  conversionAvailable: false,
                },
                {
                  assetId: 'eur',
                  name: 'Test',
                  currency: 'EUR',
                  nativeAmount: 1200,
                  convertedAmount: 1200,
                  conversionAvailable: true,
                },
              ],
            },
          },
        ]}
      />,
    )

    expect(screen.getByText('2026-08-19')).toBeInTheDocument()
    expect(screen.getByText('Russian bank')).toBeInTheDocument()
    expect(screen.getByText('Conversion not available')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(
      screen.getByText(`Net worth: ${formatAmount(1200, 'EUR')}`),
    ).toBeInTheDocument()
  })

  it('keeps six holdings inside a taller scrollable popover (#92)', () => {
    const holdings = [
      'До 8 октября',
      'Доллары',
      'Инвестиции',
      'На отпуск',
      'Накопительный счёт',
      'Рубли',
    ].map((name, index) => ({
      assetId: `a${index}`,
      name,
      currency: 'RUB',
      nativeAmount: 200_000,
      convertedAmount: 200_000,
      conversionAvailable: true,
    }))

    render(
      <NetWorthChartTooltip
        active
        currency="RUB"
        payload={[{ payload: { date: '2026-08-20', total: 1, holdings } }]}
      />,
    )

    const popover = screen.getByTestId('chart-holdings-tooltip')
    expect(popover).toHaveClass('overflow-y-scroll')
    expect(popover).toHaveClass('chart-tooltip-scroll')
    for (const name of holdings.map((row) => row.name)) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })
})

describe('NetWorthChart selected day (#112)', () => {
  it('wires onSelectDate and renders the chart for day selection', () => {
    const onSelectDate = vi.fn()
    render(
      <div style={{ width: 400, height: 200 }}>
        <NetWorthChart
          points={[
            {
              date: '2026-01-13',
              total: 1_074_255,
              holdings: [
                {
                  assetId: 'a1',
                  name: 'Cash',
                  currency: 'RUB',
                  nativeAmount: 100_000,
                  convertedAmount: 100_000,
                  conversionAvailable: true,
                },
              ],
            },
            { date: '2026-08-25', total: 1_609_451 },
          ]}
          currency="RUB"
          onSelectDate={onSelectDate}
        />
      </div>,
    )
    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument()
    expect(onSelectDate).not.toHaveBeenCalled()
  })
})
