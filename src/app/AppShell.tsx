import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppUpdateBanner } from '@/app/AppUpdateBanner'
import { OfflineBanner } from '@/app/OfflineBanner'
import { PullToRefreshIndicator } from '@/app/PullToRefreshIndicator'
import { shouldShowOnboarding } from '@/domain/settings'
import { useTranslation } from '@/i18n'
import { useIsTextInputFocused } from '@/shared/hooks'
import { BottomNav } from '@/shared/ui/bottom-nav'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const loadAssets = useAssetStore((state) => state.load)
  const loadSettings = useSettingsStore((state) => state.load)
  const loadCachedRates = useFxStore((state) => state.loadCached)
  const ensureRates = useFxStore((state) => state.ensureRates)
  const assetsLoaded = useAssetStore((state) => state.loaded)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const assetCount = useAssetStore((state) => state.assets.length)
  const snapshots = useAssetStore((state) => state.snapshots)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const onboardingCompleted = useSettingsStore(
    (state) => state.settings.onboardingCompleted,
  )
  const fxError = useFxStore((state) => state.error)
  const t = useTranslation()
  const locale = useSettingsStore((state) => state.settings.locale)
  const onboarding = pathname === '/onboarding'
  const isTextInputFocused = useIsTextInputFocused()
  const hideTabBar = onboarding || isTextInputFocused
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    const main = mainRef.current
    if (main) main.scrollTop = 0
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    void loadAssets()
    void loadSettings()
    void loadCachedRates()
  }, [loadAssets, loadCachedRates, loadSettings])

  useEffect(() => {
    if (!assetsLoaded || !settingsLoaded) return
    void ensureRates(
      snapshots.map((snapshot) => ({
        from: snapshot.currency,
        to: baseCurrency,
        date: snapshot.date,
      })),
    )
  }, [assetsLoaded, baseCurrency, ensureRates, settingsLoaded, snapshots])

  useEffect(() => {
    if (!assetsLoaded || !settingsLoaded) return
    if (!shouldShowOnboarding(assetCount, onboardingCompleted)) return
    if (pathname === '/onboarding' || pathname === '/settings') return
    navigate('/onboarding', { replace: true })
  }, [
    assetCount,
    assetsLoaded,
    navigate,
    onboardingCompleted,
    pathname,
    settingsLoaded,
  ])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <PullToRefreshIndicator />
      <a
        href="#main-content"
        className="bg-primary text-primary-foreground absolute top-3 left-3 z-50 -translate-y-[200%] rounded-lg px-3 py-2 text-sm font-medium focus:translate-y-0"
      >
        {t.common.skipToContent}
      </a>
      <OfflineBanner />
      <AppUpdateBanner />
      <header className="shrink-0 border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <span className="text-sm font-semibold text-foreground">
            {t.appName}
          </span>
        </div>
      </header>
      <main
        ref={mainRef}
        id="main-content"
        className="mx-auto w-full max-w-3xl min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto overscroll-x-none px-4 py-6 relative z-20"
      >
        {fxError && (
          <p className="mb-4 text-sm text-muted-foreground">
            {t.fx.usingCachedRates}
          </p>
        )}
        <Outlet />
      </main>
      {!hideTabBar && <BottomNav />}
    </div>
  )
}
