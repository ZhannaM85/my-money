import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
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
  it('offers Show all currencies and selects it in Original mode', async () => {
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native',
    })
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    const select = await screen.findByLabelText('Base currency')
    await waitFor(() => {
      expect(select).toHaveValue('all')
    })
    expect(select).not.toBeDisabled()
    expect(
      screen.getByRole('option', { name: 'Show all currencies' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Totals stay in each asset’s own currency. Pick a single currency to convert everything into one total.',
      ),
    ).toBeInTheDocument()
  })

  it('switches to Original when Show all currencies is chosen', async () => {
    const user = userEvent.setup()
    await db.settings.put(DEFAULT_SETTINGS)
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    const select = await screen.findByLabelText('Base currency')
    await waitFor(() => {
      expect(select).not.toBeDisabled()
    })
    await user.selectOptions(select, 'all')
    await waitFor(() => {
      expect(select).toHaveValue('all')
    })
    expect(useSettingsStore.getState().settings.currencyDisplayMode).toBe(
      'native',
    )
    expect(useSettingsStore.getState().settings.baseCurrency).toBe('EUR')
  })

  it('switches to Converted when a single currency is chosen from All', async () => {
    const user = userEvent.setup()
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      currencyDisplayMode: 'native',
    })
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    const select = await screen.findByLabelText('Base currency')
    await user.selectOptions(select, 'RUB')
    await waitFor(() => {
      expect(select).toHaveValue('RUB')
    })
    expect(useSettingsStore.getState().settings.currencyDisplayMode).toBe(
      'base',
    )
    expect(useSettingsStore.getState().settings.baseCurrency).toBe('RUB')
  })

  it('keeps base currency enabled in Converted mode', async () => {
    await db.settings.put(DEFAULT_SETTINGS)
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Base currency')).not.toBeDisabled()
    })
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
    await user.click(screen.getByRole('button', { name: 'Fresh' }))
    expect(document.documentElement.dataset.mood).toBe('fresh')
  })

  it('links to the privacy policy page (#164)', async () => {
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    const link = await screen.findByRole('link', { name: 'Privacy policy' })
    expect(link).toHaveAttribute('href', '/privacy')
  })

  it('keeps the home-screen widget off until the user turns it on (#190)', async () => {
    const user = userEvent.setup()
    await db.settings.put(DEFAULT_SETTINGS)
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    const toggle = await screen.findByRole('button', { name: 'Widget off' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await user.click(toggle)
    expect(
      await screen.findByRole('button', { name: 'Widget on' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(useSettingsStore.getState().settings.homeScreenWidget).toBe(true)
  })
})
