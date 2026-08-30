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

  it('keeps archived assets on the Archived chip, not All (#160)', async () => {
    const user = userEvent.setup()
    await addNamedAsset('old', 'Old cash', 10, 'EUR', 'archived')
    await addNamedAsset('alpha', 'Alpha', 300, 'EUR', 'excluded')
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    await screen.findByText('Broker')
    expect(listedAssetHrefs()).toEqual([
      '/assets/a1',
      '/assets/alpha',
    ])
    await user.click(screen.getByRole('button', { name: 'Hidden' }))
    expect(listedAssetHrefs()).toEqual(['/assets/old'])
    expect(
      screen.queryByRole('button', { name: 'Hide Old cash' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Actions for Old cash' }),
    ).not.toBeInTheDocument()
  })

  it('hides from a ⋮ menu and greys the row without opening details (#158)', async () => {
    const user = userEvent.setup()
    await addNamedAsset('cash', 'Cash', 50, 'EUR')
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('link', { name: /Broker/ })).toHaveAttribute(
      'href',
      '/assets/a1',
    )
    expect(
      screen.queryByRole('button', { name: 'Hide Broker' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Actions for Broker' }))
    await user.click(screen.getByRole('menuitem', { name: 'Hide Broker' }))
    await waitFor(() => {
      expect(useAssetStore.getState().assets.find((a) => a.id === 'a1')
        ?.trackingStatus).toBe('excluded')
    })
    expect(screen.getByRole('heading', { name: 'Assets' })).toBeInTheDocument()
    const hidden = screen.getByText('Broker').closest('[data-excluded]')
    expect(hidden).toHaveAttribute('data-excluded', 'true')
    expect(hidden).toHaveClass('opacity-60')
    await user.click(screen.getByRole('button', { name: 'Actions for Broker' }))
    await user.click(screen.getByRole('menuitem', { name: 'Show Broker' }))
    await waitFor(() => {
      expect(useAssetStore.getState().assets.find((a) => a.id === 'a1')
        ?.trackingStatus).toBe('included')
    })
    expect(
      screen.getByText('Broker').closest('[data-excluded]'),
    ).toHaveAttribute('data-excluded', 'false')
  })

  it('hides the row menu while reordering (#158)', async () => {
    const user = userEvent.setup()
    await addNamedAsset('cash', 'Cash', 50, 'EUR')
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('button', { name: 'Actions for Broker' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reorder' }))
    expect(
      screen.queryByRole('button', { name: 'Actions for Broker' }),
    ).not.toBeInTheDocument()
  })

  it('shows type and institution on the muted Assets subtitle (#109)', async () => {
    const existing = useAssetStore.getState().assets[0]
    await useAssetStore.getState().saveAsset({
      ...existing!,
      institution: 'BOG',
    })
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Brokerage · BOG')).toBeInTheDocument()
  })

  it('shows ownership share on the muted subtitle when not 1/1 (#151)', async () => {
    const existing = useAssetStore.getState().assets[0]
    await useAssetStore.getState().saveAsset({
      ...existing!,
      ownershipShareNumerator: 1,
      ownershipShareDenominator: 2,
    })
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText(/Your share: 1\/2/)).toBeInTheDocument()
  })

  it('shows Your share: 1/1 on full-ownership property (#152)', async () => {
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
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByText('Квартира Корнея')).toBeInTheDocument()
    expect(screen.getByText(/Your share: 1\/1/)).toBeInTheDocument()
    expect(screen.getByText('Broker')).toBeInTheDocument()
    expect(screen.getAllByText(/Your share: 1\/1/)).toHaveLength(1)
  })

  it('wraps filter chips instead of a horizontal scroller (#153)', async () => {
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('asset-filters')).toHaveClass('flex-wrap')
    expect(screen.getByTestId('asset-filters')).not.toHaveClass('overflow-x-auto')
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hidden' })).toBeInTheDocument()
  })
})

async function addNamedAsset(
  id: string,
  name: string,
  amount: number,
  currency: 'EUR' | 'USD',
  trackingStatus: 'included' | 'excluded' | 'archived' = 'included',
) {
  await useAssetStore.getState().saveAsset(
    {
      id,
      name,
      assetClass: 'money',
      type: 'cash',
      currency,
      trackingStatus,
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

describe('AssetsScreen sort (#100)', () => {
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

  it('lists excluded assets after included, still sorted within the group (#160)', async () => {
    const user = userEvent.setup()
    await addNamedAsset('cash', 'Cash', 50, 'EUR')
    await addNamedAsset('alpha', 'Alpha', 300, 'EUR', 'excluded')
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    await screen.findByLabelText('Sort assets')
    await user.selectOptions(screen.getByLabelText('Sort assets'), 'name_asc')
    expect(listedAssetHrefs()).toEqual([
      '/assets/a1',
      '/assets/cash',
      '/assets/alpha',
    ])
    await user.selectOptions(
      screen.getByLabelText('Sort assets'),
      'amount_desc',
    )
    expect(listedAssetHrefs()).toEqual([
      '/assets/a1',
      '/assets/cash',
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
    await screen.findByLabelText('Sort assets')
    await waitFor(() => {
      expect(listedAssetHrefs()).toEqual([
        '/assets/cash',
        '/assets/a1',
        '/assets/alpha',
      ])
    })
  })

  it('shows drag grips only after entering reorder mode (#104)', async () => {
    const user = userEvent.setup()
    await addNamedAsset('cash', 'Cash', 50, 'EUR')
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    await screen.findByRole('button', { name: 'Reorder' })
    expect(
      screen.queryByRole('button', { name: 'Reorder Broker' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reorder' }))
    expect(
      await screen.findByRole('button', { name: 'Reorder Broker' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(
      screen.queryByRole('button', { name: 'Reorder Broker' }),
    ).not.toBeInTheDocument()
  })

  it('leaves reorder mode when a named sort is chosen', async () => {
    const user = userEvent.setup()
    await addNamedAsset('cash', 'Cash', 50, 'EUR')
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'Reorder' }))
    expect(
      await screen.findByRole('button', { name: 'Reorder Broker' }),
    ).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Sort assets'), 'name_asc')
    expect(
      screen.queryByRole('button', { name: 'Reorder Broker' }),
    ).not.toBeInTheDocument()
  })

  it('persists custom order only on Save, not when leaving without Save', async () => {
    const user = userEvent.setup()
    await addNamedAsset('cash', 'Cash', 50, 'EUR')
    await addNamedAsset('alpha', 'Alpha', 300, 'EUR')
    await useSettingsStore.getState().persistCustomAssetOrder([
      'cash',
      'a1',
      'alpha',
    ])
    render(
      <MemoryRouter>
        <AssetsScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'Reorder' }))
    expect(await screen.findByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(useSettingsStore.getState().settings.assetListOrder).toEqual([
      'cash',
      'a1',
      'alpha',
    ])
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(useSettingsStore.getState().settings.assetListOrder).toEqual([
      'cash',
      'a1',
      'alpha',
    ])
    await user.click(screen.getByRole('button', { name: 'Reorder' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(useSettingsStore.getState().settings.assetListSort).toBe('custom')
      expect(useSettingsStore.getState().settings.assetListOrder).toEqual([
        'cash',
        'a1',
        'alpha',
      ])
    })
  })
})
