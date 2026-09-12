import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import {
  renderAssetDetails,
  resetAssetDetailsStores,
  seedRevolutAsset,
} from '@/features/assets/assetDetailsTestSetup'
import { DashboardScreen } from '@/features/dashboard/DashboardScreen'
import { resetDashboardStores } from '@/features/dashboard/dashboardTestSetup'
import { HistoryScreen } from '@/features/history/HistoryScreen'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import {
  resetChartRangeStore,
  useChartRangeStore,
} from '@/stores/chartRangeStore'
import { useSettingsStore } from '@/stores/settingsStore'

const now = '2026-08-17T00:00:00.000Z'

async function seedRevolutBook() {
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
}

beforeEach(async () => {
  await resetDashboardStores()
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS, loaded: true })
  resetChartRangeStore()
})

describe('ChartRangeControls (#239)', () => {
  it('keeps the Dashboard chip when History opens', async () => {
    await seedRevolutBook()
    const user = userEvent.setup()
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
        <HistoryScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText(/Chart range: All/)).toBeInTheDocument()
  })

  it('does not write asset-detail range into the shared store', async () => {
    await db.assets.clear()
    await db.snapshots.clear()
    await resetAssetDetailsStores()
    await seedRevolutAsset()
    useChartRangeStore.getState().setRange('1W')
    const user = userEvent.setup()
    renderAssetDetails()

    expect(await screen.findByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await user.click(screen.getByRole('button', { name: 'Year' }))
    expect(screen.getByRole('button', { name: 'Year' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(useChartRangeStore.getState().range).toBe('1W')
  })
})
