import { ChevronDown } from 'lucide-react'
import type { HoldingConversion } from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'
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
}) {
  const t = useTranslation()
  const locale = useLocale()
  const label = selectedChartPoint
    ? t.history.holdingsOn(selectedChartPoint.date)
    : t.dashboard.holdings

  return (
    <div className="flex flex-col gap-2" data-testid="dashboard-positions">
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
          {holdings.length}
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
        <ul className="flex flex-col gap-2">
          {holdings.map((row) => (
            <li key={row.assetId}>
              <PositionsHoldingRow
                row={row}
                isOriginal={isOriginal}
                baseCurrency={baseCurrency}
                asOfDate={asOfDate}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
