import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  formatAmount,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { addDaysIso, monthStartIso } from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useChartRangeStore } from '@/stores/chartRangeStore'
import { DashboardScreen } from './DashboardScreen'
import { resetDashboardStores } from './dashboardTestSetup'

beforeEach(async () => {
  await resetDashboardStores()
})

describe('DashboardHeadline', () => {
  it('shows calculated net worth from the latest snapshots', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Revolut',
        assetClass: 'money',
        type: 'bank',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByTestId('allocation-chart')).not.toBeInTheDocument()
    expect(screen.getByText('From amounts')).toBeInTheDocument()
    expect(screen.getByText('From rates')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Update rates' }),
    ).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'About this month' }),
    )
    expect(
      screen.getByText(/From amounts is what you added or reduced/),
    ).toBeInTheDocument()
  })

  it('shows this-month change from the month-start snapshot', async () => {
    const today = todayIsoDate()
    const start = monthStartIso(today)
    const now = `${today}T00:00:00.000Z`
    const asset = {
      id: 'a1',
      name: 'Revolut',
      assetClass: 'money' as const,
      type: 'bank' as const,
      currency: 'EUR',
      trackingStatus: 'included' as const,
      valuationMethod: 'account_balance' as const,
      updateFrequency: 'weekly' as const,
      createdAt: now,
      updatedAt: now,
    }
    await useAssetStore.getState().saveAsset(asset, {
      assetId: 'a1',
      date: start,
      amount: 800,
      currency: 'EUR',
    })
    if (start !== today) {
      await useAssetStore.getState().saveAsset(asset, {
        assetId: 'a1',
        date: today,
        amount: 1000,
        currency: 'EUR',
      })
    }
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    const expected =
      start === today
        ? /this month/
        : new RegExp(
            `${formatSignedAmount(200, 'EUR').replaceAll('+', '\\+')}.*this month`,
          )
    expect(await screen.findByText(expected)).toBeInTheDocument()
  })

  it('uses today’s rate for Converted net worth so the headline matches History', async () => {
    const today = todayIsoDate()
    const past = addDaysIso(today, -10)
    const now = `${today}T00:00:00.000Z`
    await useFxStore.getState().saveManualRates([
      { date: past, base: 'EUR', quote: 'USD', rate: 1.1 },
      { date: today, base: 'EUR', quote: 'USD', rate: 1 },
    ])
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd',
        name: 'Dollar cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'USD',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'usd',
        date: past,
        amount: 110,
        currency: 'USD',
      },
    )

    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )

    expect(
      (await screen.findAllByText(formatAmount(110, 'EUR'))).length,
    ).toBeGreaterThan(0)
    expect(screen.getByTestId('positions-total')).toHaveTextContent(
      formatAmount(110, 'EUR'),
    )
    expect(screen.getByText('From rates')).toBeInTheDocument()
    expect(screen.getByText(/this month/)).not.toHaveTextContent(
      formatSignedAmount(10, 'EUR'),
    )
    expect(
      screen.queryByText(
        (_, node) =>
          node?.tagName === 'SPAN' &&
          node.textContent === formatAmount(100, 'EUR') &&
          node.className.includes('text-4xl'),
      ),
    ).not.toBeInTheDocument()
  })

  it('shows latest net worth on open when the chart range ends earlier (#225)', async () => {
    const today = todayIsoDate()
    const rangeEnd = addDaysIso(today, -10)
    useChartRangeStore.setState({
      range: '1M',
      rangeEnd,
      rangeEndPinned: true,
      customStart: addDaysIso(today, -30),
      customEnd: rangeEnd,
    })
    const past = addDaysIso(today, -30)
    const now = `${today}T00:00:00.000Z`
    await useAssetStore.getState().saveAsset(
      {
        id: 'cash',
        name: 'Cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'cash',
        date: past,
        amount: 800,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'cash',
        date: today,
        amount: 1000,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(screen.getByTestId('positions-total')).toHaveTextContent(
      formatAmount(1000, 'EUR'),
    )
    expect(screen.getByRole('button', { name: /Holdings/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
