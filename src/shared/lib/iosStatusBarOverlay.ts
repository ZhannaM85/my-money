/**
 * iOS 26/27 home-screen Liquid Glass blurs about the top 112px of a web
 * view that draws under the status bar (#321). `env(safe-area-inset-top)`
 * only clears the clock, so the title stays inside the frost. A web view
 * that already starts below the status bar does not need this pad.
 *
 * Measured on iOS 27: the gradient is gone by ~112px, and
 * `apple-mobile-web-app-status-bar-style: default` removes it — but iOS
 * reads that meta only when the icon is added to the Home Screen.
 */

/** Title top must reach this physical y before the frost fades. */
export const IOS_LIQUID_GLASS_CLEAR_PX = 120

/**
 * Home-indicator inset can leave ~34px of `screen.height` outside
 * `innerHeight` while the status bar still overlays the page. A web view
 * that starts below the status bar leaves at least ~47px.
 */
export const IOS_WEBVIEW_BELOW_STATUS_BAR_PX = 44

/** Header content offset already applied on top of the safe area. */
export const IOS_HEADER_CONTENT_PAD_PX = 12

export function iosStatusBarOverlayPad(input: {
  standalone: boolean
  portrait: boolean
  screenHeight: number
  innerHeight: number
  safeAreaTop: number
}): number {
  if (!input.standalone || !input.portrait) return 0
  if (
    !Number.isFinite(input.screenHeight) ||
    !Number.isFinite(input.innerHeight) ||
    input.screenHeight <= 0 ||
    input.innerHeight <= 0
  ) {
    return 0
  }
  const uncovered = input.screenHeight - input.innerHeight
  if (uncovered >= IOS_WEBVIEW_BELOW_STATUS_BAR_PX) return 0
  const titleTop =
    Math.max(0, input.safeAreaTop) + IOS_HEADER_CONTENT_PAD_PX
  const extra = IOS_LIQUID_GLASS_CLEAR_PX - titleTop
  return extra > 0 ? extra : 0
}

export function readSafeAreaTop(doc: Document = document): number {
  const probe = doc.createElement('div')
  probe.style.paddingTop = 'env(safe-area-inset-top)'
  doc.documentElement.appendChild(probe)
  const top = Number.parseFloat(getComputedStyle(probe).paddingTop)
  probe.remove()
  return Number.isFinite(top) ? top : 0
}

export function applyIosStatusBarOverlay(win: Window = window): void {
  const nav = win.navigator as Navigator & { standalone?: boolean }
  const extra = iosStatusBarOverlayPad({
    standalone: nav.standalone === true,
    portrait: win.matchMedia('(orientation: portrait)').matches,
    screenHeight: win.screen.height,
    innerHeight: win.innerHeight,
    safeAreaTop: readSafeAreaTop(win.document),
  })
  const root = win.document.documentElement
  if (extra > 0) {
    root.style.setProperty('--ios-status-overlay-pad', `${extra}px`)
  } else {
    root.style.removeProperty('--ios-status-overlay-pad')
  }
}

export function installIosStatusBarOverlay(win: Window = window): void {
  const apply = () => applyIosStatusBarOverlay(win)
  apply()
  // innerHeight can still be 0 while the first script in <head> runs.
  win.requestAnimationFrame(apply)
  win.addEventListener('orientationchange', apply)
}
