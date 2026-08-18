import { useEffect, useState } from 'react'
import { isNativePlatform } from '@/shared/lib/registerServiceWorker'
import { useOnlineStatus } from './useOnlineStatus'

const PROBE_INTERVAL_MS = 30 * 1000

function probeUrl(): string {
  return `${import.meta.env.BASE_URL}version.json?probe=${Date.now()}`
}

/**
 * Whether `OfflineBanner` should show. Starts from turtle's `useOnlineStatus`
 * (#163), plus a `version.json` probe (#38) because iOS Safari can keep
 * `navigator.onLine === true` in airplane mode.
 */
export function useOfflineBannerVisible(): boolean {
  const isOnline = useOnlineStatus()
  const [probeOffline, setProbeOffline] = useState(false)

  useEffect(() => {
    if (isNativePlatform()) return
    let cancelled = false

    async function probe() {
      if (typeof document !== 'undefined' && document.hidden) return
      if (!navigator.onLine) {
        if (!cancelled) setProbeOffline(false)
        return
      }
      try {
        const response = await fetch(probeUrl(), { cache: 'no-store' })
        if (!cancelled) setProbeOffline(!response.ok)
      } catch {
        if (!cancelled) setProbeOffline(true)
      }
    }

    function onVisibilityChange() {
      if (!document.hidden) void probe()
    }

    void probe()
    const interval = setInterval(probe, PROBE_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isOnline])

  if (isNativePlatform()) return false
  return !isOnline || probeOffline
}
