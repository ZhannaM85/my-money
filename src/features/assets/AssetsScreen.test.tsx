import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AssetsScreen } from './AssetsScreen'

const now = '2026-08-17T00:00:00.000Z'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: true,
  })
  useFxStore.setState({
    ...useFxStore.getState(),
    quotes: [{ date: '2026-08-17', base: 'EUR', quote: 'USD', rate: 1.1 }],
  })
  await useAssetStore.getState().saveAsset(
    {
      id: 'a1',
      name: 'Broker',
      assetClass: 'investments',
      type: 'brokerage',
      currency: 'USD',
      trackingStatus: 'included',
      valuationMethod: 'account_balance',
      updateFrequency: 'weekly',
      createdAt: now,
      updatedAt: now,
    },
    {
      assetId: 'a1',
      date: '2026-08-17',
      amount: 110,
      currency: 'USD',
    },
  )
})

describe('AssetsScreen', () => {
  it('shows converted amounts first when the display mode is converted', async () => {
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Broker')).toBeInTheDocument()
    expect(screen.getByText(formatAmount(100, 'EUR'))).toBeInTheDocument()
    expect(screen.getByText('native USD')).toBeInTheDocument()
  })

  it('shows original amounts first when the display mode is native', async () => {
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native',
    })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, currencyDisplayMode: 'native' },
      loaded: false,
    })

    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Broker')).toBeInTheDocument()
    expect(screen.getByText(formatAmount(110, 'USD'))).toBeInTheDocument()
    expect(
      screen.getByText(`est. ${formatAmount(100, 'EUR')}`),
    ).toBeInTheDocument()
  })
})
