import { useEffect, useRef } from 'react'
import { pinchZoomDirection, touchDistance } from '@/shared/lib/pinchZoom'

export function usePinchZoom(
  onZoomIn: (() => void) | undefined,
  onZoomOut: (() => void) | undefined,
) {
  const ref = useRef<HTMLDivElement>(null)
  const startDistance = useRef<number | null>(null)
  const stepped = useRef(false)
  const onZoomInRef = useRef(onZoomIn)
  const onZoomOutRef = useRef(onZoomOut)

  useEffect(() => {
    onZoomInRef.current = onZoomIn
    onZoomOutRef.current = onZoomOut
  }, [onZoomIn, onZoomOut])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    function twoFingerDistance(touches: TouchList): number | null {
      if (touches.length < 2) return null
      return touchDistance(touches[0], touches[1])
    }

    function onStart(event: TouchEvent) {
      startDistance.current = twoFingerDistance(event.touches)
      stepped.current = false
    }

    function onMove(event: TouchEvent) {
      const start = startDistance.current
      const current = twoFingerDistance(event.touches)
      if (start === null || current === null) return
      event.preventDefault()
      if (stepped.current) return
      const direction = pinchZoomDirection(start, current)
      if (direction === 'in') {
        stepped.current = true
        onZoomInRef.current?.()
      } else if (direction === 'out') {
        stepped.current = true
        onZoomOutRef.current?.()
      }
    }

    function onEnd(event: TouchEvent) {
      if (event.touches.length < 2) {
        startDistance.current = null
        stepped.current = false
      }
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
