import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatAmount } from '@/shared/lib/money'
import { NetWorthChartTooltip } from './NetWorthChart'

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
})
