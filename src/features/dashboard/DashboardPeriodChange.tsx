import { ChevronDown } from 'lucide-react'
import { useLocale, useTranslation, type Locale } from '@/i18n'
import { formatSignedAmount } from '@/shared/lib/money'
import { InfoHint } from '@/shared/ui/info-hint'
import { cn } from '@/shared/lib/utils'

type PeriodBreakdown = {
  amountChange: number
  rateChange: number
  holdings: readonly {
    assetId: string
    name: string
    amountChange: number
    rateChange: number
  }[]
}

export function DashboardPeriodChange({
  breakdown,
  baseCurrency,
  periodOpen,
  onTogglePeriod,
}: {
  breakdown: PeriodBreakdown
  baseCurrency: string
  periodOpen: 'amount' | 'rate' | null
  onTogglePeriod: (key: 'amount' | 'rate') => void
}) {
  const t = useTranslation()
  const locale = useLocale()

  return (
    <InfoHint
      hint={t.dashboard.periodChangeHint}
      label={t.common.aboutField(t.dashboard.thisMonth)}
    >
      <ul className="flex flex-col gap-1 text-sm">
        <PeriodChangeRow
          kind="amount"
          label={t.dashboard.amountChange}
          total={breakdown.amountChange}
          holdings={breakdown.holdings}
          open={periodOpen === 'amount'}
          baseCurrency={baseCurrency}
          locale={locale}
          onToggle={() => onTogglePeriod('amount')}
        />
        <PeriodChangeRow
          kind="rate"
          label={t.dashboard.rateChange}
          total={breakdown.rateChange}
          holdings={breakdown.holdings}
          open={periodOpen === 'rate'}
          baseCurrency={baseCurrency}
          locale={locale}
          onToggle={() => onTogglePeriod('rate')}
        />
      </ul>
    </InfoHint>
  )
}

function PeriodChangeRow({
  kind,
  label,
  total,
  holdings,
  open,
  baseCurrency,
  locale,
  onToggle,
}: {
  kind: 'amount' | 'rate'
  label: string
  total: number
  holdings: PeriodBreakdown['holdings']
  open: boolean
  baseCurrency: string
  locale: Locale
  onToggle: () => void
}) {
  const field = kind === 'amount' ? 'amountChange' : 'rateChange'
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="flex items-center gap-1 tabular-nums">
          {formatSignedAmount(total, baseCurrency, locale)}
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </span>
      </button>
      {open &&
        holdings
          .filter((row) => row[field] !== 0)
          .map((row) => (
            <div
              key={`${kind}-${row.assetId}`}
              className="flex justify-between gap-3 pt-1 text-xs"
            >
              <span className="truncate text-muted-foreground">{row.name}</span>
              <span className="tabular-nums">
                {formatSignedAmount(row[field], baseCurrency, locale)}
              </span>
            </div>
          ))}
    </li>
  )
}
