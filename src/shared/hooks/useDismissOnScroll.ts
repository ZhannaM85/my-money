import { useCallback, useEffect, useState } from 'react'

/** Inner holdings list — scroll here must not dismiss the tooltip (#128). */
export const CHART_TOOLTIP_SCROLL_CLASS = 'chart-tooltip-scroll'

function isTooltipListScroll(event: Event): boolean {
  const target = event.target
  return target instanceof Element && Boolean(target.closest(`.${CHART_TOOLTIP_SCROLL_CLASS}`))
}

/**
 * Hides a Recharts tooltip after the page (or any nested scroller) moves.
 * Recharts keeps `active` after a tap on iOS; scroll does not clear it.
 * Scroll inside the holdings tooltip is ignored so the list can move (#128).
 */
export function useDismissOnScroll() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const dismiss = (event: Event) => {
      if (isTooltipListScroll(event)) return
      setDismissed(true)
    }
    const options: AddEventListenerOptions = { capture: true, passive: true }
    window.addEventListener('scroll', dismiss, options)
    document.addEventListener('scroll', dismiss, options)
    return () => {
      window.removeEventListener('scroll', dismiss, options)
      document.removeEventListener('scroll', dismiss, options)
    }
  }, [])

  const allowTooltip = useCallback(() => setDismissed(false), [])
  const dismissTooltip = useCallback(() => setDismissed(true), [])

  return {
    tooltipActive: dismissed ? false : undefined,
    allowTooltip,
    dismissTooltip,
  }
}
