import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { applyTheme, useThemeStore } from '@/stores/themeStore'
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
  useThemeStore.setState({ mood: 'ledger' })
  applyTheme('ledger')
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
    expect(
      await screen.findByText(
        'Base currency is inactive in Original mode. Switch to Converted to use it.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Base currency')).toBeDisabled()
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

  it('applies Soft Finance, Neutral, and Pastel appearance moods', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: 'Soft Finance' }))
    expect(document.documentElement.dataset.mood).toBe('soft')
    await user.click(screen.getByRole('button', { name: 'Neutral' }))
    expect(document.documentElement.dataset.mood).toBe('neutral')
    await user.click(screen.getByRole('button', { name: 'Pastel' }))
    expect(document.documentElement.dataset.mood).toBe('pastel')
  })
})
