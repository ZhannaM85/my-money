import { RefreshCw } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { usePullToRefresh } from '@/shared/hooks'
import { PULL_THRESHOLD } from '@/shared/lib/pullToRefresh'
import { cn } from '@/shared/lib/utils'

export function PullToRefreshIndicator() {
  const t = useTranslation()
  const { pullDistance, isRefreshing } = usePullToRefresh()

  if (pullDistance === 0 && !isRefreshing) return null

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1)
  const ready = progress >= 1

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-[calc(env(safe-area-inset-top)+12px)]"
      aria-hidden={!isRefreshing}
    >
      <div
        className={cn(
          'flex size-9 items-center justify-center rounded-full bg-card shadow-md ring-1 ring-border',
          ready || isRefreshing ? 'text-primary' : 'text-muted-foreground',
        )}
        style={{
          opacity: isRefreshing ? 1 : progress,
          transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
        }}
      >
        <RefreshCw
          aria-hidden="true"
          className={cn('size-4', isRefreshing && 'animate-spin')}
        />
      </div>
      {isRefreshing && <span className="sr-only">{t.common.loading}</span>}
    </div>
  )
}
