import { useEffect, useState } from 'react'
import { isNativePlatform } from '@/shared/lib/registerServiceWorker'

const CHECK_INTERVAL_MS = 5 * 60 * 1000

/**
 * Polls `version.json` (written by deploy with the commit SHA) and compares
 * it against `__APP_VERSION__` baked into this bundle. Fails silently on
 * fetch errors — local dev has no version file. Skips on native Capacitor.
 */
export function useAppUpdateAvailable(): boolean {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (isNativePlatform()) return
    let cancelled = false

    async function check() {
      if (typeof document !== 'undefined' && document.hidden) return
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}version.json`,
          { cache: 'no-store' },
        )
        if (!response.ok) return
        const data = (await response.json()) as { version?: string }
        if (!cancelled && data.version && data.version !== __APP_VERSION__) {
          setUpdateAvailable(true)
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration()
            await registration?.update()
          }
        }
      } catch {
        // Offline or no version.json — no prompt this cycle.
      }
    }

    function onVisibilityChange() {
      if (!document.hidden) void check()
    }

    void check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return updateAvailable
}
