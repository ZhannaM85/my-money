import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  CHART_TOOLTIP_SCROLL_CLASS,
  useDismissOnScroll,
} from './useDismissOnScroll'

describe('useDismissOnScroll', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

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

    act(() => {
      result.current.dismissTooltip()
    })
    expect(result.current.tooltipActive).toBe(false)
  })

  it('does not dismiss when the holdings tooltip list scrolls (#128)', () => {
    const tooltip = document.createElement('div')
    tooltip.className = CHART_TOOLTIP_SCROLL_CLASS
    const row = document.createElement('p')
    tooltip.appendChild(row)
    document.body.appendChild(tooltip)

    const { result } = renderHook(() => useDismissOnScroll())
    act(() => {
      row.dispatchEvent(new Event('scroll', { bubbles: false }))
    })
    expect(result.current.tooltipActive).toBeUndefined()
  })

  it('still dismisses when a nested non-tooltip scroller moves (#128)', () => {
    const other = document.createElement('div')
    other.className = 'overflow-y-scroll'
    document.body.appendChild(other)

    const { result } = renderHook(() => useDismissOnScroll())
    act(() => {
      other.dispatchEvent(new Event('scroll', { bubbles: false }))
    })
    expect(result.current.tooltipActive).toBe(false)
  })
})
