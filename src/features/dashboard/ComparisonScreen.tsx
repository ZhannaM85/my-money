import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { historicalNetWorth } from '@/domain/netWorth'
import type { HoldingConversion } from '@/domain/netWorth'
import { comparisonRows } from '@/features/dashboard/comparisonRows'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount, formatChartAxisDate } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'

/** Narrow wrapping name column so two date columns fit a phone (#138). */
export const COMPARISON_NAME_COL_CLASS =
  'w-24 max-w-24 min-w-24 whitespace-normal break-words [overflow-wrap:anywhere]'
export const COMPARISON_DATE_COL_CLASS =
  'min-w-[8.25rem] w-[8.25rem] max-w-[8.25rem]'

function ComparisonCell({
  holding,
  baseCurrency,
}: {
  holding: HoldingConversion | undefined
  baseCurrency: string
}) {
  const t = useTranslation()
  const locale = useLocale()
  if (!holding) {
    return <span className="text-muted-foreground">—</span>
  }
  const showNative =
    holding.conversionAvailable &&
    holding.convertedAmount !== null &&
    holding.currency !== baseCurrency
  if (
    !holding.conversionAvailable ||
    holding.convertedAmount === null
  ) {
    return (
      <span className="flex flex-col gap-0.5">
        <span className="tabular-nums">
          {formatAmount(holding.nativeAmount, holding.currency, locale)}
        </span>
        <span className="text-xs text-muted-foreground">
          {t.dashboard.conversionUnavailable}
        </span>
      </span>
    )
  }
  return (
    <span className="flex flex-col gap-0.5">
      <span className="tabular-nums font-medium">
        {formatAmount(holding.convertedAmount, baseCurrency, locale)}
      </span>
      {showNative ? (
        <span className="tabular-nums text-xs text-muted-foreground">
          {formatAmount(holding.nativeAmount, holding.currency, locale)}
        </span>
      ) : null}
    </span>
  )
}

export function ComparisonScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const dates = useComparisonStore((state) => state.dates)
  const removeDate = useComparisonStore((state) => state.removeDate)

  const confirmRemoveDate = (date: string) => {
    if (!window.confirm(t.dashboard.removeFromComparisonConfirm(date))) return
    removeDate(date)
  }
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const ensureRates = useFxStore((state) => state.ensureRates)

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  useEffect(() => {
    if (!loaded || !settingsLoaded || dates.length === 0) return
    const symbols = [...new Set(snapshots.map((row) => row.currency))]
    void ensureRates(
      dates.flatMap((date) =>
        symbols.map((from) => ({ from, to: baseCurrency, date })),
      ),
    )
  }, [
    baseCurrency,
    dates,
    ensureRates,
    loaded,
    settingsLoaded,
    snapshots,
  ])

  const points = useMemo(
    () =>
      dates.length === 0
        ? []
        : historicalNetWorth(assets, snapshots, quotes, dates, baseCurrency),
    [assets, baseCurrency, dates, quotes, snapshots],
  )
  const rows = useMemo(() => comparisonRows(points), [points])
  const totals = useMemo(() => {
    const byDate: Record<string, number> = {}
    for (const point of points) {
      byDate[point.date] = point.total
    }
    return byDate
  }, [points])

  if (!loaded || !settingsLoaded) {
    return <p className="text-sm text-muted-foreground">{t.common.loading}</p>
  }

  if (dates.length < 2) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t.dashboard.comparisonTitle}
          description={t.dashboard.comparisonDescription}
        />
        <EmptyState
          title={t.dashboard.comparisonNeedTwoDates}
          action={
            <Button asChild variant="outline">
              <Link to="/">{t.nav.dashboard}</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-6 overflow-x-hidden">
      <PageHeader
        title={t.dashboard.comparisonTitle}
        description={t.dashboard.comparisonDescription}
      />
      <div
        data-testid="comparison-h-scroll"
        className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain"
      >
        <table
          className="w-max table-fixed border-separate border-spacing-0 text-sm"
          data-testid="comparison-table"
        >
          <colgroup>
            <col className="w-24" />
            {dates.map((date) => (
              <col key={date} className="w-[8.25rem]" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th
                data-testid="comparison-name-col"
                className={`sticky left-0 z-10 bg-background py-2 pr-2 text-left font-medium text-muted-foreground ${COMPARISON_NAME_COL_CLASS}`}
              >
                {t.dashboard.holdings}
              </th>
              {dates.map((date) => (
                <th
                  key={date}
                  className={`px-2 py-2 text-right font-medium text-foreground ${COMPARISON_DATE_COL_CLASS}`}
                >
                  <span className="inline-flex items-center justify-end gap-1">
                    {formatChartAxisDate(date, locale)}
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={t.dashboard.removeFromComparison(date)}
                      onClick={() => confirmRemoveDate(date)}
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.assetId}>
                <th
                  className={`sticky left-0 z-10 bg-background py-3 pr-2 text-left font-medium ${COMPARISON_NAME_COL_CLASS}`}
                >
                  {row.name}
                </th>
                {dates.map((date) => (
                  <td
                    key={date}
                    className={`px-2 py-3 text-right align-top ${COMPARISON_DATE_COL_CLASS}`}
                  >
                    <ComparisonCell
                      holding={row.byDate[date]}
                      baseCurrency={baseCurrency}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th
                className={`sticky left-0 z-10 bg-background py-3 pr-2 text-left font-semibold ${COMPARISON_NAME_COL_CLASS}`}
              >
                {t.dashboard.positionsTotal}
              </th>
              {dates.map((date) => (
                <td
                  key={date}
                  className={`px-2 py-3 text-right font-semibold tabular-nums ${COMPARISON_DATE_COL_CLASS}`}
                >
                  {formatAmount(totals[date] ?? 0, baseCurrency, locale)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
