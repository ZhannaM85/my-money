import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { OfflineBanner } from './OfflineBanner'

const originalCapacitor = Reflect.get(window, 'Capacitor')
const originalOnLine = Object.getOwnPropertyDescriptor(
  navigator,
  'onLine',
)

afterEach(() => {
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
  it('renders nothing when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    const { container } = render(<OfflineBanner />)
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

  it('reacts to offline and online window events', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    render(<OfflineBanner />)
    expect(screen.queryByText(/You're offline/)).not.toBeInTheDocument()

    await act(async () => {
      window.dispatchEvent(new Event('offline'))
    })
    await waitFor(() =>
      expect(screen.getByText(/You're offline/)).toBeInTheDocument(),
    )

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
