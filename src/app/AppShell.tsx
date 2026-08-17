import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { shouldShowOnboarding } from '@/domain/settings'
import { BottomNav } from '@/shared/ui/bottom-nav'
import { cn } from '@/shared/lib/utils'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const loadAssets = useAssetStore((state) => state.load)
  const loadSettings = useSettingsStore((state) => state.load)
  const assetsLoaded = useAssetStore((state) => state.loaded)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const assetCount = useAssetStore((state) => state.assets.length)
  const onboardingCompleted = useSettingsStore(
    (state) => state.settings.onboardingCompleted,
  )
  const onboarding = pathname === '/onboarding'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

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
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <span className="text-sm font-semibold text-foreground">
            My Money
          </span>
        </div>
      </header>
      <main
        className={cn(
          'mx-auto max-w-3xl px-4 py-6',
          onboarding ? 'pb-6' : 'pb-28',
        )}
      >
        <Outlet />
      </main>
      {!onboarding && <BottomNav />}
    </div>
  )
}
