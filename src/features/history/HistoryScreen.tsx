import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { decomposeConvertedPeriodChange, historicalNetWorth, holdingsWithConversion, nativeTotalsByCurrency, periodChange } from '@/domain/netWorth'
import { HoldingBreakdownList } from '@/features/dashboard/HoldingBreakdownList'
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import { useLocale, useTranslation } from '@/i18n'
import {
  HISTORY_RANGES,
  isoDatesInclusive,
  isRangeClampedToEarliest,
  rangeStartIso,
  stepHistoryRange,
  type HistoryRange,
} from '@/shared/lib/dates'
import {
  formatAmount,
  formatChartAxisDate,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'

export function HistoryScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const isOriginal =
    useSettingsStore((state) => state.settings.currencyDisplayMode) ===
    'native'
  const quotes = useFxStore((state) => state.quotes)
  const ensureRange = useFxStore((state) => state.ensureRange)
  const [range, setRange] = useState<HistoryRange>('3M')
  const [openDates, setOpenDates] = useState<ReadonlySet<string>>(new Set())
  const today = todayIsoDate()
  const canZoomIn = range !== '1M'
  const canZoomOut = range !== 'All'

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  const earliest = useMemo(() => {
    if (snapshots.length === 0) return today
    return snapshots.reduce(
      (min, snapshot) => (snapshot.date < min ? snapshot.date : min),
      snapshots[0].date,
    )
  }, [snapshots, today])

  const start = rangeStartIso(range, today, earliest)
  const rangeLabel = isRangeClampedToEarliest(range, today, earliest)
    ? t.history.sinceDate(formatChartAxisDate(start, locale))
    : t.history.overRange(range)
  const dates = useMemo(() => isoDatesInclusive(start, today), [start, today])
  const snapshotDays = useMemo(() => {
    return [
      ...new Set(
        snapshots
          .map((snapshot) => snapshot.date)
          .filter((date) => date >= start && date <= today),
      ),
    ].sort()
  }, [snapshots, start, today])

  useEffect(() => {
    const symbols = [...new Set(snapshots.map((snapshot) => snapshot.currency))]
    void ensureRange(start, today, baseCurrency, symbols)
  }, [baseCurrency, ensureRange, snapshots, start, today])

  const nativeTotals = useMemo(
    () => nativeTotalsByCurrency(assets, snapshots),
    [assets, snapshots],
  )
  const series = useMemo(
    () =>
      isOriginal
        ? []
        : historicalNetWorth(assets, snapshots, quotes, dates, baseCurrency),
    [assets, baseCurrency, dates, isOriginal, quotes, snapshots],
  )
  const latestPoint = series[series.length - 1]
  const breakdown = useMemo(() => {
    if (isOriginal) return null
    const startHoldings = series[0]?.holdings
    const endHoldings = latestPoint?.holdings
    if (!startHoldings || !endHoldings) return null
    return decomposeConvertedPeriodChange(startHoldings, endHoldings)
  }, [isOriginal, latestPoint, series])
  const changeFrom = series[0]?.total ?? 0
  const headlineTo = breakdown
    ? changeFrom + breakdown.amountChange
    : (latestPoint?.total ?? 0)
  const change = periodChange(changeFrom, headlineTo)
  const convertedList = useMemo(() => {
    const byDate = new Map(series.map((point) => [point.date, point]))
    const points = snapshotDays
      .map((date) => byDate.get(date))
      .filter((point): point is NonNullable<typeof point> => point !== undefined)
    return [...points].reverse().map((point, index, rows) => {
      const older = rows[index + 1]
      return {
        ...point,
        delta: older ? point.total - older.total : null,
      }
    })
  }, [series, snapshotDays])
  const originalList = useMemo(() => {
    return [...snapshotDays].reverse().map((date) => {
      const asOf = snapshots.filter((snapshot) => snapshot.date <= date)
      return {
        date,
        totals: nativeTotalsByCurrency(assets, asOf),
        holdings: holdingsWithConversion(assets, asOf, quotes, baseCurrency),
      }
    })
  }, [assets, baseCurrency, quotes, snapshotDays, snapshots])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.history.title}
        description={t.history.description}
      />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {HISTORY_RANGES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium',
              range === item
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
            aria-pressed={range === item}
          >
            {item}
          </button>
        ))}
      </div>
      {!loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : assets.length === 0 ? (
        <EmptyState
          title={t.history.emptyTitle}
          description={t.history.emptyDescription}
        />
      ) : (
        <>
          {isOriginal ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                {t.dashboard.nativeHoldings}
              </span>
              <ul className="flex flex-col gap-2">
                {nativeTotals.map((row) => (
                  <li
                    key={row.currency}
                    className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                  >
                    <span className="text-sm font-medium">{row.currency}</span>
                    <span className="tabular-nums text-base font-semibold">
                      {formatAmount(row.amount, row.currency, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <StatCard
              label={t.dashboard.netWorth}
              value={formatAmount(latestPoint?.total ?? 0, baseCurrency, locale)}
              description={`${formatSignedAmount(change.absolute, baseCurrency, locale)} ${rangeLabel}`}
            />
          )}
          {breakdown && (
            <ul className="flex flex-col gap-1 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {t.dashboard.amountChange}
                </span>
                <span className="tabular-nums">
                  {formatSignedAmount(
                    breakdown.amountChange,
                    baseCurrency,
                    locale,
                  )}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {t.dashboard.rateChange}
                </span>
                <span className="tabular-nums">
                  {formatSignedAmount(
                    breakdown.rateChange,
                    baseCurrency,
                    locale,
                  )}
                </span>
              </li>
            </ul>
          )}
          {isOriginal ? (
            <p className="text-sm text-muted-foreground">
              {t.dashboard.originalChartHint}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {t.dashboard.zoomRange}: {range}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium',
                      canZoomIn
                        ? 'bg-muted text-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                    disabled={!canZoomIn}
                    onClick={() => {
                      if (canZoomIn)
                        setRange((current) => stepHistoryRange(current, 'in'))
                    }}
                  >
                    {t.dashboard.zoomIn}
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium',
                      canZoomOut
                        ? 'bg-muted text-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                    disabled={!canZoomOut}
                    onClick={() => {
                      if (canZoomOut)
                        setRange((current) => stepHistoryRange(current, 'out'))
                    }}
                  >
                    {t.dashboard.zoomOut}
                  </button>
                </div>
              </div>
              <NetWorthChart
                points={series}
                currency={baseCurrency}
                onZoomIn={() =>
                  setRange((current) => stepHistoryRange(current, 'in'))
                }
                onZoomOut={() =>
                  setRange((current) => stepHistoryRange(current, 'out'))
                }
              />
            </>
          )}
          <ul className="flex flex-col gap-2">
            {(isOriginal ? originalList : convertedList).map((row) => {
              const open = openDates.has(row.date)
              return (
                <li
                  key={row.date}
                  className="rounded-xl bg-card ring-1 ring-foreground/10"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    aria-expanded={open}
                    aria-label={t.history.holdingsOn(row.date)}
                    onClick={() =>
                      setOpenDates((current) => {
                        const next = new Set(current)
                        if (next.has(row.date)) next.delete(row.date)
                        else next.add(row.date)
                        return next
                      })
                    }
                  >
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      {row.date}
                      <ChevronDown
                        className={cn(
                          'size-4 transition-transform',
                          open && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </span>
                    <span className="text-right">
                      {isOriginal && 'totals' in row ? (
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
                            {formatAmount(
                              'total' in row ? row.total : 0,
                              baseCurrency,
                              locale,
                            )}
                          </span>
                          {'delta' in row && row.delta !== null && (
                            <span className="text-xs text-muted-foreground">
                              {formatSignedAmount(
                                row.delta,
                                baseCurrency,
                                locale,
                              )}
                            </span>
                          )}
                        </>
                      )}
                    </span>
                  </button>
                  {open && row.holdings.length > 0 && (
                    <div className="border-t border-border px-4 py-3">
                      <HoldingBreakdownList
                        holdings={row.holdings}
                        baseCurrency={baseCurrency}
                        nativeOnly={isOriginal}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
