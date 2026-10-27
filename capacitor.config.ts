import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.github.zhannam85.mymoney',
  appName: 'My Money',
  webDir: 'dist',
  ios: {
    // #321: the document does not scroll. A scrollable WKWebView is what
    // iOS 26 frosts along the top edge, over the app title.
    contentInset: 'never',
    scrollEnabled: false,
  },
}

export default config
