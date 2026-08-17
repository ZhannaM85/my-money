import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AppShell } from './AppShell'

const fxApi = {
  loadCached: useFxStore.getState().loadCached,
  ensureRates: useFxStore.getState().ensureRates,
  ensureRange: useFxStore.getState().ensureRange,
}

beforeEach(async () => {
  await db.settings.clear()
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.put({
    ...DEFAULT_SETTINGS,
    onboardingCompleted: true,
    updatedAt: '2026-08-17T00:00:00.000Z',
  })
  useSettingsStore.setState({
    settings: { ...DEFAULT_SETTINGS, onboardingCompleted: true },
    loaded: false,
  })
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useFxStore.setState({
    quotes: [],
    loading: false,
    error: undefined,
    loadCached: fxApi.loadCached,
    ensureRates: fxApi.ensureRates,
    ensureRange: fxApi.ensureRange,
  })
})

describe('AppShell', () => {
  it('renders the product name and tab navigation', async () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    )
    expect(screen.getByText('My Money')).toBeInTheDocument()
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Update' })).toBeInTheDocument()
  })

  it('keeps the shell usable and shows cached FX copy when rates cannot refresh', async () => {
    const noop = async () => {}
    useFxStore.setState({
      loadCached: noop,
      ensureRates: noop,
      error: 'cached_rates',
    })
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    )
    expect(
      await screen.findByText(/Using last cached rates/),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Tabs' })).toBeInTheDocument()
  })
})
