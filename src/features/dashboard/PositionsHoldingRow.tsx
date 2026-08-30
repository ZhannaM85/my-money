import type { HoldingConversion } from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'
import { SwipeRevealRow } from '@/shared/ui/swipe-reveal-row'
import { useAssetStore } from '@/stores/assetStore'

export function PositionsHoldingRow({
  row,
  isOriginal,
  baseCurrency,
  compact = false,
}: {
  row: HoldingConversion
  isOriginal: boolean
  baseCurrency: string
  compact?: boolean
}) {
  const t = useTranslation()
  const locale = useLocale()
  const setTrackingStatus = useAssetStore((state) => state.setTrackingStatus)
  const excluded = Boolean(row.excluded)
  const actionLabel = excluded
    ? t.dashboard.showOnPositions
    : t.dashboard.hideFromPositions
  const actionAria = excluded
    ? t.dashboard.showOnPositionsAria(row.name)
    : t.dashboard.hideFromPositionsAria(row.name)

  return (
    <SwipeRevealRow
      revealOn="click"
      actionLabel={actionLabel}
      actionAria={actionAria}
      actionTone={excluded ? 'positive' : 'destructive'}
      onAction={() =>
        void setTrackingStatus(row.assetId, excluded ? 'included' : 'excluded')
      }
    >
      <div
        data-excluded={excluded ? 'true' : 'false'}
        className={cn(
          compact
            ? 'flex items-center justify-between gap-3 border-t border-border bg-card px-0 py-2'
            : 'flex items-center justify-between gap-3 bg-card px-4 py-3 ring-1 ring-foreground/10',
          excluded && 'opacity-60 text-muted-foreground',
        )}
      >
        <span className="flex min-w-0 flex-col">
          <span
            className={
              compact ? 'truncate text-sm' : 'truncate text-sm font-medium'
            }
          >
            {row.name}
          </span>
          {row.institution ? (
            <span className="truncate text-xs text-muted-foreground">
              {row.institution}
            </span>
          ) : null}
          {row.ownershipShare ? (
            <span className="text-xs text-muted-foreground">
              {t.asset.yourShare(row.ownershipShare)}
            </span>
          ) : null}
          {!isOriginal && !row.conversionAvailable ? (
            <span className="text-xs text-muted-foreground">
              {t.dashboard.conversionUnavailable}
            </span>
          ) : !isOriginal && row.currency !== baseCurrency ? (
            <span className="text-xs text-muted-foreground">
              {formatAmount(row.nativeAmount, row.currency, locale)}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-right">
          {isOriginal ||
          !row.conversionAvailable ||
          row.convertedAmount === null ? (
            <span className="block tabular-nums text-sm">
              {formatAmount(row.nativeAmount, row.currency, locale)}
            </span>
          ) : (
            <span className="block tabular-nums text-sm font-medium">
              {formatAmount(row.convertedAmount, baseCurrency, locale)}
            </span>
          )}
        </span>
      </div>
    </SwipeRevealRow>
  )
}
