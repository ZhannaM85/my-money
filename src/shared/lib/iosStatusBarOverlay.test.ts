import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  IOS_HEADER_CONTENT_PAD_PX,
  IOS_LIQUID_GLASS_CLEAR_PX,
  IOS_WEBVIEW_BELOW_STATUS_BAR_PX,
  iosStatusBarOverlayPad,
} from './iosStatusBarOverlay'

describe('iosStatusBarOverlayPad (#321)', () => {
  it('pads a full-screen portrait home-screen web view past the frost', () => {
    expect(
      iosStatusBarOverlayPad({
        standalone: true,
        portrait: true,
        screenHeight: 852,
        innerHeight: 852,
        safeAreaTop: 59,
      }),
    ).toBe(IOS_LIQUID_GLASS_CLEAR_PX - (59 + IOS_HEADER_CONTENT_PAD_PX))
  })

  it('still pads when only the home indicator sits outside the web view', () => {
    expect(
      iosStatusBarOverlayPad({
        standalone: true,
        portrait: true,
        screenHeight: 852,
        innerHeight: 852 - 34,
        safeAreaTop: 59,
      }),
    ).toBeGreaterThan(0)
  })

  it('does not pad when the web view already starts below the status bar', () => {
    expect(
      iosStatusBarOverlayPad({
        standalone: true,
        portrait: true,
        screenHeight: 852,
        innerHeight: 852 - 54,
        safeAreaTop: 0,
      }),
    ).toBe(0)
    expect(54).toBeGreaterThanOrEqual(IOS_WEBVIEW_BELOW_STATUS_BAR_PX)
  })

  it('does not pad Safari tabs, landscape, or desktop', () => {
    const base = {
      screenHeight: 852,
      innerHeight: 852,
      safeAreaTop: 0,
    }
    expect(
      iosStatusBarOverlayPad({ ...base, standalone: false, portrait: true }),
    ).toBe(0)
    expect(
      iosStatusBarOverlayPad({ ...base, standalone: true, portrait: false }),
    ).toBe(0)
  })

  it('keeps the install-time status bar opt-out in index.html', () => {
    const html = readFileSync(resolve('index.html'), 'utf8')
    expect(html).toContain(
      'name="apple-mobile-web-app-status-bar-style" content="default"',
    )
    expect(html).toContain(String(IOS_LIQUID_GLASS_CLEAR_PX))
    expect(html).toContain(String(IOS_WEBVIEW_BELOW_STATUS_BAR_PX))
    expect(html).toContain('--ios-status-overlay-pad')
  })
})
