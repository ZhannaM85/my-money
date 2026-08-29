import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  CHART_TOOLTIP_SCROLL_CLASS,
  useDismissOnScroll,
} from './useDismissOnScroll'

function fireTouch(
  type: string,
  target: EventTarget,
  clientY: number,
  extra: { touchCount?: number; bubbles?: boolean } = {},
) {
  const touchCount = extra.touchCount ?? 1
  const touches =
    type === 'touchend' || type === 'touchcancel'
      ? []
      : Array.from({ length: touchCount }, (_, identifier) => ({
          identifier,
          clientX: 0,
          clientY,
          target,
        }))
  const event = new Event(type, {
    bubbles: extra.bubbles ?? true,
    cancelable: true,
  })
  Object.defineProperty(event, 'touches', { value: touches })
  target.dispatchEvent(event)
  return event
}

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

  it('pins the tooltip open until page scroll (#128)', () => {
    const { result } = renderHook(() => useDismissOnScroll())
    act(() => {
      result.current.pinTooltip()
    })
    expect(result.current.tooltipActive).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('scroll'))
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
      result.current.pinTooltip()
    })
    act(() => {
      row.dispatchEvent(new Event('scroll', { bubbles: false }))
    })
    expect(result.current.tooltipActive).toBe(true)
  })

  it('does not dismiss when a tooltip finger gesture scrolls the page (#128)', () => {
    const tooltip = document.createElement('div')
    tooltip.className = CHART_TOOLTIP_SCROLL_CLASS
    document.body.appendChild(tooltip)

    const { result } = renderHook(() => useDismissOnScroll())
    act(() => {
      result.current.pinTooltip()
    })
    act(() => {
      fireTouch('touchstart', tooltip, 120)
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current.tooltipActive).toBe(true)
  })

  it('prevents default page pan and moves tooltip scrollTop (#128)', () => {
    const tooltip = document.createElement('div')
    tooltip.className = CHART_TOOLTIP_SCROLL_CLASS
    tooltip.scrollTop = 0
    document.body.appendChild(tooltip)

    renderHook(() => useDismissOnScroll())
    act(() => {
      fireTouch('touchstart', tooltip, 120)
    })
    const move = fireTouch('touchmove', tooltip, 80)
    expect(move.defaultPrevented).toBe(true)
    expect(tooltip.scrollTop).toBe(40)
  })

  it('still dismisses when a nested non-tooltip scroller moves (#128)', () => {
    const other = document.createElement('div')
    other.className = 'overflow-y-scroll'
    document.body.appendChild(other)

    const { result } = renderHook(() => useDismissOnScroll())
    act(() => {
      result.current.pinTooltip()
    })
    act(() => {
      other.dispatchEvent(new Event('scroll', { bubbles: false }))
    })
    expect(result.current.tooltipActive).toBe(false)
  })
})
