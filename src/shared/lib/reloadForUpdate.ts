const CONTROLLER_CHANGE_TIMEOUT_MS = 5000

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
        await registration.update()
        if (registration.installing || registration.waiting) {
          await Promise.race([
            new Promise<void>((resolve) => {
              navigator.serviceWorker.addEventListener(
                'controllerchange',
                () => resolve(),
                { once: true },
              )
            }),
            new Promise<void>((resolve) =>
              setTimeout(resolve, CONTROLLER_CHANGE_TIMEOUT_MS),
            ),
          ])
        }
      }
    }
  } catch {
    // Best effort — still reload below.
  }
  window.location.reload()
}
