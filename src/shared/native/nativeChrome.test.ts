import { afterEach, describe, expect, it, vi } from 'vitest'
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core'
import { applyNativeChromeTheme } from './nativeChrome'

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(() => false) },
  SystemBars: { setStyle: vi.fn(() => Promise.resolve()) },
  SystemBarsStyle: { Dark: 'DARK', Light: 'LIGHT' },
}))

afterEach(() => {
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
  vi.mocked(SystemBars.setStyle).mockClear()
})

describe('applyNativeChromeTheme (#166)', () => {
  it('is a no-op on web', () => {
    applyNativeChromeTheme(false)
    expect(SystemBars.setStyle).not.toHaveBeenCalled()
  })

  it('sets light bar icons on a dark native shell', () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
    applyNativeChromeTheme(true)
    expect(SystemBars.setStyle).toHaveBeenCalledWith({
      style: SystemBarsStyle.Dark,
    })
  })

  it('sets dark bar icons on a light native shell', () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
    applyNativeChromeTheme(false)
    expect(SystemBars.setStyle).toHaveBeenCalledWith({
      style: SystemBarsStyle.Light,
    })
  })
})
