import 'fake-indexeddb/auto'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import {
  formatAmount,
  formatDateTime,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { addDaysIso, monthStartIso } from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore, FX_LAST_FETCHED_KEY } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import {
  CHART_RANGE_STORAGE_KEY,
  useChartRangeStore,
} from '@/stores/chartRangeStore'
import { AllocationScreen } from '@/features/allocation'
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
    lastFetchedAt: undefined,
  })
  localStorage.removeItem(FX_LAST_FETCHED_KEY)
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: false,
  })
  useComparisonStore.setState({ dates: [] })
  localStorage.removeItem(CHART_RANGE_STORAGE_KEY)
  useChartRangeStore.setState({
    range: '1M',
    rangeEnd: todayIsoDate(),
    rangeEndPinned: false,
    customStart: todayIsoDate(),
    customEnd: todayIsoDate(),
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

    expect(await screen.findByText(/Chart range: Month/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(screen.getByText(/Chart range: Year/)).toBeInTheDocument()
  })

  it('wraps the chart zoom row so Russian Zoom out stays fully labeled (#195)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      locale: 'ru',
    })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
      loaded: false,
    })
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

    const zoomOut = await screen.findByRole('button', { name: 'Уменьшить' })
    expect(zoomOut).toBeInTheDocument()
    expect(zoomOut.className).toMatch(/whitespace-nowrap/)
    expect(screen.getByTestId('chart-range-toolbar').className).toMatch(
      /flex-wrap/,
    )
  })

  it('keeps the chart range chip after leaving and returning (#185)', async () => {
    const user = userEvent.setup()
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
    const { unmount } = render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'All' }))
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    unmount()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText(/Chart range: All/)).toBeInTheDocument()
  })

  it('forces a quote refresh and reports the result (#186)', async () => {
    const user = userEvent.setup()
    const originalEnsureRange = useFxStore.getState().ensureRange
    const ensureRange = vi.fn(async () => {})
    useFxStore.setState({ ensureRange })
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
    try {
      render(
        <MemoryRouter>
          <DashboardScreen />
        </MemoryRouter>,
      )
      const button = await screen.findByRole('button', { name: 'Update rates' })
      await user.click(button)
      expect(ensureRange).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'EUR',
        expect.any(Array),
        { force: true },
      )
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Rates updated',
      )
    } finally {
      useFxStore.setState({ ensureRange: originalEnsureRange })
    }
  })

  it('explains when Update rates cannot fetch because the device is offline (#186)', async () => {
    const user = userEvent.setup()
    const originalEnsureRange = useFxStore.getState().ensureRange
    const ensureRange = vi.fn(async () => {})
    useFxStore.setState({ ensureRange })
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
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
    try {
      render(
        <MemoryRouter>
          <DashboardScreen />
        </MemoryRouter>,
      )
      await user.click(
        await screen.findByRole('button', { name: 'Update rates' }),
      )
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Offline — using saved rates',
      )
    } finally {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        value: true,
      })
      useFxStore.setState({ ensureRange: originalEnsureRange })
    }
  })

  it('makes Update rates a large full-width control and shows last-updated time (#188)', async () => {
    const user = userEvent.setup()
    const originalEnsureRange = useFxStore.getState().ensureRange
    const ensureRange = vi.fn(async () => {})
    useFxStore.setState({ ensureRange })
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
    try {
      render(
        <MemoryRouter>
          <DashboardScreen />
        </MemoryRouter>,
      )
      const button = await screen.findByRole('button', { name: 'Update rates' })
      expect(button.className).toMatch(/\bh-12\b/)
      expect(button.className).toMatch(/\bw-full\b/)
      await user.click(button)
      const fetched = useFxStore.getState().lastFetchedAt
      expect(fetched).toBeTruthy()
      const status = await screen.findByRole('status')
      expect(status).toHaveTextContent('Rates updated')
      expect(status).toHaveTextContent(formatDateTime(fetched!, 'en'))
    } finally {
      useFxStore.setState({ ensureRange: originalEnsureRange })
    }
  })

  it('keeps the last rate-fetch time after leaving Dashboard (#188)', async () => {
    const stamp = '2026-09-01T11:29:00.000Z'
    localStorage.setItem(FX_LAST_FETCHED_KEY, stamp)
    useFxStore.setState({ lastFetchedAt: stamp })
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
    const { unmount } = render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      formatDateTime(stamp, 'en'),
    )
    unmount()
    useFxStore.setState({ lastFetchedAt: undefined })
    await useFxStore.getState().loadCached()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      formatDateTime(stamp, 'en'),
    )
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

  it('drives Positions from the As of date field (#117)', async () => {
    const today = todayIsoDate()
    const past = addDaysIso(today, -20)
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
        date: past,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 900,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, past)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    expect(
      await screen.findByRole('button', { name: `Holdings on ${past}` }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(500, 'EUR')).length,
    ).toBeGreaterThan(0)
  })

  it('shows Positions total for the selected As of date (#124)', async () => {
    const today = todayIsoDate()
    const past = addDaysIso(today, -20)
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
        date: past,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 900,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, past)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    expect(
      await screen.findByRole('button', { name: `Holdings on ${past}` }),
    ).toBeInTheDocument()
    const total = await screen.findByTestId('positions-total')
    expect(total).toHaveTextContent('Total')
    expect(total).toHaveTextContent(formatAmount(500, 'EUR'))
  })

  it('shows a Today button next to As of that jumps back to today (#125)', async () => {
    const user = userEvent.setup()
    const today = todayIsoDate()
    const past = addDaysIso(today, -20)
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
        date: past,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 900,
        currency: 'EUR',
      },
    ])
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, past)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    expect(
      await screen.findByRole('button', { name: `Holdings on ${past}` }),
    ).toBeInTheDocument()
    const todayButton = screen.getByRole('button', { name: 'Today' })
    expect(todayButton.parentElement?.className).toContain('flex-nowrap')
    expect(todayButton.className).toContain('px-1.5')
    expect(todayButton.className).toContain('text-sm')
    await user.click(todayButton)
    expect(
      await screen.findByRole('button', { name: 'Holdings' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('As of')).toHaveValue(today)
  })

  it('shows earlier/later arrow controls to pan the chart window (#111, #120)', async () => {
    const today = todayIsoDate()
    const past = addDaysIso(today, -60)
    const now = `${today}T00:00:00.000Z`
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
        date: past,
        amount: 800,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 1000,
        currency: 'EUR',
      },
    ])
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    const chart = screen.getByTestId('net-worth-chart')
    const earlier = screen.getByRole('button', { name: 'Earlier dates' })
    expect(
      chart.compareDocumentPosition(earlier) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(earlier).toBeEnabled()
    const later = screen.getByRole('button', { name: 'Later dates' })
    expect(later).toBeDisabled()
    await user.click(earlier)
    expect(screen.getByRole('button', { name: 'Later dates' })).toBeEnabled()
    // Zoom out to All — full span disables pan arrows.
    for (let i = 0; i < 4; i += 1) {
      const zoomOut = screen.getByRole('button', { name: 'Zoom out' })
      if (zoomOut.hasAttribute('disabled')) break
      await user.click(zoomOut)
    }
    expect(screen.getByText(/Chart range: All/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Earlier dates' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Later dates' })).toBeDisabled()
  })

  it('anchors the chart on today when a stale range end was persisted (#210)', async () => {
    const today = todayIsoDate()
    const staleEnd = addDaysIso(today, -6)
    const past = addDaysIso(today, -60)
    const now = `${today}T00:00:00.000Z`
    useChartRangeStore.setState({
      range: '1M',
      rangeEnd: staleEnd,
      rangeEndPinned: false,
      customStart: past,
      customEnd: staleEnd,
    })
    const originalEnsureRange = useFxStore.getState().ensureRange
    const ensureRange = vi.fn(async () => {})
    useFxStore.setState({ ensureRange })
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
        date: past,
        amount: 800,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 1000,
        currency: 'EUR',
      },
    ])
    try {
      render(
        <MemoryRouter>
          <DashboardScreen />
        </MemoryRouter>,
      )
      await screen.findByText('Net worth')
      await waitFor(() => {
        expect(ensureRange).toHaveBeenCalledWith(
          expect.any(String),
          today,
          expect.any(String),
          expect.any(Array),
        )
      })
    } finally {
      useFxStore.setState({ ensureRange: originalEnsureRange })
    }
  })

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

  it('scrolls the title away while keeping As of sticky (#207, #212)', async () => {
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
    const bar = await screen.findByTestId('dashboard-as-of-bar')
    const scroll = screen.getByTestId('dashboard-scroll')
    const asOf = screen.getByLabelText('As of')
    expect(bar).toContainElement(asOf)
    expect(scroll).toContainElement(screen.getByRole('heading', { name: 'Dashboard' }))
    expect(scroll).toContainElement(asOf)
    expect(bar.className).toContain('sticky')
    expect(bar.className).toContain('top-0')
    // #214: scroll on AppShell `#main-content` only — nested overflow split the
    // iOS scrollbar. Sticky As of still sticks to that single scrollport.
    expect(scroll.className).not.toContain('overflow-y-auto')
    expect(scroll.className).toContain('min-w-0')
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
    await user.click(
      await screen.findByRole('button', { name: /Holdings/i }),
    )
    expect(await screen.findByText('USD Deposit')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(3100, 'USD')).length,
    ).toBeGreaterThan(0)
  })

  it('adds As of dates to comparison and shows a banner after two (#137)', async () => {
    const today = todayIsoDate()
    const past = addDaysIso(today, -4)
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
        date: past,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: today,
        amount: 900,
        currency: 'EUR',
      },
    ])
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Net worth')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Go to comparison' }),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Add to comparison' }),
    )
    expect(
      screen.queryByRole('link', { name: 'Go to comparison' }),
    ).not.toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, past)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    await user.click(
      screen.getByRole('button', { name: 'Add to comparison' }),
    )
    expect(screen.getByRole('link', { name: 'Go to comparison' })).toHaveAttribute(
      'href',
      '/compare',
    )
  })

  it('lets the user hide the chart holdings tooltip (#141)', async () => {
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
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('net-worth-chart')).toBeInTheDocument()
    const hide = screen.getByRole('button', { name: 'Hide' })
    expect(hide).toHaveAttribute('aria-pressed', 'false')
    await user.click(hide)
    await waitFor(() => {
      expect(hide).toHaveAttribute('aria-pressed', 'true')
    })
    expect(useSettingsStore.getState().settings.showChartTooltip).toBe(false)
  })

  it('replaces the chart with a warning when As of is before any snapshot (#145)', async () => {
    const today = todayIsoDate()
    const firstSnapshot = addDaysIso(today, -10)
    const beforeAny = addDaysIso(firstSnapshot, -5)
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
        date: firstSnapshot,
        amount: 900,
        currency: 'EUR',
      },
    )
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('net-worth-chart')).toBeInTheDocument()
    const asOf = screen.getByLabelText('As of')
    asOf.focus()
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set?.call(asOf, beforeAny)
    asOf.dispatchEvent(new Event('input', { bubbles: true }))
    asOf.dispatchEvent(new Event('change', { bubbles: true }))
    expect(screen.queryByTestId('net-worth-chart')).not.toBeInTheDocument()
    expect(screen.getByText('No holdings on this date')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Nothing was logged on or before this day. Pick a later As of date, or jump to today.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Chart range' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('As of')).toHaveValue(beforeAny)
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(await screen.findByTestId('net-worth-chart')).toBeInTheDocument()
    expect(
      screen.queryByText('No holdings on this date'),
    ).not.toBeInTheDocument()
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
    await userEvent.click(await screen.findByRole('button', { name: 'Holdings' }))
    expect(await screen.findByText('Квартира Ручьи')).toBeInTheDocument()
    expect(screen.getByText('Your share: 1/2')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(3_600_000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(screen.queryByText(formatAmount(7_200_000, 'EUR'))).not.toBeInTheDocument()
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
    await userEvent.click(await screen.findByRole('button', { name: 'Holdings' }))
    expect(await screen.findByText('Квартира Корнея')).toBeInTheDocument()
    expect(screen.getByText('Your share: 1/1')).toBeInTheDocument()
    expect(screen.getByText('Euro cash')).toBeInTheDocument()
    expect(screen.queryAllByText('Your share: 1/1')).toHaveLength(1)
  })

  it('taps a Positions row to reveal Hide without archiving (#146, #154)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'house',
        name: 'Sosnovo',
        assetClass: 'property',
        type: 'house',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'house',
        date: '2026-08-17',
        amount: 5_000_000,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Holdings' }))
    expect(await screen.findByText('Sosnovo')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Sosnovo'))
    expect(
      screen.getByText('Sosnovo').closest('[data-swipe-open]'),
    ).toHaveAttribute('data-swipe-open', 'true')
    await act(async () => {
      screen.getByRole('button', { name: 'Hide Sosnovo' }).click()
    })
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0]?.trackingStatus).toBe(
        'excluded',
      )
    })
    expect(await screen.findByText('Sosnovo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show Sosnovo' })).toBeInTheDocument()
    await act(async () => {
      screen.getByRole('button', { name: 'Show Sosnovo' }).click()
    })
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0]?.trackingStatus).toBe(
        'included',
      )
    })
  })

  it('shows a hidden Positions row in a disabled visual state (#148)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'house',
        name: 'Sosnovo',
        assetClass: 'property',
        type: 'house',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'house',
        date: '2026-08-17',
        amount: 5_000_000,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'Holdings' }))
    const row = (await screen.findByText('Sosnovo')).closest('[data-excluded]')
    expect(row).toHaveAttribute('data-excluded', 'false')
    await act(async () => {
      screen.getByRole('button', { name: 'Hide Sosnovo' }).click()
    })
    await waitFor(() => {
      expect(
        screen.getByText('Sosnovo').closest('[data-excluded]'),
      ).toHaveAttribute('data-excluded', 'true')
    })
    const hidden = screen.getByText('Sosnovo').closest('[data-excluded]')
    expect(hidden).toHaveClass('opacity-60')
  })

  it('drops a hidden asset from Positions total and net worth (#147)', async () => {
    const now = '2026-08-17T00:00:00.000Z'
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
    await useAssetStore.getState().saveAsset(
      {
        id: 'house',
        name: 'Sosnovo',
        assetClass: 'property',
        type: 'house',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'house',
        date: '2026-08-17',
        amount: 5_000_000,
        currency: 'EUR',
      },
    )
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('positions-total')).toHaveTextContent(
      formatAmount(5_001_000, 'EUR'),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Holdings' }))
    await act(async () => {
      ;(await screen.findByRole('button', { name: 'Hide Sosnovo' })).click()
    })
    expect(await screen.findByText('Sosnovo')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('positions-total')).toHaveTextContent(
        formatAmount(1000, 'EUR'),
      )
    })
    expect(
      screen.getByText(formatAmount(1000, 'EUR'), { selector: '.text-4xl' }),
    ).toBeInTheDocument()
  })

  it('keeps a greyed Positions row after hide from Allocation, navigation, and reload (#156)', async () => {
    const user = userEvent.setup()
    const now = '2026-08-17T00:00:00.000Z'
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
    await useAssetStore.getState().saveAsset(
      {
        id: 'house',
        name: 'Sosnovo',
        assetClass: 'property',
        type: 'house',
        currency: 'EUR',
        trackingStatus: 'included',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'house',
        date: '2026-08-17',
        amount: 5_000_000,
        currency: 'EUR',
      },
    )
    const allocation = render(
      <MemoryRouter>
        <AllocationScreen />
      </MemoryRouter>,
    )
    await user.click(
      await screen.findByRole('button', { name: 'Property · Holdings' }),
    )
    expect(await screen.findByText('Sosnovo')).toBeInTheDocument()
    await user.click(screen.getByText('Sosnovo'))
    await act(async () => {
      screen.getByRole('button', { name: 'Hide Sosnovo' }).click()
    })
    await waitFor(() => {
      expect(
        useAssetStore.getState().assets.find((asset) => asset.id === 'house')
          ?.trackingStatus,
      ).toBe('excluded')
    })
    allocation.unmount()

    const dashboard = render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'Holdings' }))
    expect(await screen.findByText('Sosnovo')).toBeInTheDocument()
    expect(
      screen.getByText('Sosnovo').closest('[data-excluded]'),
    ).toHaveAttribute('data-excluded', 'true')
    expect(screen.getByRole('button', { name: 'Show Sosnovo' })).toBeInTheDocument()
    expect(await screen.findByTestId('positions-total')).toHaveTextContent(
      formatAmount(1000, 'EUR'),
    )
    dashboard.unmount()

    useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'Holdings' }))
    const hidden = (await screen.findByText('Sosnovo')).closest(
      '[data-excluded]',
    )
    expect(hidden).toHaveAttribute('data-excluded', 'true')
    expect(hidden).toHaveClass('opacity-60')
    expect(screen.getByRole('button', { name: 'Show Sosnovo' })).toBeInTheDocument()
    expect(await screen.findByTestId('positions-total')).toHaveTextContent(
      formatAmount(1000, 'EUR'),
    )
    await act(async () => {
      screen.getByRole('button', { name: 'Show Sosnovo' }).click()
    })
    await waitFor(() => {
      expect(
        useAssetStore.getState().assets.find((asset) => asset.id === 'house')
          ?.trackingStatus,
      ).toBe('included')
    })
  })

  it('keeps an excluded-only currency in Original Positions after reload (#156)', async () => {
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
    await useAssetStore.getState().saveAsset(
      {
        id: 'house',
        name: 'Sosnovo',
        assetClass: 'property',
        type: 'house',
        currency: 'GEL',
        trackingStatus: 'excluded',
        valuationMethod: 'account_balance',
        updateFrequency: 'yearly',
        createdAt: now,
        updatedAt: now,
      },
      {
        assetId: 'house',
        date: '2026-08-17',
        amount: 200_000,
        currency: 'GEL',
      },
    )
    useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Holdings by currency')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'GEL · Holdings' }))
    const hidden = (await screen.findByText('Sosnovo')).closest(
      '[data-excluded]',
    )
    expect(hidden).toHaveAttribute('data-excluded', 'true')
    expect(hidden).toHaveClass('opacity-60')
    expect(screen.getByRole('button', { name: 'Show Sosnovo' })).toBeInTheDocument()
  })
})
