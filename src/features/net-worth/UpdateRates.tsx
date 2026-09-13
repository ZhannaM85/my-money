import { RefreshCw } from 'lucide-react'
import { useLocale, useTranslation } from '@/i18n'
import { formatDateTime } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import type { RatesStatus } from './useUpdateRates'

/** Single Update rates control (#246) — mount on Dashboard only. */
export function UpdateRates({
  fxLoading,
  ratesStatus,
  lastFetchedAt,
  onUpdateRates,
}: {
  fxLoading: boolean
  ratesStatus: RatesStatus
  lastFetchedAt?: string
  onUpdateRates: () => void
}) {
  const t = useTranslation()
  const locale = useLocale()

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        disabled={fxLoading || ratesStatus === 'loading'}
        aria-busy={ratesStatus === 'loading'}
        onClick={onUpdateRates}
      >
        {ratesStatus === 'loading' && (
          <RefreshCw className="size-4 animate-spin" aria-hidden />
        )}
        {t.dashboard.updateRates}
      </Button>
      {ratesStatus === 'offline' ? (
        <p role="status" className="text-xs text-muted-foreground">
          {t.dashboard.ratesUpdateOffline}
        </p>
      ) : ratesStatus === 'error' ? (
        <p role="status" className="text-xs text-muted-foreground">
          {t.dashboard.ratesUpdateFailed}
        </p>
      ) : lastFetchedAt ? (
        <p
          role="status"
          className="flex justify-between gap-3 text-xs text-muted-foreground"
        >
          <span>{t.dashboard.ratesUpdated}</span>
          <time dateTime={lastFetchedAt}>
            {formatDateTime(lastFetchedAt, locale)}
          </time>
        </p>
      ) : ratesStatus === 'updated' ? (
        <p role="status" className="text-xs text-muted-foreground">
          {t.dashboard.ratesUpdated}
        </p>
      ) : null}
    </>
  )
}
