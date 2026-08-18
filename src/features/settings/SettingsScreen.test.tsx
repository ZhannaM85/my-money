import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { SettingsScreen } from './SettingsScreen'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: true })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: false,
  })
})

describe('SettingsScreen', () => {
  it('disables base currency while Original mode is selected', async () => {
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native',
    })
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByLabelText('Base currency')).toBeDisabled()
    expect(
      screen.getByText(
        'Base currency is inactive in Original mode. Switch to Converted to use it.',
      ),
    ).toBeInTheDocument()
  })

  it('keeps base currency enabled in Converted mode', async () => {
    await db.settings.put(DEFAULT_SETTINGS)
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    expect(await screen.findByLabelText('Base currency')).not.toBeDisabled()
  })
})
