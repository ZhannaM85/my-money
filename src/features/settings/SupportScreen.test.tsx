import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { useSettingsStore } from '@/stores/settingsStore'
import { SUPPORT_EMAIL, SupportScreen } from './SupportScreen'

afterEach(() => {
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS })
})

function renderSupportScreen() {
  render(
    <MemoryRouter>
      <SupportScreen />
    </MemoryRouter>,
  )
}

describe('SupportScreen (#331)', () => {
  it('shows the public support email and FAQ', () => {
    renderSupportScreen()

    expect(screen.getByRole('heading', { name: 'Support' })).toBeInTheDocument()
    expect(screen.getByText('Common questions')).toBeInTheDocument()
    expect(screen.getByText(/no account and no developer cloud/)).toBeInTheDocument()

    const mail = screen.getByRole('link', {
      name: `Email support: ${SUPPORT_EMAIL}`,
    })
    expect(mail).toHaveAttribute('href', `mailto:${SUPPORT_EMAIL}`)
  })

  it('links to privacy and More', () => {
    renderSupportScreen()

    expect(
      screen.getByRole('link', { name: 'Read the privacy policy' }),
    ).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Back to More' })).toHaveAttribute(
      'href',
      '/settings',
    )
  })

  it('renders in Russian when the locale is Russian', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
    })
    renderSupportScreen()

    expect(
      screen.getByRole('heading', { name: 'Поддержка' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Частые вопросы/)).toBeInTheDocument()
  })
})
