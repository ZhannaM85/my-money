import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderApp, resetAppStores } from './renderApp'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'

describe('renderApp', () => {
  it('resets IndexedDB tables and store defaults', async () => {
    await db.settings.put({ ...DEFAULT_SETTINGS, locale: 'ru' })
    useAssetStore.setState({
      assets: [
        {
          id: 'a1',
          name: 'Revolut',
          assetClass: 'money',
          type: 'bank',
          currency: 'EUR',
          trackingStatus: 'included',
          valuationMethod: 'account_balance',
          updateFrequency: 'weekly',
          createdAt: '2026-08-17T00:00:00.000Z',
          updatedAt: '2026-08-17T00:00:00.000Z',
        },
      ],
      snapshots: [],
      loaded: true,
    })
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
      loaded: true,
    })

    await resetAppStores()

    expect(await db.settings.count()).toBe(0)
    expect(await db.assets.count()).toBe(0)
    expect(useAssetStore.getState()).toMatchObject({
      assets: [],
      snapshots: [],
      loaded: false,
    })
    expect(useSettingsStore.getState()).toMatchObject({
      settings: DEFAULT_SETTINGS,
      loaded: false,
    })
  })

  it('renders inside a MemoryRouter', () => {
    renderApp(<h1>Dashboard</h1>)
    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument()
  })
})
