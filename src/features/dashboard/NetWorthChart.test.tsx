import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { formatAmount } from '@/shared/lib/money'
import { useSettingsStore } from '@/stores/settingsStore'
import { NetWorthChart, NetWorthChartTooltip } from './NetWorthChart'

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

afterEach(() => {
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS, loaded: true })
})

describe('NetWorthChartTooltip', () => {
  it('lists holdings for the active chart point', () => {
    renderWithRouter(
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

  it('keeps six holdings inside a scrollable popover above the tab bar (#92, #131)', () => {
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

    renderWithRouter(
      <NetWorthChartTooltip
        active
        currency="RUB"
        payload={[{ payload: { date: '2026-08-20', total: 1, holdings } }]}
      />,
    )

    const popover = screen.getByTestId('chart-holdings-tooltip')
    expect(popover).toHaveClass('overflow-y-scroll')
    expect(popover).toHaveClass('chart-tooltip-scroll')
    expect(popover.className).toContain('safe-area-inset-bottom')
    for (const name of holdings.map((row) => row.name)) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it('shows muted native amount under converted net worth (#136)', () => {
    renderWithRouter(
      <NetWorthChartTooltip
        active
        currency="RUB"
        payload={[
          {
            payload: {
              date: '2026-08-05',
              total: 1_531_286.67,
              nativeAmount: 18_000,
              nativeCurrency: 'USD',
            },
          },
        ]}
      />,
    )

    expect(screen.getByText('2026-08-05')).toBeInTheDocument()
    expect(screen.getByText(/Net worth/)).toBeInTheDocument()
    const native = screen.getByTestId('chart-tooltip-native')
    expect(native).toHaveTextContent(formatAmount(18_000, 'USD'))
    expect(native).toHaveClass('text-muted-foreground')
  })

  it('does not duplicate native when it is already the display currency (#136)', () => {
    renderWithRouter(
      <NetWorthChartTooltip
        active
        currency="USD"
        payload={[
          {
            payload: {
              date: '2026-08-05',
              total: 18_000,
              nativeAmount: 18_000,
              nativeCurrency: 'USD',
            },
          },
        ]}
      />,
    )

    expect(screen.queryByTestId('chart-tooltip-native')).not.toBeInTheDocument()
  })

  it('omits the holdings card when the tooltip is turned off (#141)', () => {
    renderWithRouter(
      <NetWorthChartTooltip
        active
        showHoldings={false}
        currency="EUR"
        payload={[
          {
            payload: {
              date: '2026-08-14',
              total: 1200,
              holdings: [
                {
                  assetId: 'eur',
                  name: 'Cash',
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

    expect(screen.queryByTestId('chart-holdings-tooltip')).not.toBeInTheDocument()
    expect(screen.queryByText('Cash')).not.toBeInTheDocument()
  })
})

describe('NetWorthChart', () => {
  it('wires onSelectDate and renders the chart for day selection (#112)', () => {
    const onSelectDate = vi.fn()
    renderWithRouter(
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
          onZoomIn={() => undefined}
          onZoomOut={() => undefined}
          onSelectDate={onSelectDate}
        />
      </div>,
    )
    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument()
    expect(onSelectDate).not.toHaveBeenCalled()
    expect(screen.getByTestId('chart-tooltip-toggle')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Hide' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('marks Hide pressed when the tooltip preference is off (#141)', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, showChartTooltip: false },
      loaded: true,
    })
    renderWithRouter(
      <div style={{ width: 400, height: 200 }}>
        <NetWorthChart
          points={[{ date: '2026-08-14', total: 1_000 }]}
          currency="EUR"
          onZoomIn={() => undefined}
          onZoomOut={() => undefined}
        />
      </div>,
    )
    expect(screen.getByRole('button', { name: 'Hide' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Show' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
