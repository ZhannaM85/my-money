import { useEffect, useState } from 'react'

/**
 * Pixel shift to keep `position: fixed; bottom: 0` glued to the visual
 * viewport on iOS Safari (#25), where fixed is relative to the layout viewport.
 */
export function useVisualViewportBottomShift(): number {
  const [shift, setShift] = useState(0)

  useEffect(() => {
    const maybeViewport = window.visualViewport
    if (!maybeViewport) return
    const viewport: VisualViewport = maybeViewport

    function update() {
      setShift((viewport.offsetTop || 0) + viewport.height - window.innerHeight)
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return shift
}
