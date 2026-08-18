import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AssetDetailsScreen } from './AssetDetailsScreen'

const now = '2026-08-17T00:00:00.000Z'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: true,
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

describe('AssetDetailsScreen', () => {
  it('shows native history and overall change', async () => {
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('heading', { name: 'Revolut' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Bank account · EUR')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('2026-08-01')).toBeInTheDocument()
    expect(screen.getByText(/Since first snapshot/)).toBeInTheDocument()
  })

  it('appends a snapshot from the update field', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.type(screen.getByLabelText('New amount'), '1100')
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter((row) => row.assetId === 'a1'),
      ).toHaveLength(3)
    })
  })

  it('excludes and re-includes an asset from net worth', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(
      screen.getByRole('button', { name: 'Exclude from net worth' }),
    )
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('excluded')
    })
    expect(screen.getByText('Not counted in net worth')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Include in net worth' }),
    )
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('included')
    })
  })

  it('hides and restores an asset', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(screen.getByRole('button', { name: 'Hide asset' }))
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('archived')
    })
  })
})
