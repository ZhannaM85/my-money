import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Capacitor } from '@capacitor/core'
import { isAndroidNativePlatform } from './platform'

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: vi.fn(() => 'web') },
}))

describe('isAndroidNativePlatform (#235)', () => {
  beforeEach(() => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue('web')
  })

  it('is true only on Capacitor Android', () => {
    expect(isAndroidNativePlatform()).toBe(false)
    vi.mocked(Capacitor.getPlatform).mockReturnValue('ios')
    expect(isAndroidNativePlatform()).toBe(false)
    vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
    expect(isAndroidNativePlatform()).toBe(true)
  })
})
