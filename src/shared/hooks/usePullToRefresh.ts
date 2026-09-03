import { useEffect, useRef, useState } from 'react'
import { isAtRefreshableTop } from '@/shared/lib/isAtRefreshableTop'
import { reloadForUpdate } from '@/shared/lib/reloadForUpdate'

const PULL_THRESHOLD = 70
const MAX_PULL = 100

/**
 * Drag-down-to-refresh gesture (#39). Only activates when every vertical
 * scroller under the touch is at the top — not merely `#main-content`, which
 * stays at 0 while Update’s inner holdings list scrolls (#203).
 * Triggers `reloadForUpdate()` so the reload picks up a new SW.
 */
export function usePullToRefresh(): {
  pullDistance: number
  isRefreshing: boolean
} {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pulling = useRef(false)
  const currentPull = useRef(0)

  useEffect(() => {
    function onTouchStart(event: TouchEvent) {
      if (!isAtRefreshableTop(event.target)) return
      startY.current = event.touches[0].clientY
      pulling.current = true
    }

    function onTouchMove(event: TouchEvent) {
      if (!pulling.current || startY.current === null) return
      const delta = event.touches[0].clientY - startY.current
      if (delta <= 0 || !isAtRefreshableTop(event.target)) {
        pulling.current = false
        currentPull.current = 0
        setPullDistance(0)
        return
      }
      event.preventDefault()
      const clamped = Math.min(delta, MAX_PULL)
      currentPull.current = clamped
      setPullDistance(clamped)
    }

    function onTouchEnd() {
      if (!pulling.current) return
      pulling.current = false
      startY.current = null
      if (currentPull.current >= PULL_THRESHOLD) {
        setIsRefreshing(true)
        void reloadForUpdate()
      } else {
        currentPull.current = 0
        setPullDistance(0)
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    document.addEventListener('touchcancel', onTouchEnd)
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  return { pullDistance, isRefreshing }
}
