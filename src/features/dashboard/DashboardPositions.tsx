import { ChevronDown } from 'lucide-react'
import type { HoldingConversion } from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'
import { Chip } from '@/shared/ui/chip'
import { useSettingsStore } from '@/stores/settingsStore'
import { pinZeroBalanceHoldingsLast } from './pinZeroBalanceHoldingsLast'
import { PositionsHoldingRow } from './PositionsHoldingRow'

export function DashboardPositions({
  holdings,
  holdingsOpen,
  selectedChartPoint,
  displayHeadlineTotal,
  isOriginal,
  activeCurrencyFilter,
  baseCurrency,
  asOfDate,
  onToggle,
  onExpand,
}: {
  holdings: readonly HoldingConversion[]
  holdingsOpen: boolean
  selectedChartPoint?: { date: string }
  displayHeadlineTotal: number
  isOriginal: boolean
  activeCurrencyFilter: string
  baseCurrency: string
  asOfDate: string
  onToggle: () => void
  onExpand?: () => void
}) {
  const t = useTranslation()
  const locale = useLocale()
  const compact = useSettingsStore(
    (state) => state.settings.compactDashboardPositions,
  )
  const setCompactDashboardPositions = useSettingsStore(
    (state) => state.setCompactDashboardPositions,
  )
  const label = selectedChartPoint
    ? t.history.holdingsOn(selectedChartPoint.date)
    : t.dashboard.holdings
  const orderedHoldings = pinZeroBalanceHoldingsLast(holdings)

  return (
    <div className="flex flex-col gap-2" data-testid="dashboard-positions">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{t.dashboard.positionsDensity}</span>
        <div
          className="flex gap-2"
          role="group"
          aria-label={t.dashboard.positionsDensity}
          data-testid="positions-density-toggle"
        >
          {(
            [
              {
                compact: false,
                label: t.dashboard.positionsDensityComfortable,
              },
              { compact: true, label: t.dashboard.positionsDensityCompact },
            ] as const
          ).map((item) => (
            <Chip
              key={item.label}
              pressed={compact === item.compact}
              onClick={() => {
                void setCompactDashboardPositions(item.compact)
                if (item.compact) onExpand?.()
              }}
            >
              {item.label}
            </Chip>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="flex items-center justify-between gap-2 text-left"
        aria-expanded={holdingsOpen}
        aria-label={label}
        onClick={onToggle}
      >
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className="flex items-center gap-1 text-sm text-muted-foreground"
          aria-hidden
        >
          {orderedHoldings.length}
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              holdingsOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>
      <p
        className="flex items-baseline justify-between gap-3 text-sm"
        data-testid="positions-total"
      >
        <span className="text-muted-foreground">
          {t.dashboard.positionsTotal}
        </span>
        <span className="tabular-nums text-base font-semibold text-foreground">
          {formatAmount(
            displayHeadlineTotal,
            isOriginal ? activeCurrencyFilter : baseCurrency,
            locale,
          )}
        </span>
      </p>
      {holdingsOpen && (
        <ul
          className={cn(
            'flex flex-col',
            compact
              ? 'gap-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 [&>li:first-child_[data-compact-row]]:border-t-0'
              : 'gap-2',
          )}
          data-compact={compact ? 'true' : 'false'}
        >
          {orderedHoldings.map((row) => (
            <li key={row.assetId}>
              <PositionsHoldingRow
                row={row}
                isOriginal={isOriginal}
                baseCurrency={baseCurrency}
                asOfDate={asOfDate}
                compact={compact}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
