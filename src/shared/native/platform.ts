import { Capacitor } from '@capacitor/core'

/** Home-screen widget toggle is Android-only (#235). */
export function isAndroidNativePlatform(): boolean {
  return Capacitor.getPlatform() === 'android'
}
