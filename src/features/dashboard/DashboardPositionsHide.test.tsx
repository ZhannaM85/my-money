import 'fake-indexeddb/auto'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AllocationScreen } from '@/features/allocation'
import { DashboardScreen } from './DashboardScreen'
import { resetDashboardStores } from './dashboardTestSetup'

beforeEach(async () => {
  await resetDashboardStores()
})

describe('DashboardPositions hide', () => {
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
    await userEvent.click(
      await screen.findByRole('button', { name: 'Holdings' }),
    )
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
    expect(
      screen.getByRole('button', { name: 'Show Sosnovo' }),
    ).toBeInTheDocument()
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
    await userEvent.click(
      await screen.findByRole('button', { name: 'Holdings' }),
    )
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
    expect(
      screen.getByRole('button', { name: 'Show Sosnovo' }),
    ).toBeInTheDocument()
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
    expect(
      screen.getByRole('button', { name: 'Show Sosnovo' }),
    ).toBeInTheDocument()
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
    await userEvent.click(
      screen.getByRole('button', { name: 'GEL · Holdings' }),
    )
    const hidden = (await screen.findByText('Sosnovo')).closest(
      '[data-excluded]',
    )
    expect(hidden).toHaveAttribute('data-excluded', 'true')
    expect(hidden).toHaveClass('opacity-60')
    expect(
      screen.getByRole('button', { name: 'Show Sosnovo' }),
    ).toBeInTheDocument()
  })
})
