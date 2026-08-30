import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AllocationScreen } from './AllocationScreen'

const now = '2026-08-17T00:00:00.000Z'
const fxEnsureRange = useFxStore.getState().ensureRange
const fxLoadCached = useFxStore.getState().loadCached

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useFxStore.setState({
    quotes: [],
    manualQuotes: [],
    loading: false,
    error: undefined,
    ensureRange: fxEnsureRange,
    loadCached: fxLoadCached,
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
      date: '2026-08-17',
      amount: 1000,
      currency: 'EUR',
    },
  )
})

describe('AllocationScreen', () => {
  it('lists class share with percent', async () => {
    render(
      <MemoryRouter>
        <AllocationScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Money')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('shows native Class/Type rows per currency in Original mode (#108)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd',
        name: 'USD cash',
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
        amount: 8000,
        currency: 'USD',
      },
    )
    const settings = {
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native' as const,
      baseCurrency: 'EUR',
    }
    await db.settings.put(settings)
    useSettingsStore.setState({
      settings,
      loaded: true,
    })
    render(
      <MemoryRouter>
        <AllocationScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByText(/Native amounts by class or type/),
    ).toBeInTheDocument()
    expect(screen.getByTestId('allocation-chart')).toBeInTheDocument()
    expect(screen.getByText('Money · USD')).toBeInTheDocument()
    expect(screen.getByText('Money · EUR')).toBeInTheDocument()
    expect(screen.getByText(formatAmount(8000, 'USD'))).toBeInTheDocument()
    expect(screen.getByText(formatAmount(1000, 'EUR'))).toBeInTheDocument()
    expect(
      screen.queryByText(formatAmount(8000, 'EUR')),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Type' }))
    expect(await screen.findByText('Cash · USD')).toBeInTheDocument()
    expect(screen.getByText('Bank account · EUR')).toBeInTheDocument()
    expect(screen.getByText(formatAmount(8000, 'USD'))).toBeInTheDocument()
    expect(screen.getByText(formatAmount(1000, 'EUR'))).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Currency' }))
    expect(
      await screen.findByText(/Native amounts by currency/),
    ).toBeInTheDocument()
    expect(screen.getByText(formatAmount(8000, 'USD'))).toBeInTheDocument()
    expect(screen.getByText(formatAmount(1000, 'EUR'))).toBeInTheDocument()
  })

  it('uses hidden RUB for Original share % not leftover Settings EUR (#121)', async () => {
    await db.assets.clear()
    await db.snapshots.clear()
    useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
    await useAssetStore.getState().saveAsset(
      {
        id: 'rub',
        name: 'RUB cash',
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
        amount: 1_000_000,
        currency: 'RUB',
      },
    )
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd',
        name: 'USD cash',
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
        amount: 10_000,
        currency: 'USD',
      },
    )
    const settings = {
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native' as const,
      baseCurrency: 'EUR',
    }
    await db.settings.put(settings)
    useSettingsStore.setState({ settings, loaded: true })
    useFxStore.setState({
      quotes: [
        {
          date: '2026-08-17',
          base: 'USD',
          quote: 'RUB',
          rate: 80,
        },
      ],
      ensureRange: async () => {},
      loadCached: async () => {},
    })
    render(
      <MemoryRouter>
        <AllocationScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Money · RUB')).toBeInTheDocument()
    expect(screen.getByText('Money · USD')).toBeInTheDocument()
    expect(screen.getByText(/1,000,000/)).toBeInTheDocument()
    expect(screen.getByText(/10,000/)).toBeInTheDocument()
    expect(screen.getByText('56%')).toBeInTheDocument()
    expect(screen.getByText('44%')).toBeInTheDocument()
    expect(screen.queryByText('1%')).not.toBeInTheDocument()
    expect(screen.queryByText('99%')).not.toBeInTheDocument()
  })

  it('expands Class and Currency rows to list assets (#122)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveAsset(
      {
        id: 'usd',
        name: 'USD cash',
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
        amount: 8000,
        currency: 'USD',
      },
    )
    const settings = {
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native' as const,
      baseCurrency: 'EUR',
    }
    await db.settings.put(settings)
    useSettingsStore.setState({ settings, loaded: true })
    render(
      <MemoryRouter>
        <AllocationScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Money · USD')).toBeInTheDocument()
    expect(screen.queryByText('USD cash')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Money · USD · Holdings' }),
    )
    expect(await screen.findByText('USD cash')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Currency' }))
    expect(await screen.findByText('USD')).toBeInTheDocument()
    expect(screen.queryByText('USD cash')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'USD · Holdings' }))
    expect(await screen.findByText('USD cash')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Type' }))
    expect(await screen.findByText('Cash · USD')).toBeInTheDocument()
    expect(screen.queryByText('USD cash')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Cash · USD · Holdings' }),
    )
    expect(await screen.findByText('USD cash')).toBeInTheDocument()
  })

  it('expands Type rows to list assets (#123)', async () => {
    const user = userEvent.setup()
    const settings = {
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native' as const,
      baseCurrency: 'EUR',
    }
    await db.settings.put(settings)
    useSettingsStore.setState({ settings, loaded: true })
    render(
      <MemoryRouter>
        <AllocationScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'Type' }))
    expect(await screen.findByText('Bank account · EUR')).toBeInTheDocument()
    expect(screen.queryByText('Revolut')).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Bank account · EUR · Holdings' }),
    )
    expect(await screen.findByText('Revolut')).toBeInTheDocument()
  })

  it('shows ownership share on expanded holdings when not 1/1 (#151)', async () => {
    const user = userEvent.setup()
    const existing = useAssetStore.getState().assets[0]
    await useAssetStore.getState().saveAsset({
      ...existing!,
      ownershipShareNumerator: 1,
      ownershipShareDenominator: 2,
    })
    const settings = {
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native' as const,
      baseCurrency: 'EUR',
    }
    await db.settings.put(settings)
    useSettingsStore.setState({ settings, loaded: true })
    render(
      <MemoryRouter>
        <AllocationScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'Type' }))
    await user.click(
      await screen.findByRole('button', {
        name: 'Bank account · EUR · Holdings',
      }),
    )
    expect(await screen.findByText('Your share: 1/2')).toBeInTheDocument()
  })
})
