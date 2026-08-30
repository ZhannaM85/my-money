import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { router } from '@/app/router'

/**
 * #165 — Android hardware/gesture back. Tabs already `replace`, so they
 * do not pile up on the WebView stack. Close a dialog first, else real
 * history, else Dashboard, else exit.
 */
export function initBackButtonHandler(): void {
  if (Capacitor.getPlatform() !== 'android') return

  void App.addListener('backButton', ({ canGoBack }) => {
    const openDialog = document.querySelector(
      '[role="dialog"][data-state="open"]',
    )
    if (openDialog) {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      )
      return
    }

    if (canGoBack) {
      window.history.back()
      return
    }

    if (window.location.pathname !== '/') {
      void router.navigate('/')
      return
    }

    void App.exitApp()
  })
}
