import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AllocationScreen } from './AllocationScreen'

const now = '2026-08-17T00:00:00.000Z'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
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

  it('shows native currency amounts in Original mode (#108)', async () => {
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
      await screen.findByText('Pick Currency or Converted'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('allocation-chart')).not.toBeInTheDocument()
    expect(
      screen.queryByText(formatAmount(8000, 'EUR')),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Currency' }))
    expect(
      await screen.findByText(/Native amounts by currency/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatAmount(8000, 'USD')),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatAmount(1000, 'EUR')),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(formatAmount(8000, 'EUR')),
    ).not.toBeInTheDocument()
  })
})
