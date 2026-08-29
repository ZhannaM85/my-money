import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { ComparisonScreen } from './ComparisonScreen'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useFxStore.setState({
    ...useFxStore.getState(),
    quotes: [],
    manualQuotes: [],
    loading: false,
    error: undefined,
  })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: true,
  })
  useComparisonStore.setState({ dates: [] })
})

describe('ComparisonScreen (#137)', () => {
  it('shows a table of holdings for selected dates and can remove a day', async () => {
    const now = '2026-08-17T00:00:00.000Z'
    await useAssetStore.getState().saveAsset(
      {
        id: 'a1',
        name: 'Cash',
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
        assetId: 'a1',
        date: '2026-08-25',
        amount: 100,
        currency: 'EUR',
      },
    )
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: '2026-08-29',
        amount: 150,
        currency: 'EUR',
      },
    ])
    useComparisonStore.setState({ dates: ['2026-08-25', '2026-08-29'] })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ComparisonScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('comparison-table')).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(100, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(formatAmount(150, 'EUR')).length,
    ).toBeGreaterThan(0)
    await user.click(
      screen.getByRole('button', { name: 'Remove 2026-08-25' }),
    )
    expect(useComparisonStore.getState().dates).toEqual(['2026-08-29'])
    expect(
      await screen.findByText('Add at least two dates from Dashboard.'),
    ).toBeInTheDocument()
  })
})
