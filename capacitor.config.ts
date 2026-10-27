import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.github.zhannam85.mymoney',
  appName: 'My Money',
  webDir: 'dist',
  ios: {
    // Capacitor only. The home-screen PWA ignores this. A future native
    // shell should not scroll the WKWebView under the iOS 26 top pocket.
    contentInset: 'never',
    scrollEnabled: false,
  },
}

export default config
