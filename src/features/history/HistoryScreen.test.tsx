import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { addDaysIso } from '@/shared/lib/dates'
import { formatAmount, formatSignedAmount, todayIsoDate } from '@/shared/lib/money'
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
  it('shows range chips and current net worth', async () => {
    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('button', { name: '3M' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
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
    expect(
      (await screen.findAllByText(formatAmount(endTotal, 'EUR'))).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(
        `${formatSignedAmount(endTotal - startTotal, 'EUR')} over 3M`,
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(`${formatSignedAmount(0, 'EUR')} over 3M`),
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

  it('lists only days the user added a snapshot, not carry-forward calendar days', async () => {
    render(
      <MemoryRouter>
        <HistoryScreen />
      </MemoryRouter>,
    )

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
})
