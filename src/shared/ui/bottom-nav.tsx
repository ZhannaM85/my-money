import { History, LayoutDashboard, Plus, Settings, Wallet } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/utils'

const tabs = [
  { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/assets', label: 'Assets', icon: Wallet },
  { to: '/update', label: 'Update', icon: Plus, prominent: true },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'More', icon: Settings },
] as const

export function BottomNav() {
  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]"
    >
      <ul className="mx-auto flex max-w-3xl px-4">
        {tabs.map((item) => {
          const Icon = item.icon
          const prominent = 'prominent' in item && item.prominent
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={'end' in item ? item.end : false}
                replace
                aria-label={item.label}
                className="flex min-h-16 flex-col items-center justify-center text-xs font-medium"
              >
                {({ isActive }) => (
                  <span
                    className={cn(
                      'inline-flex flex-col items-center gap-0.5 rounded-2xl px-3 py-1.5 transition-colors',
                      prominent &&
                        'rounded-full bg-primary px-3.5 py-2.5 text-primary-foreground',
                      !prominent &&
                        (isActive
                          ? 'bg-muted text-primary'
                          : 'text-muted-foreground'),
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    <span className={cn(prominent && 'sr-only')}>
                      {item.label}
                    </span>
                  </span>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
