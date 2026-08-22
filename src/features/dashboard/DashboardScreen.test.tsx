import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import {
  formatAmount,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { addDaysIso, monthStartIso } from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { DashboardScreen } from './DashboardScreen'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  await db.fxRates.clear()
  await db.manualFxRates.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useFxStore.setState({
    ...useFxStore.getState(),
    quotes: [],
    manualQuotes: [],
    loading: false,
    error: undefined,
  })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: false,
  })
})

describe('DashboardScreen', () => {
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

  it('lets the user zoom the dashboard chart out across wider ranges', async () => {
    const user = userEvent.setup()
    const today = todayIsoDate()
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
      date: '2026-01-01',
      amount: 500,
      currency: 'EUR',
    })
    await useAssetStore.getState().saveAsset(asset, {
      assetId: 'a1',
      date: today,
      amount: 1000,
      currency: 'EUR',
    })

    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Chart range: 1M/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(screen.getByText(/Chart range: 3M/)).toBeInTheDocument()
  })

  it('disables the currency filter in Converted mode', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useFxStore.getState().saveManualRates([
      { date: '2026-08-17', base: 'EUR', quote: 'USD', rate: 1.1 },
    ])
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
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
        date: '2026-08-17',
        amount: 110,
        currency: 'USD',
      },
    )

    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )

    expect(await screen.findAllByText(formatAmount(1100, 'EUR'))).not.toHaveLength(0)
    const currency = screen.getByLabelText('Currency')
    expect(currency).toBeDisabled()
    expect(currency).toHaveValue('EUR')
    expect(screen.queryByRole('option', { name: 'All' })).not.toBeInTheDocument()
  })

  it('shows every native holding in Original + All', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native',
    })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, currencyDisplayMode: 'native' },
      loaded: false,
    })
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'Ruble cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'RUB',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'rub',
        date: '2026-08-17',
        amount: 20000,
        currency: 'RUB',
      },
    )

    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Holdings by currency')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText((_, node) => node?.textContent === formatAmount(20000, 'RUB')),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Currency')).not.toBeDisabled()
    expect(screen.queryByText('From amounts')).not.toBeInTheDocument()
    expect(screen.queryByTestId('allocation-chart')).not.toBeInTheDocument()
    expect(screen.queryByText('Euro cash')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'EUR · Holdings' }))
    expect(await screen.findByText('Euro cash')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'RUB · Holdings' }))
    expect(screen.getByText('Ruble cash')).toBeInTheDocument()
  })

  it('filters Original mode to one native currency', async () => {
    const user = userEvent.setup()
    const now = '2026-08-17T00:00:00.000Z'
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native',
    })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, currencyDisplayMode: 'native' },
      loaded: false,
    })
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'Ruble cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'RUB',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'rub',
        date: '2026-08-17',
        amount: 20000,
        currency: 'RUB',
      },
    )

    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Holdings by currency')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Currency'), 'EUR')
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(
      screen.queryByText((_, node) => node?.textContent === formatAmount(20000, 'RUB')),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('allocation-chart')).not.toBeInTheDocument()
  })

  it('lists unconvertible holdings instead of hiding them', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'Ruble cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'RUB',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'rub',
        date: '2026-08-17',
        amount: 20000,
        currency: 'RUB',
      },
    )

    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Holdings' })).toBeInTheDocument()
    expect(screen.queryByText('Ruble cash')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Holdings' }))
    expect(await screen.findByText('Ruble cash')).toBeInTheDocument()
    expect(screen.getByText('Conversion not available')).toBeInTheDocument()
    expect(
      screen.getAllByText(
        (_, node) =>
          node?.children.length === 0 &&
          node.textContent === formatAmount(20000, 'RUB'),
      ).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText(formatAmount(1000, 'EUR')).length).toBeGreaterThan(0)
  })

  it('lists each Converted holding with original and converted amounts', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useFxStore.getState().saveManualRates([
      { date: '2026-08-17', base: 'EUR', quote: 'RUB', rate: 100 },
    ])
    await useAssetStore.getState().saveAsset(
      {
        id: 'eur',
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
        assetId: 'eur',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'Ruble cash',
        assetClass: 'money',
        type: 'cash',
        currency: 'RUB',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'weekly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'rub',
        date: '2026-08-17',
        amount: 20000,
        currency: 'RUB',
      },
    )

    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Holdings' }))
    expect(await screen.findByText('Ruble cash')).toBeInTheDocument()
    expect(screen.getByText('Euro cash')).toBeInTheDocument()
    expect(
      screen.getAllByText(
        (_, node) =>
          node?.children.length === 0 &&
          node.textContent === formatAmount(20000, 'RUB'),
      ).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText(formatAmount(200, 'EUR')).length).toBeGreaterThan(0)
    expect(screen.getAllByText(formatAmount(1200, 'EUR')).length).toBeGreaterThan(0)
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
      await screen.findByText(formatAmount(110, 'EUR')),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        (_, node) =>
          node?.tagName === 'SPAN' &&
          node.textContent === formatAmount(100, 'EUR') &&
          node.className.includes('text-4xl'),
      ),
    ).not.toBeInTheDocument()
  })
})
