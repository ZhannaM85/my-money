import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { useSettingsStore } from '@/stores/settingsStore'
import { WelcomeScreen } from './WelcomeScreen'

afterEach(() => {
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS })
})

function renderWelcomeScreen() {
  render(
    <MemoryRouter>
      <WelcomeScreen />
    </MemoryRouter>,
  )
}

describe('WelcomeScreen (#332)', () => {
  it('describes the app and links privacy, support, and the diary', () => {
    renderWelcomeScreen()

    expect(
      screen.getByRole('heading', { name: 'My Money' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/local-first personal net-worth/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open the app' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(
      screen.getByRole('link', { name: 'Privacy policy' }),
    ).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'App support' })).toHaveAttribute(
      'href',
      '/support',
    )
  })

  it('credits the author as Zhanna M. with a GitHub profile link', () => {
    renderWelcomeScreen()

    expect(screen.getByText('Made by Zhanna M.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'GitHub profile' }),
    ).toHaveAttribute('href', 'https://github.com/ZhannaM85')
  })

  it('renders in Russian when the locale is Russian', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
    })
    renderWelcomeScreen()

    expect(
      screen.getByRole('heading', { name: 'Мои деньги' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Автор: Жанна М\./)).toBeInTheDocument()
  })
})
