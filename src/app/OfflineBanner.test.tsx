import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OfflineBanner } from './OfflineBanner'

const originalCapacitor = Reflect.get(window, 'Capacitor')
const originalOnLine = Object.getOwnPropertyDescriptor(
  navigator,
  'onLine',
)

afterEach(() => {
  vi.unstubAllGlobals()
  if (originalCapacitor === undefined) {
    Reflect.deleteProperty(window, 'Capacitor')
  } else {
    Reflect.set(window, 'Capacitor', originalCapacitor)
  }
  if (originalOnLine) {
    Object.defineProperty(navigator, 'onLine', originalOnLine)
  }
})

describe('OfflineBanner', () => {
  it('renders nothing when online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    const { container } = render(<OfflineBanner />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('shows offline text when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    render(<OfflineBanner />)
    expect(
      screen.getByText(
        "You're offline — your data is still saved on this device.",
      ),
    ).toBeInTheDocument()
  })

  it('shows offline when the network probe fails', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    )
    render(<OfflineBanner />)
    expect(
      await screen.findByText(/You're offline/),
    ).toBeInTheDocument()
  })

  it('reacts to offline and online window events', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(<OfflineBanner />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument()

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    await act(async () => {
      window.dispatchEvent(new Event('offline'))
    })
    await waitFor(() =>
      expect(screen.getByText(/You're offline/)).toBeInTheDocument(),
    )

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    await act(async () => {
      window.dispatchEvent(new Event('online'))
    })
    await waitFor(() =>
      expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument(),
    )
  })

  it('renders nothing inside the native shell', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    Reflect.set(window, 'Capacitor', { isNativePlatform: () => true })
    const { container } = render(<OfflineBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})
