import { useEffect, useState } from 'react'
import { opensKeyboard } from './useIsTextInputFocused'

const STUCK_SHRINK_CLEAR_MS = 700

/**
 * Whether the visual viewport is shorter than the layout viewport (#25) —
 * keyboard open or still animating. Complements `useIsTextInputFocused`
 * because iOS keyboard resize can lag DOM focus.
 *
 * If the viewport stays shrunk with nothing keyboard-focused, clear after
 * `STUCK_SHRINK_CLEAR_MS` so the tab bar cannot stick hidden.
 */
export function useVisualViewportShrunk(): boolean {
  const [isShrunk, setIsShrunk] = useState(false)

  useEffect(() => {
    const maybeViewport = window.visualViewport
    if (!maybeViewport) return
    const visualViewport: VisualViewport = maybeViewport

    let stuckClear: ReturnType<typeof setTimeout> | undefined

    function update() {
      const shrunk = window.innerHeight - visualViewport.height > 1
      clearTimeout(stuckClear)
      if (!shrunk) {
        setIsShrunk(false)
        return
      }
      setIsShrunk(true)
      if (!opensKeyboard(document.activeElement)) {
        stuckClear = setTimeout(() => {
          if (
            window.innerHeight - visualViewport.height > 1 &&
            !opensKeyboard(document.activeElement)
          ) {
            setIsShrunk(false)
          }
        }, STUCK_SHRINK_CLEAR_MS)
      }
    }

    update()
    visualViewport.addEventListener('resize', update)
    visualViewport.addEventListener('scroll', update)
    document.addEventListener('focusin', update)
    document.addEventListener('focusout', update)
    window.addEventListener('pageshow', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearTimeout(stuckClear)
      visualViewport.removeEventListener('resize', update)
      visualViewport.removeEventListener('scroll', update)
      document.removeEventListener('focusin', update)
      document.removeEventListener('focusout', update)
      window.removeEventListener('pageshow', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return isShrunk
}
