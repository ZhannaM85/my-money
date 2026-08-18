import { useEffect, useState } from 'react'
import { isNativePlatform } from '@/shared/lib/registerServiceWorker'

const CHECK_INTERVAL_MS = 60 * 1000

function versionJsonUrl(): string {
  return `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`
}

async function nudgeServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    await registration?.update()
  } catch {
    // No registration yet, or jsdom without a full SW API.
  }
}

/**
 * Polls `version.json` (written by deploy with the commit SHA) and compares
 * it against `__APP_VERSION__` baked into this bundle. Fails silently on
 * fetch errors — local dev has no version file. Skips on native Capacitor.
 *
 * #37: cache-bust the fetch, poll every minute while visible, and always
 * ask the service worker to re-check `sw.js` (with `updateViaCache: 'none'`
 * on register) so GitHub Pages CDN caching cannot pin an old worker.
 */
export function useAppUpdateAvailable(): boolean {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (isNativePlatform()) return
    let cancelled = false

    async function check() {
      if (typeof document !== 'undefined' && document.hidden) return
      try {
        await nudgeServiceWorker()
        const response = await fetch(versionJsonUrl(), { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as { version?: string }
        if (!cancelled && data.version && data.version !== __APP_VERSION__) {
          setUpdateAvailable(true)
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
