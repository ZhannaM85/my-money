import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { isAndroidNativePlatform } from '@/shared/native/platform'
import { useAssetStore } from '@/stores/assetStore'
import { applyTheme, useThemeStore } from '@/stores/themeStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { SettingsScreen } from './SettingsScreen'

vi.mock('@/shared/native/platform', () => ({
  isAndroidNativePlatform: vi.fn(() => false),
}))

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
  vi.mocked(isAndroidNativePlatform).mockReturnValue(false)
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

    await user.click(
      await screen.findByRole('button', { name: 'Soft Finance' }),
    )
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

  it('hides the home-screen widget off Capacitor Android (#235)', async () => {
    await db.settings.put(DEFAULT_SETTINGS)
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Preferences' })
    expect(
      screen.queryByRole('button', { name: 'Widget off' }),
    ).not.toBeInTheDocument()
  })

  it('keeps the home-screen widget off until the user turns it on (#190)', async () => {
    const user = userEvent.setup()
    vi.mocked(isAndroidNativePlatform).mockReturnValue(true)
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

  it('groups More and keeps Developer collapsed (#235)', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Preferences' })
    expect(screen.getByRole('heading', { name: 'Data' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument()
    const developer = screen.getByRole('button', { name: 'Developer' })
    expect(developer).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('heading', { name: 'FX debug' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Root causes' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Backup' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'CSV' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Release notes' }),
    ).toBeInTheDocument()
    await user.click(developer)
    expect(developer).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('heading', { name: 'FX debug' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Root causes' }),
    ).toBeInTheDocument()
  })

  it('opens Developer for #fx-debug (#235)', async () => {
    render(
      <MemoryRouter initialEntries={['/settings#fx-debug']}>
        <SettingsScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('button', { name: 'Developer' }),
    ).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('heading', { name: 'FX debug' }),
    ).toBeInTheDocument()
  })

  it('opens Developer for #root-causes (#235)', async () => {
    render(
      <MemoryRouter initialEntries={['/settings#root-causes']}>
        <SettingsScreen />
      </MemoryRouter>,
    )
    expect(
      await screen.findByRole('heading', { name: 'Root causes' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Developer' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
