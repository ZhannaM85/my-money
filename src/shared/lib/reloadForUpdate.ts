const SW_UPDATE_TIMEOUT_MS = 3000
const CONTROLLER_CHANGE_TIMEOUT_MS = 5000

function raceTimeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Reload to pick up a newer deploy. `force` clears SW caches when an update is confirmed. */
export async function reloadForUpdate(
  options: { force?: boolean } = {},
): Promise<void> {
  try {
    if (options.force) {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((r) => r.unregister()))
      }
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      }
    } else if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        // #220: registration.update() can hang for a minute on a slow phone
        // network — cap the wait so pull-to-refresh always reloads.
        await Promise.race([
          registration.update().then(() => undefined),
          raceTimeout(SW_UPDATE_TIMEOUT_MS),
        ])
        if (registration.installing || registration.waiting) {
          await Promise.race([
            new Promise<void>((resolve) => {
              navigator.serviceWorker.addEventListener(
                'controllerchange',
                () => resolve(),
                { once: true },
              )
            }),
            raceTimeout(CONTROLLER_CHANGE_TIMEOUT_MS),
          ])
        }
      }
    }
  } catch {
    // Best effort — still reload below.
  }
  window.location.reload()
}
