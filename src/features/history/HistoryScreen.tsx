import { useEffect, useMemo, useState } from 'react'
import { decomposeConvertedPeriodChange, historicalNetWorth, holdingsWithConversion, nativeTotalsByCurrency, periodChange } from '@/domain/netWorth'
import { ChartRangePicker } from '@/features/dashboard/ChartRangePicker'
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import {
  ChartRangeToolbar,
  CHART_ZOOM_PILL_CLASS,
} from '@/features/dashboard/ChartRangeToolbar'
import { HistoryCalendar } from './HistoryCalendar'
import { HistoryDayRow } from './HistoryDayRow'
import { useLocale, useTranslation } from '@/i18n'
import {
  canZoomHistoryIn,
  canZoomHistoryOut,
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

type HistoryDayDetail =
  | {
      date: string
      totals: ReturnType<typeof nativeTotalsByCurrency>
      holdings: ReturnType<typeof holdingsWithConversion>
    }
  | {
      date: string
      total: number
      delta: number | null
      holdings: ReturnType<typeof holdingsWithConversion>
    }

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
  const [range, setRange] = useState<HistoryRange>('1M')
  const [customStart, setCustomStart] = useState(todayIsoDate)
  const [customEnd, setCustomEnd] = useState(todayIsoDate)
  const [openDates, setOpenDates] = useState<ReadonlySet<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null)
  const today = todayIsoDate()
  const canZoomIn = canZoomHistoryIn(range)
  const canZoomOut = canZoomHistoryOut(range)

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

  const chartEnd = range === 'Custom' ? customEnd : today
  const start = rangeStartIso(range, chartEnd, earliest, customStart)
  const rangeLabel = isRangeClampedToEarliest(range, chartEnd, earliest)
    ? t.history.sinceDate(formatChartAxisDate(start, locale))
    : t.history.overRange(range)
  const dates = useMemo(
    () => isoDatesInclusive(start, chartEnd),
    [start, chartEnd],
  )
  const snapshotDays = useMemo(() => {
    return [
      ...new Set(
        snapshots
          .map((snapshot) => snapshot.date)
          .filter((date) => date >= start && date <= chartEnd),
      ),
    ].sort()
  }, [snapshots, start, chartEnd])
  const allSnapshotDates = useMemo(
    () => [...new Set(snapshots.map((snapshot) => snapshot.date))],
    [snapshots],
  )

  useEffect(() => {
    const symbols = [...new Set(snapshots.map((snapshot) => snapshot.currency))]
    void ensureRange(start, chartEnd, baseCurrency, symbols)
  }, [baseCurrency, chartEnd, ensureRange, snapshots, start])

  const selectRange = (next: HistoryRange) => {
    if (next === 'Custom' && range !== 'Custom') {
      setCustomStart(start)
      setCustomEnd(chartEnd)
    }
    setRange(next)
  }

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

  const selectedCalendarDay = useMemo((): HistoryDayDetail | null => {
    if (!selectedCalendarDate) return null
    if (isOriginal) {
      const asOf = snapshots.filter(
        (snapshot) => snapshot.date <= selectedCalendarDate,
      )
      return {
        date: selectedCalendarDate,
        totals: nativeTotalsByCurrency(assets, asOf),
        holdings: holdingsWithConversion(assets, asOf, quotes, baseCurrency),
      }
    }
    const point = historicalNetWorth(
      assets,
      snapshots,
      quotes,
      [selectedCalendarDate],
      baseCurrency,
    )[0]
    if (!point) return null
    const older = convertedList.find((row) => row.date > selectedCalendarDate)
    return {
      date: selectedCalendarDate,
      total: point.total,
      delta: older ? point.total - older.total : null,
      holdings: point.holdings,
    }
  }, [
    assets,
    baseCurrency,
    convertedList,
    isOriginal,
    quotes,
    selectedCalendarDate,
    snapshots,
  ])

  const toggleOpenDate = (date: string) => {
    setOpenDates((current) => {
      const next = new Set(current)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.history.title}
        description={t.history.description}
      />
      <ChartRangePicker
        range={range}
        onRangeChange={selectRange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={(value) =>
          setCustomStart(value > customEnd ? customEnd : value)
        }
        onCustomEndChange={(value) =>
          setCustomEnd(value < customStart ? customStart : value)
        }
        earliest={earliest}
        latest={today}
      />
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
              <ChartRangeToolbar
                rangeLabel={`${t.dashboard.zoomRange}: ${
                  range === '1W'
                    ? t.history.rangeWeek
                    : range === '1M'
                      ? t.history.rangeMonth
                      : range === '1Y'
                        ? t.history.rangeYear
                        : range === 'All'
                          ? t.history.rangeAll
                          : t.history.rangeCustom
                }`}
              >
                <button
                  type="button"
                  className={cn(
                    CHART_ZOOM_PILL_CLASS,
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
                    CHART_ZOOM_PILL_CLASS,
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
              </ChartRangeToolbar>
            </>
          )}
          <div
            className="flex gap-2"
            role="group"
            aria-label={t.history.viewModeLabel}
          >
            <button
              type="button"
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium',
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-pressed={viewMode === 'list'}
              onClick={() => {
                setViewMode('list')
                setSelectedCalendarDate(null)
              }}
            >
              {t.history.listViewLabel}
            </button>
            <button
              type="button"
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium',
                viewMode === 'calendar'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-pressed={viewMode === 'calendar'}
              onClick={() => setViewMode('calendar')}
            >
              {t.history.calendarViewLabel}
            </button>
          </div>
          {viewMode === 'calendar' ? (
            <>
              <HistoryCalendar
                snapshotDates={allSnapshotDates}
                selectedDate={selectedCalendarDate}
                onSelectDate={(date) => {
                  setSelectedCalendarDate(date)
                  setOpenDates((current) => {
                    const next = new Set(current)
                    next.add(date)
                    return next
                  })
                }}
              />
              {selectedCalendarDay ? (
                <ul
                  className="flex flex-col gap-2"
                  data-testid="history-calendar-day-detail"
                >
                  <HistoryDayRow
                    row={selectedCalendarDay}
                    open={openDates.has(selectedCalendarDay.date)}
                    baseCurrency={baseCurrency}
                    nativeOnly={isOriginal}
                    label={t.history.holdingsOn(selectedCalendarDay.date)}
                    onToggle={() => toggleOpenDate(selectedCalendarDay.date)}
                  />
                </ul>
              ) : null}
            </>
          ) : (
          <ul className="flex flex-col gap-2">
            {(isOriginal ? originalList : convertedList).map((row) => {
              return (
                <HistoryDayRow
                  key={row.date}
                  row={row}
                  open={openDates.has(row.date)}
                  baseCurrency={baseCurrency}
                  nativeOnly={isOriginal}
                  label={t.history.holdingsOn(row.date)}
                  onToggle={() => toggleOpenDate(row.date)}
                  testId={`history-day-row-${row.date}`}
                />
              )
            })}
          </ul>
          )}
        </>
      )}
    </div>
  )
}
