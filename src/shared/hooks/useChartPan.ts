import { useEffect, useRef } from 'react'

const PAN_THRESHOLD_PX = 40

/**
 * One-finger horizontal drag: right → earlier, left → later (#111).
 * Ignores multi-touch (pinch) and mostly-vertical moves.
 */
export function useChartPan(
  onPanEarlier: (() => void) | undefined,
  onPanLater: (() => void) | undefined,
) {
  const ref = useRef<HTMLDivElement>(null)
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const stepped = useRef(false)
  const onEarlierRef = useRef(onPanEarlier)
  const onLaterRef = useRef(onPanLater)

  useEffect(() => {
    onEarlierRef.current = onPanEarlier
    onLaterRef.current = onPanLater
  }, [onPanEarlier, onPanLater])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    function onStart(event: TouchEvent) {
      if (event.touches.length !== 1) {
        startX.current = null
        startY.current = null
        return
      }
      startX.current = event.touches[0].clientX
      startY.current = event.touches[0].clientY
      stepped.current = false
    }

    function onMove(event: TouchEvent) {
      if (event.touches.length !== 1) return
      const x0 = startX.current
      const y0 = startY.current
      if (x0 === null || y0 === null) return
      const dx = event.touches[0].clientX - x0
      const dy = event.touches[0].clientY - y0
      if (Math.abs(dy) > Math.abs(dx)) return
      if (Math.abs(dx) < PAN_THRESHOLD_PX) return
      event.preventDefault()
      if (stepped.current) return
      stepped.current = true
      if (dx > 0) onEarlierRef.current?.()
      else onLaterRef.current?.()
    }

    function onEnd() {
      startX.current = null
      startY.current = null
      stepped.current = false
    }

    element.addEventListener('touchstart', onStart, { passive: true })
    element.addEventListener('touchmove', onMove, { passive: false })
    element.addEventListener('touchend', onEnd)
    element.addEventListener('touchcancel', onEnd)
    return () => {
      element.removeEventListener('touchstart', onStart)
      element.removeEventListener('touchmove', onMove)
      element.removeEventListener('touchend', onEnd)
      element.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  return ref
}
