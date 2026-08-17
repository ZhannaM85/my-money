import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '@/shared/ui/bottom-nav'

export function AppShell() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <span className="text-sm font-semibold text-foreground">
            My Money
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
