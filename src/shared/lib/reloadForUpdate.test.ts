import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reloadForUpdate } from './reloadForUpdate'

function stubServiceWorkerRegistration(registration: unknown) {
  const addEventListener = vi.fn()
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      getRegistration: vi.fn().mockResolvedValue(registration),
      addEventListener,
    },
  })
  return addEventListener
}

function stubServiceWorkerRegistrations(
  registrations: Array<{ unregister: () => void | Promise<void> }>,
) {
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      getRegistrations: vi.fn().mockResolvedValue(registrations),
    },
  })
}

describe('reloadForUpdate', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(
    navigator,
    'serviceWorker',
  )
  const originalCaches = Object.getOwnPropertyDescriptor(window, 'caches')
  let reload: ReturnType<typeof vi.fn>

  beforeEach(() => {
    reload = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker)
    } else {
      // @ts-expect-error test cleanup
      delete navigator.serviceWorker
    }
    if (originalCaches) {
      Object.defineProperty(window, 'caches', originalCaches)
    } else {
      // @ts-expect-error test cleanup
      delete window.caches
    }
  })

  it('reloads immediately when there is no service worker registration', async () => {
    stubServiceWorkerRegistration(null)
    await reloadForUpdate()
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('force unregisters every registration and clears caches before reload', async () => {
    const unregister = vi.fn().mockResolvedValue(true)
    stubServiceWorkerRegistrations([{ unregister }])
    const cachesDelete = vi.fn().mockResolvedValue(true)
    Object.defineProperty(window, 'caches', {
      configurable: true,
      value: {
        keys: vi.fn().mockResolvedValue(['workbox-precache-v1']),
        delete: cachesDelete,
      },
    })

    await reloadForUpdate({ force: true })

    expect(unregister).toHaveBeenCalledTimes(1)
    expect(cachesDelete).toHaveBeenCalledWith('workbox-precache-v1')
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('reloads even if force cleanup throws', async () => {
    stubServiceWorkerRegistrations([
      { unregister: vi.fn().mockRejectedValue(new Error('fail')) },
    ])
    await reloadForUpdate({ force: true })
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('reloads after SW update timeout when update() never settles (#220)', async () => {
    vi.useFakeTimers()
    const update = vi.fn(() => new Promise<void>(() => {}))
    stubServiceWorkerRegistration({
      update,
      installing: null,
      waiting: null,
    })

    const done = reloadForUpdate()
    await vi.advanceTimersByTimeAsync(3000)
    await done

    expect(update).toHaveBeenCalledTimes(1)
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
