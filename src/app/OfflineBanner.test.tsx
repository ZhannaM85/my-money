import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OfflineBanner } from './OfflineBanner'

const originalCapacitor = Reflect.get(window, 'Capacitor')

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  setOnline(true)
  if (originalCapacitor === undefined) {
    Reflect.deleteProperty(window, 'Capacitor')
  } else {
    Reflect.set(window, 'Capacitor', originalCapacitor)
  }
})

describe('OfflineBanner (#163)', () => {
  it('renders nothing while online', async () => {
    setOnline(true)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    const { container } = render(<OfflineBanner />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the offline text when navigator.onLine is false on mount', () => {
    setOnline(false)
    render(<OfflineBanner />)

    expect(
      screen.getByText("You're offline — your data is still saved on this device."),
    ).toBeInTheDocument()
  })

  it('reacts to the offline and online window events', () => {
    setOnline(true)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    render(<OfflineBanner />)

    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument()

    setOnline(false)
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText(/You're offline/)).toBeInTheDocument()

    setOnline(true)
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument()
  })

  it('renders nothing inside the native shell', () => {
    setOnline(false)
    Reflect.set(window, 'Capacitor', { isNativePlatform: () => true })
    const { container } = render(<OfflineBanner />)
    expect(container).toBeEmptyDOMElement()
  })
})
