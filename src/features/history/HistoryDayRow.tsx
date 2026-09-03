import { ChevronDown } from 'lucide-react'
import { HoldingBreakdownList } from '@/features/dashboard/HoldingBreakdownList'
import { useLocale } from '@/i18n'
import { formatAmount, formatSignedAmount } from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'

type OriginalHistoryDayRow = {
  date: string
  totals: ReadonlyArray<{ currency: string; amount: number }>
  holdings: Parameters<typeof HoldingBreakdownList>[0]['holdings']
}

type ConvertedHistoryDayRow = {
  date: string
  total: number
  delta?: number | null
  holdings: Parameters<typeof HoldingBreakdownList>[0]['holdings']
}

export function HistoryDayRow({
  row,
  open,
  baseCurrency,
  nativeOnly,
  label,
  onToggle,
  testId,
}: {
  row: OriginalHistoryDayRow | ConvertedHistoryDayRow
  open: boolean
  baseCurrency: string
  nativeOnly: boolean
  label: string
  onToggle: () => void
  testId?: string
}) {
  const locale = useLocale()

  return (
    <li
      className="rounded-xl bg-card ring-1 ring-foreground/10"
      data-testid={testId}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        aria-label={label}
        onClick={onToggle}
      >
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          {row.date}
          <ChevronDown
            className={cn('size-4 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </span>
        <span className="text-right">
          {'totals' in row ? (
            row.totals.map((total) => (
              <span
                key={total.currency}
                className="block tabular-nums text-sm"
              >
                {formatAmount(total.amount, total.currency, locale)}
              </span>
            ))
          ) : (
            <>
              <span className="block tabular-nums text-sm">
                {formatAmount(row.total, baseCurrency, locale)}
              </span>
              {row.delta !== null && row.delta !== undefined ? (
                <span className="text-xs text-muted-foreground">
                  {formatSignedAmount(row.delta, baseCurrency, locale)}
                </span>
              ) : null}
            </>
          )}
        </span>
      </button>
      {open && row.holdings.length > 0 ? (
        <div className="border-t border-border px-4 py-3">
          <HoldingBreakdownList
            holdings={row.holdings}
            baseCurrency={baseCurrency}
            nativeOnly={nativeOnly}
            asOfDate={row.date}
          />
        </div>
      ) : null}
    </li>
  )
}
