import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useOnlineStatus } from './useOnlineStatus'

afterEach(() => {
  vi.unstubAllGlobals()
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value: true,
  })
})

describe('useOnlineStatus', () => {
  it('returns offline when navigator.onLine is false on mount', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
  })

  it('returns offline when a network probe fails even if navigator.onLine is true', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    )

    const { result } = renderHook(() => useOnlineStatus())

    await waitFor(() => expect(result.current).toBe(false))
  })

  it('reacts to the offline window event', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))
    const { result } = renderHook(() => useOnlineStatus())
    await waitFor(() => expect(result.current).toBe(true))

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)
  })
})
