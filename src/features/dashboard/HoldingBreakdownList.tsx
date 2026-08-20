import type { HoldingConversion } from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'

export function HoldingBreakdownList({
  holdings,
  baseCurrency,
  compact = false,
}: {
  holdings: readonly HoldingConversion[]
  baseCurrency: string
  compact?: boolean
}) {
  const t = useTranslation()
  const locale = useLocale()
  return (
    <ul className={cn('flex flex-col', compact ? 'gap-1' : 'gap-2')}>
      {holdings.map((row) => (
        <li
          key={row.assetId}
          className={
            compact
              ? 'flex items-start justify-between gap-3 py-0.5'
              : 'flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10'
          }
        >
          <span className="flex min-w-0 flex-col">
            <span className={cn('truncate font-medium', compact ? 'text-xs' : 'text-sm')}>
              {row.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.conversionAvailable
                ? formatAmount(row.nativeAmount, row.currency, locale)
                : t.dashboard.conversionUnavailable}
            </span>
          </span>
          <span className="shrink-0 text-right">
            {row.conversionAvailable && row.convertedAmount !== null ? (
              <span
                className={cn(
                  'block tabular-nums font-medium',
                  compact ? 'text-xs' : 'text-sm',
                )}
              >
                {formatAmount(row.convertedAmount, baseCurrency, locale)}
              </span>
            ) : (
              <span className={cn('block tabular-nums', compact ? 'text-xs' : 'text-sm')}>
                {formatAmount(row.nativeAmount, row.currency, locale)}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
