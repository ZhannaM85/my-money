import { useCallback, useEffect, useRef, useState } from 'react'

/** Inner holdings list — scroll here must not dismiss the tooltip (#128). */
export const CHART_TOOLTIP_SCROLL_CLASS = 'chart-tooltip-scroll'

function isInsideTooltip(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest(`.${CHART_TOOLTIP_SCROLL_CLASS}`))
  )
}

function tooltipScroller(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null
  return target.closest(`.${CHART_TOOLTIP_SCROLL_CLASS}`)
}

/**
 * Hides a Recharts tooltip after the page (or any nested scroller) moves.
 * Recharts keeps `active` after a tap on iOS; scroll does not clear it.
 *
 * A finger on the holdings list must not close it (#128): iOS often scrolls
 * the page instead of the overflow layer (Recharts `transform`), so we
 * pin `active`, ignore page scroll for that gesture, and pan `scrollTop`
 * ourselves.
 */
export function useDismissOnScroll() {
  const [dismissed, setDismissed] = useState(false)
  const [pinned, setPinned] = useState(false)
  const tooltipGesture = useRef(false)
  const scroller = useRef<HTMLElement | null>(null)
  const lastY = useRef(0)

  useEffect(() => {
    const dismissIfPageScroll = (event: Event) => {
      if (tooltipGesture.current || isInsideTooltip(event.target)) return
      setDismissed(true)
      setPinned(false)
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length >= 2) {
        tooltipGesture.current = false
        scroller.current = null
        return
      }
      scroller.current = tooltipScroller(event.target)
      tooltipGesture.current = scroller.current !== null
      if (tooltipGesture.current) {
        lastY.current = event.touches[0]?.clientY ?? 0
      }
    }

    const onTouchMove = (event: TouchEvent) => {
      if (!tooltipGesture.current || event.touches.length >= 2) return
      event.preventDefault()
      const node = scroller.current
      const y = event.touches[0]?.clientY
      if (node !== null && y !== undefined) {
        node.scrollTop += lastY.current - y
        lastY.current = y
      }
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        tooltipGesture.current = false
        scroller.current = null
      }
    }

    const scrollOptions: AddEventListenerOptions = { capture: true, passive: true }
    const startOptions: AddEventListenerOptions = { capture: true, passive: true }
    const moveOptions: AddEventListenerOptions = { capture: true, passive: false }

    window.addEventListener('scroll', dismissIfPageScroll, scrollOptions)
    document.addEventListener('scroll', dismissIfPageScroll, scrollOptions)
    document.addEventListener('touchstart', onTouchStart, startOptions)
    document.addEventListener('touchmove', onTouchMove, moveOptions)
    document.addEventListener('touchend', onTouchEnd, startOptions)
    document.addEventListener('touchcancel', onTouchEnd, startOptions)
    return () => {
      window.removeEventListener('scroll', dismissIfPageScroll, scrollOptions)
      document.removeEventListener('scroll', dismissIfPageScroll, scrollOptions)
      document.removeEventListener('touchstart', onTouchStart, startOptions)
      document.removeEventListener('touchmove', onTouchMove, moveOptions)
      document.removeEventListener('touchend', onTouchEnd, startOptions)
      document.removeEventListener('touchcancel', onTouchEnd, startOptions)
    }
  }, [])

  const allowTooltip = useCallback(() => setDismissed(false), [])
  const pinTooltip = useCallback(() => {
    setDismissed(false)
    setPinned(true)
  }, [])
  const dismissTooltip = useCallback(() => {
    setDismissed(true)
    setPinned(false)
    tooltipGesture.current = false
    scroller.current = null
  }, [])

  return {
    tooltipActive: dismissed ? false : pinned ? true : undefined,
    allowTooltip,
    pinTooltip,
    dismissTooltip,
  }
}
