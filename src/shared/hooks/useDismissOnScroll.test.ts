import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDismissOnScroll } from './useDismissOnScroll'

describe('useDismissOnScroll', () => {
  it('leaves tooltip control to the chart until the page scrolls', () => {
    const { result } = renderHook(() => useDismissOnScroll())
    expect(result.current.tooltipActive).toBeUndefined()

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.tooltipActive).toBe(false)

    act(() => {
      result.current.allowTooltip()
    })
    expect(result.current.tooltipActive).toBeUndefined()
  })
})
