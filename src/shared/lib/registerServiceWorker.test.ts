import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isNativePlatform,
  registerServiceWorker,
} from './registerServiceWorker'

const originalCapacitor = Reflect.get(window, 'Capacitor')

afterEach(() => {
  if (originalCapacitor === undefined) {
    Reflect.deleteProperty(window, 'Capacitor')
  } else {
    Reflect.set(window, 'Capacitor', originalCapacitor)
  }
  vi.restoreAllMocks()
})

describe('isNativePlatform', () => {
  it('is false on the web and true inside Capacitor', () => {
    Reflect.deleteProperty(window, 'Capacitor')
    expect(isNativePlatform()).toBe(false)
    Reflect.set(window, 'Capacitor', { isNativePlatform: () => true })
    expect(isNativePlatform()).toBe(true)
  })
})

describe('registerServiceWorker', () => {
  it('does not register inside the native shell (#162)', () => {
    const add = vi.spyOn(window, 'addEventListener')
    Reflect.set(window, 'Capacitor', { isNativePlatform: () => true })
    registerServiceWorker()
    expect(add).not.toHaveBeenCalled()
  })
})
