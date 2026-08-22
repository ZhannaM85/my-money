import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    expect(screen.getByText('native USD')).toBeInTheDocument()
    expect(
      screen.queryByText(`est. ${formatAmount(100, 'EUR')}`),
    ).not.toBeInTheDocument()
  })
})

async function addNamedAsset(
  id: string,
  name: string,
  amount: number,
  currency: 'EUR' | 'USD',
) {
  await useAssetStore.getState().saveAsset(
    {
      id,
      name,
      assetClass: 'money',
      type: 'cash',
      currency,
      trackingStatus: 'included',
      valuationMethod: 'account_balance',
      updateFrequency: 'weekly',
      createdAt: now,
      updatedAt: now,
    },
    {
      assetId: id,
      date: '2026-08-17',
      amount,
      currency,
    },
  )
}

function listedAssetHrefs() {
  return screen
    .getAllByRole('link')
    .map((el) => el.getAttribute('href'))
    .filter(
      (href): href is string =>
        Boolean(href?.startsWith('/assets/') && href !== '/assets/new'),
    )
}

describe('AssetsScreen sort', () => {
  it('sorts by name and by the amount shown in Converted mode', async () => {
    const user = userEvent.setup()
    await addNamedAsset('cash', 'Cash', 50, 'EUR')
    await addNamedAsset('alpha', 'Alpha', 300, 'EUR')
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    await screen.findByLabelText('Sort assets')
    await user.selectOptions(screen.getByLabelText('Sort assets'), 'name_asc')
    expect(listedAssetHrefs()).toEqual([
      '/assets/alpha',
      '/assets/a1',
      '/assets/cash',
    ])
    await user.selectOptions(
      screen.getByLabelText('Sort assets'),
      'amount_asc',
    )
    expect(listedAssetHrefs()).toEqual([
      '/assets/cash',
      '/assets/a1',
      '/assets/alpha',
    ])
  })

  it('restores a persisted custom order', async () => {
    await addNamedAsset('cash', 'Cash', 50, 'EUR')
    await addNamedAsset('alpha', 'Alpha', 300, 'EUR')
    await useSettingsStore.getState().persistCustomAssetOrder([
      'cash',
      'a1',
      'alpha',
    ])
    useSettingsStore.setState({
      settings: DEFAULT_SETTINGS,
      loaded: false,
    })
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    await screen.findByRole('button', { name: 'Reorder Cash' })
    await waitFor(() => {
      expect(listedAssetHrefs()).toEqual([
        '/assets/cash',
        '/assets/a1',
        '/assets/alpha',
      ])
    })
  })
})
