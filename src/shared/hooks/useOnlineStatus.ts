import { useEffect, useState } from 'react'

/**
 * Reads `navigator.onLine`, kept live via the `online`/`offline` window
 * events (#163) — the app is fully usable offline once the service worker
 * has cached the app shell (all data already lives in IndexedDB), but a
 * quiet indicator still helps explain why, say, the update-check banner
 * never appears while offline.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine,
  )

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
