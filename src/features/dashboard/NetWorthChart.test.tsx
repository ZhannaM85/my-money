import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NetWorthChart } from './NetWorthChart'

describe('NetWorthChart', () => {
  it('does not render a holdings tooltip (#133, #92, #128, #130, #132)', () => {
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
          onZoomIn={() => undefined}
          onZoomOut={() => undefined}
        />
      </div>,
    )
    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('chart-holdings-tooltip')).not.toBeInTheDocument()
    expect(screen.queryByText('Cash')).not.toBeInTheDocument()
  })

  it('wires onSelectDate and renders the chart for day selection (#112)', () => {
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
          onZoomIn={() => undefined}
          onZoomOut={() => undefined}
          onSelectDate={onSelectDate}
        />
      </div>,
    )
    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument()
    expect(onSelectDate).not.toHaveBeenCalled()
  })
})
