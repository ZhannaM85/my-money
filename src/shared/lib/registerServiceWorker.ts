function nativeCapacitor(): { isNativePlatform?: () => boolean } | undefined {
  return Reflect.get(window, 'Capacitor') as
    | { isNativePlatform?: () => boolean }
    | undefined
}

/** Skip the web service worker inside a later Capacitor wrap (#19). */
export function isNativePlatform(): boolean {
  return nativeCapacitor()?.isNativePlatform?.() === true
}

/**
 * Manual registration so Capacitor can skip the worker. App-shell assets are
 * already bundled in the native app; a SW would only recache them in WebView.
 */
export function registerServiceWorker(): void {
  if (isNativePlatform()) return
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    })
  })
}
