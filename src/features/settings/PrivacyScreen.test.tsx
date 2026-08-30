import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { useSettingsStore } from '@/stores/settingsStore'
import { PrivacyScreen } from './PrivacyScreen'

afterEach(() => {
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS })
})

function renderPrivacyScreen() {
  render(
    <MemoryRouter>
      <PrivacyScreen />
    </MemoryRouter>,
  )
}

describe('PrivacyScreen (#164)', () => {
  it('explains what is collected, where it lives, FX network, and that data is not shared', () => {
    renderPrivacyScreen()

    expect(
      screen.getByRole('heading', { name: 'Privacy Policy' }),
    ).toBeInTheDocument()
    expect(screen.getByText('What we collect')).toBeInTheDocument()
    expect(
      screen.getByText(/does not collect any data automatically/),
    ).toBeInTheDocument()
    expect(screen.getByText('Where your data lives')).toBeInTheDocument()
    expect(screen.getByText(/no account, no server/)).toBeInTheDocument()
    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(
      screen.getByText(/public foreign-exchange reference rates/),
    ).toBeInTheDocument()
    expect(screen.getByText('Sharing with third parties')).toBeInTheDocument()
    expect(screen.getByText(/never sold, shared/)).toBeInTheDocument()
  })

  it('links back to More', () => {
    renderPrivacyScreen()

    const link = screen.getByRole('link', { name: 'Back to More' })
    expect(link).toHaveAttribute('href', '/settings')
  })

  it('renders in Russian when the locale is Russian', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
    })
    renderPrivacyScreen()

    expect(
      screen.getByRole('heading', { name: 'Политика конфиденциальности' }),
    ).toBeInTheDocument()
  })
})
