import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useOfflineBannerVisible } from './useOfflineBannerVisible'

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

describe('useOfflineBannerVisible', () => {
  it('returns true when navigator.onLine is false on mount', () => {
    setOnline(false)
    const { result } = renderHook(() => useOfflineBannerVisible())
    expect(result.current).toBe(true)
  })

  it('returns true when the network probe fails even if navigator.onLine is true', async () => {
    setOnline(true)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    )

    const { result } = renderHook(() => useOfflineBannerVisible())

    await waitFor(() => expect(result.current).toBe(true))
  })

  it('returns false inside the native shell', () => {
    setOnline(false)
    Reflect.set(window, 'Capacitor', { isNativePlatform: () => true })
    const { result } = renderHook(() => useOfflineBannerVisible())
    expect(result.current).toBe(false)
  })
})
