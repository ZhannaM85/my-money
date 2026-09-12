import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { formatAmount, todayIsoDate } from '@/shared/lib/money'
import { addDaysIso } from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useChartRangeStore } from '@/stores/chartRangeStore'
import { DashboardScreen } from './DashboardScreen'
import { resetDashboardStores } from './dashboardTestSetup'

beforeEach(async () => {
  await resetDashboardStores()
})

describe('DashboardPositions', () => {
  it('renders Positions below the net-worth chart (#134)', async () => {
    const today = todayIsoDate()
    const now = `${today}T00:00:00.000Z`
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
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
        assetId: 'a1',
        date: today,
        amount: 1000,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    const chart = await screen.findByTestId('net-worth-chart')
    const positions = screen.getByTestId('dashboard-positions')
    expect(
      chart.compareDocumentPosition(positions) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    const asOf = screen.getByLabelText('As of')
    expect(
      asOf.compareDocumentPosition(chart) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('shows today Positions after save when the visible chart range ends earlier (#208)', async () => {
    const user = userEvent.setup()
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
    await useFxStore.getState().saveManualRates([
      { date: past, base: 'USD', quote: 'EUR', rate: 0.9 },
      { date: rangeEnd, base: 'USD', quote: 'EUR', rate: 0.9 },
      { date: today, base: 'USD', quote: 'EUR', rate: 0.9 },
    ])
    await useAssetStore.getState().saveAsset(
      {
        id: 'dep',
        name: 'USD Deposit',
        assetClass: 'money',
        type: 'deposit',
        currency: 'USD',
        institution: 'Bank of Georgia',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'monthly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'dep',
        date: past,
        amount: 0,
        currency: 'USD',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'dep',
        date: today,
        amount: 3100,
        currency: 'USD',
      },
    ])
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: /Holdings/i }))
    expect(await screen.findByText('USD Deposit')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(3100, 'USD')).length,
    ).toBeGreaterThan(0)
  })

  it('shows ownership share on Positions when it is not 1/1 (#151)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'flat',
        name: 'Квартира Ручьи',
        assetClass: 'property',
        type: 'apartment',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        ownershipShareNumerator: 1,
        ownershipShareDenominator: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'flat',
        date: '2026-08-17',
        amount: 7_200_000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'cash',
        name: 'Euro cash',
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
    await userEvent.click(
      await screen.findByRole('button', { name: 'Holdings' }),
    )
    expect(await screen.findByText('Квартира Ручьи')).toBeInTheDocument()
    expect(screen.getByText('Your share: 1/2')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(3_600_000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByText(formatAmount(7_200_000, 'EUR')),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Euro cash')).toBeInTheDocument()
    expect(screen.getAllByText('Your share: 1/2')).toHaveLength(1)
  })

  it('shows Your share: 1/1 on full-ownership property (#152)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'flat',
        name: 'Квартира Корнея',
        assetClass: 'property',
        type: 'apartment',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'flat',
        date: '2026-08-17',
        amount: 9_800_000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'cash',
        name: 'Euro cash',
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
    await userEvent.click(
      await screen.findByRole('button', { name: 'Holdings' }),
    )
    expect(await screen.findByText('Квартира Корнея')).toBeInTheDocument()
    expect(screen.getByText('Your share: 1/1')).toBeInTheDocument()
    expect(screen.getByText('Euro cash')).toBeInTheDocument()
    expect(screen.queryAllByText('Your share: 1/1')).toHaveLength(1)
  })
})
