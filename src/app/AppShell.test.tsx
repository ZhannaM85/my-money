import 'fake-indexeddb/auto'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  saveManualRates: useFxStore.getState().saveManualRates,
  clearManualRatesForDate: useFxStore.getState().clearManualRatesForDate,
}

beforeEach(async () => {
  await db.settings.clear()
  await db.assets.clear()
  await db.snapshots.clear()
  await db.fxRates.clear()
  await db.manualFxRates.clear()
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
    manualQuotes: [],
    loading: false,
    error: undefined,
    loadCached: fxApi.loadCached,
    ensureRates: fxApi.ensureRates,
    ensureRange: fxApi.ensureRange,
    saveManualRates: fxApi.saveManualRates,
    clearManualRatesForDate: fxApi.clearManualRatesForDate,
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
    expect(
      screen.getByRole('link', { name: 'Skip to content' }),
    ).toHaveAttribute('href', '#main-content')
  })

  it('reserves extra bottom space above the sticky tab bar', async () => {
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    )

    const main = await screen.findByRole('main')
    expect(main.className).toContain('pb-[calc(env(safe-area-inset-bottom)+9rem)]')
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

function renderShellWithInput(onConfirm?: () => void) {
  const router = createMemoryRouter(
    [
      {
        element: <AppShell />,
        children: [
          {
            path: '/',
            element: (
              <div>
                <label htmlFor="text-field">Amount</label>
                <input id="text-field" type="text" />
                <label htmlFor="checkbox-field">Include</label>
                <input id="checkbox-field" type="checkbox" />
                <button type="button" onClick={onConfirm}>
                  Confirm
                </button>
              </div>
            ),
          },
        ],
      },
    ],
    { initialEntries: ['/'] },
  )
  render(<RouterProvider router={router} />)
}

describe('AppShell bottom tab bar visibility (#25)', () => {
  it('hides the bottom tab bar while a text input is focused', async () => {
    const user = userEvent.setup()
    renderShellWithInput()
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()

    await user.click(screen.getByLabelText('Amount'))

    expect(
      screen.queryByRole('navigation', { name: 'Tabs' }),
    ).not.toBeInTheDocument()
  })

  it('shows the bottom tab bar again once the text input blurs', async () => {
    const user = userEvent.setup()
    renderShellWithInput()
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()

    await user.click(screen.getByLabelText('Amount'))
    expect(
      screen.queryByRole('navigation', { name: 'Tabs' }),
    ).not.toBeInTheDocument()

    await user.click(document.body)

    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()
  })

  it('registers a click on a button right after a text input blurs', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderShellWithInput(onConfirm)
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()

    await user.click(screen.getByLabelText('Amount'))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()
  })

  it('does not hide the bottom tab bar for non-text controls like checkboxes', async () => {
    const user = userEvent.setup()
    renderShellWithInput()
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()

    await user.click(screen.getByLabelText('Include'))

    expect(screen.getByRole('navigation', { name: 'Tabs' })).toBeInTheDocument()
  })
})

function mockVisualViewport(initialHeight: number) {
  const listeners: Partial<Record<string, () => void>> = {}
  const viewport = {
    height: initialHeight,
    addEventListener: (event: string, fn: () => void) => {
      listeners[event] = fn
    },
    removeEventListener: vi.fn(),
  }
  Object.defineProperty(window, 'visualViewport', {
    value: viewport,
    configurable: true,
  })
  return {
    resizeTo(height: number) {
      act(() => {
        viewport.height = height
        listeners.resize?.()
      })
    },
  }
}

describe('AppShell bottom tab bar visibility, viewport-shrink signal (#25)', () => {
  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(window, 'visualViewport', {
      value: undefined,
      configurable: true,
    })
  })

  it('hides the bottom tab bar once the visual viewport shrinks, with no input focused', async () => {
    const viewport = mockVisualViewport(window.innerHeight)
    renderShellWithInput()
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()

    viewport.resizeTo(window.innerHeight - 300)

    expect(
      screen.queryByRole('navigation', { name: 'Tabs' }),
    ).not.toBeInTheDocument()
  })

  it('shows the bottom tab bar again once the viewport resizes back to full height', async () => {
    const viewport = mockVisualViewport(window.innerHeight)
    renderShellWithInput()
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()

    viewport.resizeTo(window.innerHeight - 300)
    expect(
      screen.queryByRole('navigation', { name: 'Tabs' }),
    ).not.toBeInTheDocument()

    viewport.resizeTo(window.innerHeight)

    expect(screen.getByRole('navigation', { name: 'Tabs' })).toBeInTheDocument()
  })

  it('clears a stuck shrunk viewport when nothing is keyboard-focused', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const viewport = mockVisualViewport(window.innerHeight)
    renderShellWithInput()
    expect(
      await screen.findByRole('navigation', { name: 'Tabs' }),
    ).toBeInTheDocument()

    viewport.resizeTo(window.innerHeight - 300)
    expect(
      screen.queryByRole('navigation', { name: 'Tabs' }),
    ).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(700)
    })

    expect(screen.getByRole('navigation', { name: 'Tabs' })).toBeInTheDocument()
    vi.useRealTimers()
  })
})
