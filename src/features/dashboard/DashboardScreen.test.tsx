import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { todayIsoDate } from '@/shared/lib/money'
import { addDaysIso } from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useChartRangeStore } from '@/stores/chartRangeStore'
import { DashboardScreen } from './DashboardScreen'
import { resetDashboardStores } from './dashboardTestSetup'

beforeEach(async () => {
  await resetDashboardStores()
})

describe('DashboardScreen', () => {
  it('does not show grey helper blurbs on Dashboard (#230)', async () => {
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Assets minus debts, in your base currency.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        'What you own minus what you owe, in your base currency.',
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Currency filter is inactive/),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Converted with reference exchange rates/),
    ).not.toBeInTheDocument()
  })

  it('does not show Russian helper blurbs on Сводка (#230)', async () => {
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      locale: 'ru',
    })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
      loaded: false,
    })
    render(
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('heading', { name: 'Сводка' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Активы минус долги, в базовой валюте.'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        'Что у вас есть минус что вы должны, в базовой валюте.',
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Фильтр валюты неактивен/),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Пересчитано по справочным курсам/),
    ).not.toBeInTheDocument()
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
      chart.compareDocumentPosition(earlier) & Node.DOCUMENT_POSITION_FOLLOWING,
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
})
