import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useOnlineStatus } from './useOnlineStatus'

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    value,
  })
}

afterEach(() => {
  setOnline(true)
})

describe('useOnlineStatus', () => {
  it('returns false when navigator.onLine is false on mount', () => {
    setOnline(false)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
  })

  it('reacts to the offline and online window events', () => {
    setOnline(true)
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    setOnline(false)
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)

    setOnline(true)
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(true)
  })
})
