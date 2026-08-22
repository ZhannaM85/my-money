import { useEffect, useState } from 'react'

/**
 * Pixel shift to keep `position: fixed; bottom: 0` glued to the visual
 * viewport on iOS Safari (#25), where fixed is relative to the layout viewport.
 *
 * After resume from background (#91), Safari often keeps a stale
 * visualViewport until a later frame — re-read on foreground.
 */
export function useVisualViewportBottomShift(): number {
  const [shift, setShift] = useState(0)

  useEffect(() => {
    const maybeViewport = window.visualViewport
    if (!maybeViewport) return
    const viewport: VisualViewport = maybeViewport
    let frame = 0
    const timeouts: number[] = []

    function update() {
      setShift((viewport.offsetTop || 0) + viewport.height - window.innerHeight)
    }

    function updateAfterForeground() {
      cancelAnimationFrame(frame)
      for (const id of timeouts) window.clearTimeout(id)
      timeouts.length = 0
      update()
      frame = requestAnimationFrame(() => {
        update()
        frame = requestAnimationFrame(update)
      })
      for (const delay of [50, 250]) {
        timeouts.push(window.setTimeout(update, delay))
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') updateAfterForeground()
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    window.addEventListener('pageshow', updateAfterForeground)
    window.addEventListener('focus', updateAfterForeground)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      cancelAnimationFrame(frame)
      for (const id of timeouts) window.clearTimeout(id)
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('pageshow', updateAfterForeground)
      window.removeEventListener('focus', updateAfterForeground)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return shift
}
