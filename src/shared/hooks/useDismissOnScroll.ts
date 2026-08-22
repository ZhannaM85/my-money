import { useCallback, useEffect, useState } from 'react'

/**
 * Hides a Recharts tooltip after the page (or any nested scroller) moves.
 * Recharts keeps `active` after a tap on iOS; scroll does not clear it.
 */
export function useDismissOnScroll() {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const dismiss = () => setDismissed(true)
    const options: AddEventListenerOptions = { capture: true, passive: true }
    window.addEventListener('scroll', dismiss, options)
    return () => {
      window.removeEventListener('scroll', dismiss, options)
    }
  }, [])

  const allowTooltip = useCallback(() => setDismissed(false), [])

  return {
    tooltipActive: dismissed ? false : undefined,
    allowTooltip,
  }
}
