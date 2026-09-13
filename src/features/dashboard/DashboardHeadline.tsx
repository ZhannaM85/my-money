import { ChevronDown } from 'lucide-react'
import type { HoldingConversion } from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { SelectField } from '@/shared/ui/select-field'
import { StatCard } from '@/shared/ui/stat-card'
import { cn } from '@/shared/lib/utils'
import { PositionsHoldingRow } from './PositionsHoldingRow'

export function DashboardHeadline({
  isOriginal,
  activeCurrencyFilter,
  baseCurrency,
  availableCurrencies,
  nativeTotals,
  convertedHoldings,
  openNativeCurrency,
  displayHeadlineTotal,
  selectedChartPoint,
  changeLabel,
  fxNote,
  onCurrencyFilterChange,
  onToggleNativeCurrency,
}: {
  isOriginal: boolean
  activeCurrencyFilter: string
  baseCurrency: string
  availableCurrencies: readonly string[]
  nativeTotals: readonly { currency: string; amount: number }[]
  convertedHoldings: readonly HoldingConversion[]
  openNativeCurrency: string | null
  displayHeadlineTotal: number
  selectedChartPoint?: { date: string }
  changeLabel?: string
  fxNote?: string
  onCurrencyFilterChange: (value: string) => void
  onToggleNativeCurrency: (currency: string) => void
}) {
  const t = useTranslation()
  const locale = useLocale()
  const showNativeAll = isOriginal && activeCurrencyFilter === 'all'

  return (
    <>
      <SelectField
        label={t.asset.currency}
        id="dashboard-currency-filter"
        className={cn(!isOriginal && 'text-muted-foreground opacity-60')}
        value={isOriginal ? activeCurrencyFilter : baseCurrency}
        disabled={!isOriginal}
        hint={isOriginal ? undefined : t.dashboard.currencyFilterConvertedHint}
        aboutLabel={
          isOriginal ? undefined : t.common.aboutField(t.asset.currency)
        }
        onChange={(event) => {
          onCurrencyFilterChange(event.target.value)
        }}
      >
        {isOriginal && <option value="all">{t.assets.filterAll}</option>}
        {(isOriginal ? availableCurrencies : [baseCurrency]).map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </SelectField>
      {showNativeAll ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            {t.dashboard.nativeHoldings}
          </span>
          <ul className="flex flex-col gap-2">
            {nativeTotals.map((row) => {
              const open = openNativeCurrency === row.currency
              const holdings = convertedHoldings.filter(
                (holding) => holding.currency === row.currency,
              )
              return (
                <li
                  key={row.currency}
                  className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-left"
                    aria-expanded={open}
                    aria-label={`${row.currency} · ${t.dashboard.holdings}`}
                    onClick={() => onToggleNativeCurrency(row.currency)}
                  >
                    <span className="text-sm font-medium">{row.currency}</span>
                    <span className="flex items-center gap-1 tabular-nums text-base font-semibold">
                      {formatAmount(row.amount, row.currency, locale)}
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
                    holdings.map((holding) => (
                      <PositionsHoldingRow
                        key={holding.assetId}
                        row={holding}
                        isOriginal
                        baseCurrency={baseCurrency}
                        compact
                      />
                    ))}
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <StatCard
          label={t.dashboard.netWorth}
          value={formatAmount(
            displayHeadlineTotal,
            isOriginal ? activeCurrencyFilter : baseCurrency,
            locale,
          )}
          description={
            selectedChartPoint
              ? t.history.holdingsOn(selectedChartPoint.date)
              : changeLabel
          }
        />
      )}
      {fxNote && <p className="text-sm text-muted-foreground">{fxNote}</p>}
    </>
  )
}
