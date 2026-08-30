import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core'

/**
 * #166 — keep native status/nav bar icon color readable against the
 * app background. Capacitor 8 `SystemBars` (built into `@capacitor/core`).
 * No-op on web.
 */
export function applyNativeChromeTheme(isDark: boolean): void {
  if (!Capacitor.isNativePlatform()) return

  void SystemBars.setStyle({
    style: isDark ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
  }).catch(() => {})
}
