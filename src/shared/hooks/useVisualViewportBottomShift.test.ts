import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useVisualViewportBottomShift } from './useVisualViewportBottomShift'

afterEach(() => {
  Object.defineProperty(window, 'visualViewport', {
    value: undefined,
    configurable: true,
  })
})

describe('useVisualViewportBottomShift', () => {
  it('shifts a bottom-fixed bar up when the visual viewport is shorter', () => {
    const listeners: Partial<Record<string, () => void>> = {}
    const viewport = {
      offsetTop: 0,
      height: window.innerHeight - 80,
      addEventListener: (event: string, fn: () => void) => {
        listeners[event] = fn
      },
      removeEventListener: vi.fn(),
    }
    Object.defineProperty(window, 'visualViewport', {
      value: viewport,
      configurable: true,
    })

    const { result } = renderHook(() => useVisualViewportBottomShift())
    expect(result.current).toBe(-80)

    act(() => {
      viewport.offsetTop = 40
      viewport.height = window.innerHeight - 40
      listeners.scroll?.()
    })
    expect(result.current).toBe(0)
  })
})
