import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { addDaysIso } from '@/shared/lib/dates'
import {
  formatAmount,
  formatChartAxisDate,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { HistoryScreen } from './HistoryScreen'

const now = '2026-08-17T00:00:00.000Z'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
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
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS, loaded: true })
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
      date: '2026-08-01',
      amount: 800,
      currency: 'EUR',
    },
  )
  await useAssetStore.getState().saveSnapshots([
    {
      assetId: 'a1',
      date: '2026-08-17',
      amount: 1000,
      currency: 'EUR',
    },
  ])
})

describe('HistoryScreen', () => {
  it('shows range chips, zoom buttons, and current net worth (#116)', async () => {
    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('button', { name: 'Month' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument()
    expect(screen.getByTestId('chart-range-toolbar').className).toMatch(
      /flex-wrap/,
    )
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
  })

  it('shows the selected-range change from the visible series, not zero vs current net worth', async () => {
    await db.assets.clear()
    await db.snapshots.clear()
    useAssetStore.setState({ assets: [], snapshots: [], loaded: false })

    const today = todayIsoDate()
    const yesterday = addDaysIso(today, -1)
    const created = `${yesterday}T00:00:00.000Z`
    await useFxStore.getState().saveManualRates([
      { date: yesterday, base: 'EUR', quote: 'RUB', rate: 100 },
      { date: today, base: 'EUR', quote: 'RUB', rate: 90 },
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
        createdAt: created,
        updatedAt: created,
      },
      {
        assetId: 'eur',
        date: yesterday,
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
        createdAt: created,
        updatedAt: created,
      },
      {
        assetId: 'rub',
        date: yesterday,
        amount: 20000,
        currency: 'RUB',
      },
    )

    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )

    const startTotal = 1000 + 200
    const endTotal = 1000 + 20000 / 90
    const amountChange = 0
    const rateChange = endTotal - startTotal
    expect(
      (await screen.findAllByText(formatAmount(endTotal, 'EUR'))).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(
        `${formatSignedAmount(amountChange, 'EUR')} since ${formatChartAxisDate(yesterday, 'en')}`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('From amounts')).toBeInTheDocument()
    expect(screen.getByText('From rates')).toBeInTheDocument()
    expect(
      screen.getByText(formatSignedAmount(rateChange, 'EUR')),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        `${formatSignedAmount(endTotal - startTotal, 'EUR')} over 1M`,
      ),
    ).not.toBeInTheDocument()
  })

  it('measures 1M from thirty days ago, not the previous snapshot day (#90)', async () => {
    await db.assets.clear()
    await db.snapshots.clear()
    useAssetStore.setState({ assets: [], snapshots: [], loaded: false })

    const today = todayIsoDate()
    const farAgo = addDaysIso(today, -120)
    const recent = addDaysIso(today, -5)
    const created = `${farAgo}T00:00:00.000Z`
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
        createdAt: created,
        updatedAt: created,
      },
      {
        assetId: 'cash',
        date: farAgo,
        amount: 500,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'cash',
        date: recent,
        amount: 800,
        currency: 'EUR',
      },
      {
        assetId: 'cash',
        date: today,
        amount: 1000,
        currency: 'EUR',
      },
    ])

    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )

    expect(
      await screen.findByText(`${formatSignedAmount(500, 'EUR')} over 1M`),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(`${formatSignedAmount(200, 'EUR')} over 1M`),
    ).not.toBeInTheDocument()
  })

  it('expands a day to show the holdings behind that total', async () => {
    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )

    await screen.findByRole('button', { name: 'Holdings on 2026-08-17' })
    expect(screen.queryByText('Revolut')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Holdings on 2026-08-17' }),
    )
    expect(await screen.findByText('Revolut')).toBeInTheDocument()
  })

  it('shows a snapshot note on the expanded holdings list (#97)', async () => {
    const existing = useAssetStore
      .getState()
      .snapshots.find((row) => row.date === '2026-08-17')
    expect(existing).toBeDefined()
    await useAssetStore.getState().updateSnapshot({
      ...existing!,
      note: 'Salary landed',
    })

    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )

    await userEvent.click(
      await screen.findByRole('button', { name: 'Holdings on 2026-08-17' }),
    )
    expect(await screen.findByText('Salary landed')).toBeInTheDocument()
  })

  it('lists only days the user added a snapshot, not carry-forward calendar days (#187)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'All' }))
    expect(
      await screen.findByRole('button', { name: 'Holdings on 2026-08-17' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Holdings on 2026-08-01' }),
    ).toBeInTheDocument()
    const today = todayIsoDate()
    if (today !== '2026-08-17' && today !== '2026-08-01') {
      expect(
        screen.queryByRole('button', { name: `Holdings on ${today}` }),
      ).not.toBeInTheDocument()
    }
  })

  it('does not format History in leftover EUR when All / Original is selected (#96)', async () => {
    await db.assets.clear()
    await db.snapshots.clear()
    useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
    const originalSettings = {
      ...DEFAULT_SETTINGS,
      baseCurrency: 'EUR',
      currencyDisplayMode: 'native' as const,
    }
    await db.settings.put(originalSettings)
    useSettingsStore.setState({
      settings: originalSettings,
      loaded: false,
    })
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
        <HistoryScreen />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Holdings by currency')).toBeInTheDocument()
    expect(screen.getByText('RUB')).toBeInTheDocument()
    expect(screen.getAllByText(/20,000/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/€/)).not.toBeInTheDocument()
  })

  it('switches to a month calendar that marks snapshot days only (#189)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('button', { name: 'List' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByTestId('history-calendar')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Calendar' }))
    expect(screen.getByTestId('history-calendar')).toBeInTheDocument()
    expect(
      screen.getByTestId('history-calendar-mark-2026-08-01'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('history-calendar-mark-2026-08-17'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('history-calendar-mark-2026-08-02'),
    ).not.toBeInTheDocument()
  })
})
