import { useEffect, useState } from 'react'

/**
 * Visible viewport height, including iOS keyboard shrink (#260).
 * Undefined when `visualViewport` is missing so callers can keep `100dvh`.
 */
export function useVisualViewportHeight(): number | undefined {
  const [height, setHeight] = useState<number | undefined>(() =>
    typeof window === 'undefined' ? undefined : window.visualViewport?.height,
  )

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const visible = viewport
    function sync() {
      setHeight(visible.height)
    }
    sync()
    visible.addEventListener('resize', sync)
    visible.addEventListener('scroll', sync)
    return () => {
      visible.removeEventListener('resize', sync)
      visible.removeEventListener('scroll', sync)
    }
  }, [])

  return height
}
