import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react'
import {
  decomposeConvertedPeriodChange,
  historicalNativeNetWorth,
  historicalNetWorth,
  holdingsWithConversion,
  nativeTotalsByCurrency,
  netWorth,
  periodChange,
} from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import { fxDebug, getFxRuntimeContext } from '@/infrastructure/fx/fxDebug'
import {
  formatAmount,
  formatDateTime,
  formatPercent,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import {
  canPanHistoryEarlier,
  canPanHistoryLater,
  canZoomHistoryIn,
  canZoomHistoryOut,
  isoDatesInclusive,
  rangeStartIso,
  shiftHistoryRangeEnd,
  stepHistoryRange,
  type HistoryRange,
} from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { EmptyState } from '@/shared/ui/empty-state'
import { InfoHint } from '@/shared/ui/info-hint'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { cn } from '@/shared/lib/utils'
import { useAssetStore } from '@/stores/assetStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { useChartRangeStore } from '@/stores/chartRangeStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { NetWorthChart } from './NetWorthChart'
import { ChartRangePicker } from './ChartRangePicker'
import {
  ChartRangeToolbar,
  CHART_ZOOM_PILL_CLASS,
} from './ChartRangeToolbar'
import { dashboardNeedsRemoteFx } from './dashboardFx'
import { asOfHasLoggedData } from './asOfHasLoggedData'
import { holdingsForSelectedChartDay } from './holdingsForSelectedChartDay'
import { PositionsHoldingRow } from './PositionsHoldingRow'

export function DashboardScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const assetsLoaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const currencyDisplayMode = useSettingsStore(
    (state) => state.settings.currencyDisplayMode,
  )
  const quotes = useFxStore((state) => state.quotes)
  const ensureRange = useFxStore((state) => state.ensureRange)
  const markRatesFetched = useFxStore((state) => state.markRatesFetched)
  const lastFetchedAt = useFxStore((state) => state.lastFetchedAt)
  const fxLoading = useFxStore((state) => state.loading)
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  const [holdingsOpen, setHoldingsOpen] = useState(false)
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(
    null,
  )
  const [asOfError, setAsOfError] = useState<string | undefined>()
  const [openNativeCurrency, setOpenNativeCurrency] = useState<string | null>(
    null,
  )
  const [periodOpen, setPeriodOpen] = useState<'amount' | 'rate' | null>(null)
  const [ratesStatus, setRatesStatus] = useState<
    'idle' | 'loading' | 'updated' | 'offline' | 'error'
  >('idle')
  const comparisonDates = useComparisonStore((state) => state.dates)
  const addComparisonDate = useComparisonStore((state) => state.addDate)
  const range = useChartRangeStore((state) => state.range)
  const rangeEnd = useChartRangeStore((state) => state.rangeEnd)
  const customStart = useChartRangeStore((state) => state.customStart)
  const customEnd = useChartRangeStore((state) => state.customEnd)
  const setRange = useChartRangeStore((state) => state.setRange)
  const setRangeEnd = useChartRangeStore((state) => state.setRangeEnd)
  const setCustomStart = useChartRangeStore((state) => state.setCustomStart)
  const setCustomEnd = useChartRangeStore((state) => state.setCustomEnd)

  const today = todayIsoDate()
  const chartEnd =
    range === 'Custom'
      ? customEnd > today
        ? today
        : customEnd
      : range === 'All'
        ? today
        : rangeEnd > today
          ? today
          : rangeEnd
  const isOriginal = currencyDisplayMode === 'native'
  const activeCurrencyFilter = isOriginal ? currencyFilter : 'all'

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

  const start = rangeStartIso(range, chartEnd, earliest, customStart)
  const dates = useMemo(
    () => isoDatesInclusive(start, chartEnd),
    [start, chartEnd],
  )
  const availableCurrencies = useMemo(
    () => [...new Set(snapshots.map((snapshot) => snapshot.currency))].sort(),
    [snapshots],
  )
  const filteredAssets = useMemo(() => {
    if (activeCurrencyFilter === 'all') return assets
    return assets.filter((asset) => asset.currency === activeCurrencyFilter)
  }, [assets, activeCurrencyFilter])
  const filteredAssetIds = useMemo(
    () => new Set(filteredAssets.map((asset) => asset.id)),
    [filteredAssets],
  )
  const filteredSnapshots = useMemo(() => {
    if (activeCurrencyFilter === 'all') return snapshots
    return snapshots.filter((snapshot) => filteredAssetIds.has(snapshot.assetId))
  }, [activeCurrencyFilter, filteredAssetIds, snapshots])

  useEffect(() => {
    if (!dashboardNeedsRemoteFx(isOriginal)) return
    const symbols = [
      ...new Set(filteredSnapshots.map((snapshot) => snapshot.currency)),
    ]
    void ensureRange(start, chartEnd, baseCurrency, symbols)
  }, [
    baseCurrency,
    chartEnd,
    ensureRange,
    filteredSnapshots,
    isOriginal,
    start,
  ])

  const convertedResult = useMemo(
    () => netWorth(filteredAssets, filteredSnapshots, quotes, baseCurrency),
    [baseCurrency, filteredAssets, filteredSnapshots, quotes],
  )
  const convertedHoldings = useMemo(
    () =>
      holdingsWithConversion(
        filteredAssets,
        filteredSnapshots,
        quotes,
        baseCurrency,
      ),
    [baseCurrency, filteredAssets, filteredSnapshots, quotes],
  )
  useEffect(() => {
    if (isOriginal) return
    fxDebug('dashboard converted holdings', {
      baseCurrency,
      displayMode: currencyDisplayMode,
      quoteCount: quotes.length,
      total: convertedResult.total,
      missingRates: convertedResult.missingRates,
      ...getFxRuntimeContext(),
      holdings: convertedHoldings.map((row) => ({
        name: row.name,
        currency: row.currency,
        nativeAmount: row.nativeAmount,
        convertedAmount: row.convertedAmount,
        conversionAvailable: row.conversionAvailable,
      })),
    })
  }, [
    baseCurrency,
    convertedHoldings,
    convertedResult.missingRates,
    convertedResult.total,
    currencyDisplayMode,
    isOriginal,
    quotes.length,
  ])
  const nativeTotals = useMemo(
    () => nativeTotalsByCurrency(filteredAssets, filteredSnapshots),
    [filteredAssets, filteredSnapshots],
  )
  const convertedSeries = useMemo(() => {
    if (isOriginal) return []
    return historicalNetWorth(
      filteredAssets,
      filteredSnapshots,
      quotes,
      dates,
      baseCurrency,
    )
  }, [
    baseCurrency,
    dates,
    filteredAssets,
    filteredSnapshots,
    isOriginal,
    quotes,
  ])
  const nativeSeries = useMemo(() => {
    if (!isOriginal || activeCurrencyFilter === 'all') return []
    return historicalNativeNetWorth(
      filteredAssets,
      filteredSnapshots,
      dates,
      activeCurrencyFilter,
    )
  }, [
    activeCurrencyFilter,
    dates,
    filteredAssets,
    filteredSnapshots,
    isOriginal,
  ])

  const series = isOriginal ? nativeSeries : convertedSeries
  const outsideSelectedPoint = useMemo(() => {
    if (!selectedChartDate) return undefined
    if (series.some((point) => point.date === selectedChartDate)) {
      return undefined
    }
    if (isOriginal && activeCurrencyFilter !== 'all') {
      return historicalNativeNetWorth(
        filteredAssets,
        filteredSnapshots,
        [selectedChartDate],
        activeCurrencyFilter,
      )[0]
    }
    if (!isOriginal) {
      return historicalNetWorth(
        filteredAssets,
        filteredSnapshots,
        quotes,
        [selectedChartDate],
        baseCurrency,
      )[0]
    }
    return undefined
  }, [
    activeCurrencyFilter,
    baseCurrency,
    filteredAssets,
    filteredSnapshots,
    isOriginal,
    quotes,
    selectedChartDate,
    series,
  ])
  const { point: selectedChartPoint, holdings: convertedHoldingsToday } =
    holdingsForSelectedChartDay(
      series,
      selectedChartDate,
      convertedHoldings,
      outsideSelectedPoint,
    )
  const asOfHasData = asOfHasLoggedData(selectedChartDate, earliest)
  const convertedTodayPoint = convertedSeries[convertedSeries.length - 1]
  const convertedTodayTotal =
    convertedTodayPoint?.total ?? convertedResult.total
  const convertedBreakdown = useMemo(() => {
    const startHoldings = convertedSeries[0]?.holdings
    const endHoldings = convertedTodayPoint?.holdings
    if (isOriginal || !startHoldings || !endHoldings) return null
    return decomposeConvertedPeriodChange(startHoldings, endHoldings)
  }, [convertedSeries, convertedTodayPoint, isOriginal])
  const fxSymbols = useMemo(
    () => [...new Set(filteredSnapshots.map((snapshot) => snapshot.currency))],
    [filteredSnapshots],
  )
  const singleNativeTotal =
    isOriginal && activeCurrencyFilter !== 'all'
      ? (nativeTotals.find((row) => row.currency === activeCurrencyFilter)
          ?.amount ?? 0)
      : null
  const displayHeadlineTotal = selectedChartPoint
    ? selectedChartPoint.total
    : isOriginal
      ? (singleNativeTotal ?? 0)
      : convertedTodayTotal
  const changeFrom = series[0]?.total ?? 0
  const changeTo =
    series.length > 0
      ? (series[series.length - 1]?.total ?? 0)
      : isOriginal
        ? (singleNativeTotal ?? 0)
        : convertedResult.total
  const headlineTo =
    !isOriginal && convertedBreakdown
      ? changeFrom + convertedBreakdown.amountChange
      : changeTo
  const change = periodChange(changeFrom, headlineTo)
  const canZoomIn = canZoomHistoryIn(range)
  const canZoomOut = canZoomHistoryOut(range)
  const canPanEarlier = canPanHistoryEarlier(chartEnd, range, earliest)
  const canPanLater = canPanHistoryLater(chartEnd, range, today)

  const selectRange = (next: HistoryRange) => {
    setSelectedChartDate(null)
    setAsOfError(undefined)
    if (next === 'Custom' && range !== 'Custom') {
      setCustomStart(start)
      setCustomEnd(chartEnd)
    }
    setRange(next)
    if (next === 'All' || next === 'Custom') setRangeEnd(today)
  }

  const panEarlier = () => {
    if (!canPanEarlier) return
    setSelectedChartDate(null)
    setAsOfError(undefined)
    setRangeEnd(
      shiftHistoryRangeEnd(rangeEnd, range, 'earlier', today, earliest),
    )
  }
  const panLater = () => {
    if (!canPanLater) return
    setSelectedChartDate(null)
    setAsOfError(undefined)
    setRangeEnd(
      shiftHistoryRangeEnd(rangeEnd, range, 'later', today, earliest),
    )
  }

  const loaded = assetsLoaded && settingsLoaded
  const converted = filteredSnapshots.some(
    (snapshot) => snapshot.currency !== baseCurrency,
  )
  const missingCodes = [
    ...new Set(
      (convertedTodayPoint?.missingRates ?? convertedResult.missingRates).map(
        (row) => row.from,
      ),
    ),
  ]
  const fxNote = isOriginal
    ? undefined
    : missingCodes.length > 0
      ? t.dashboard.fxMissing(missingCodes.join(', '))
      : converted
        ? t.dashboard.fxConverted
        : undefined
  const changeCurrency = isOriginal
    ? activeCurrencyFilter === 'all'
      ? null
      : activeCurrencyFilter
    : baseCurrency
  const changeLabel =
    changeCurrency === null
      ? undefined
      : change.percent === null
        ? `${formatSignedAmount(change.absolute, changeCurrency, locale)} ${range === '1M' ? t.dashboard.thisMonth : t.history.overRange(range)}`
        : `${formatSignedAmount(change.absolute, changeCurrency, locale)} (${formatPercent(change.percent, locale)}) ${range === '1M' ? t.dashboard.thisMonth : t.history.overRange(range)}`
  const showAsOfBar =
    (convertedHoldingsToday.length > 0 || selectedChartDate !== null) &&
    !(isOriginal && activeCurrencyFilter === 'all')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PageHeader
        title={t.dashboard.title}
        description={t.dashboard.description}
      />
      {!loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : assets.length === 0 ? (
        <EmptyState
          title={t.dashboard.emptyTitle}
          description={t.dashboard.emptyDescription}
          action={
            <Button asChild>
              <Link to="/assets/new">{t.common.addAsset}</Link>
            </Button>
          }
        />
      ) : (
        <>
          {showAsOfBar ? (
            <div
              data-testid="dashboard-as-of-bar"
              className="flex shrink-0 flex-col gap-2 bg-background"
            >
              <div className="flex items-end gap-2">
                <DateField
                  label={t.dashboard.asOfDate}
                  value={selectedChartDate ?? today}
                  min={earliest}
                  max={today}
                  onChange={(event) => {
                    const next = event.target.value
                    if (!next || next > today) {
                      setAsOfError(t.dashboard.asOfDateInvalid)
                      return
                    }
                    setAsOfError(undefined)
                    if (next >= today) {
                      setSelectedChartDate(null)
                      return
                    }
                    setSelectedChartDate(next)
                    setHoldingsOpen(true)
                  }}
                  error={asOfError}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xl"
                  className="mb-0 shrink-0"
                  aria-label={t.dashboard.addToComparison}
                  disabled={comparisonDates.includes(selectedChartDate ?? today)}
                  onClick={() => addComparisonDate(selectedChartDate ?? today)}
                >
                  <Plus className="size-5" aria-hidden />
                </Button>
                {selectedChartDate !== null && selectedChartDate < today ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="xl"
                    className="mb-0 shrink-0"
                    onClick={() => {
                      setAsOfError(undefined)
                      setSelectedChartDate(null)
                    }}
                  >
                    {t.dashboard.jumpToToday}
                  </Button>
                ) : null}
              </div>
              {comparisonDates.length >= 2 ? (
                <Link
                  to="/compare"
                  className="flex items-center justify-center rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground"
                >
                  {t.dashboard.navigateToComparison}
                </Link>
              ) : null}
            </div>
          ) : null}
          <div
            data-testid="dashboard-scroll"
            className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-y-contain touch-pan-y"
          >
          <div className="flex flex-col gap-1.5">
            <label
              className="flex flex-col gap-1.5"
              htmlFor="dashboard-currency-filter"
            >
              <span className="text-sm font-medium">{t.asset.currency}</span>
              <select
                id="dashboard-currency-filter"
                className={cn(
                  'h-12 rounded-lg border border-input bg-background px-2.5 text-base',
                  !isOriginal && 'text-muted-foreground opacity-60',
                )}
                value={isOriginal ? activeCurrencyFilter : baseCurrency}
                disabled={!isOriginal}
                onChange={(event) => {
                  setSelectedChartDate(null)
                  setCurrencyFilter(event.target.value)
                }}
              >
                {isOriginal && (
                  <option value="all">{t.assets.filterAll}</option>
                )}
                {(isOriginal
                  ? availableCurrencies
                  : [baseCurrency]
                ).map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
            {!isOriginal && (
              <span className="text-xs text-muted-foreground">
                {t.dashboard.currencyFilterDisabledHint}
              </span>
            )}
          </div>
          {isOriginal && activeCurrencyFilter === 'all' ? (
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
                        onClick={() =>
                          setOpenNativeCurrency((current) =>
                            current === row.currency ? null : row.currency,
                          )
                        }
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
          {convertedBreakdown && (
            <div className="flex flex-col gap-2">
              <InfoHint
                hint={t.dashboard.periodChangeHint}
                label={t.common.aboutField(t.dashboard.thisMonth)}
              >
                <ul className="flex flex-col gap-1 text-sm">
                  <li>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 text-left"
                      aria-expanded={periodOpen === 'amount'}
                      onClick={() =>
                        setPeriodOpen((current) =>
                          current === 'amount' ? null : 'amount',
                        )
                      }
                    >
                      <span className="text-muted-foreground">
                        {t.dashboard.amountChange}
                      </span>
                      <span className="flex items-center gap-1 tabular-nums">
                        {formatSignedAmount(
                          convertedBreakdown.amountChange,
                          baseCurrency,
                          locale,
                        )}
                        <ChevronDown
                          className={cn(
                            'size-4 text-muted-foreground transition-transform',
                            periodOpen === 'amount' && 'rotate-180',
                          )}
                          aria-hidden
                        />
                      </span>
                    </button>
                    {periodOpen === 'amount' &&
                      convertedBreakdown.holdings
                        .filter((row) => row.amountChange !== 0)
                        .map((row) => (
                          <div
                            key={`amount-${row.assetId}`}
                            className="flex justify-between gap-3 pt-1 text-xs"
                          >
                            <span className="truncate text-muted-foreground">
                              {row.name}
                            </span>
                            <span className="tabular-nums">
                              {formatSignedAmount(
                                row.amountChange,
                                baseCurrency,
                                locale,
                              )}
                            </span>
                          </div>
                        ))}
                  </li>
                  <li>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 text-left"
                      aria-expanded={periodOpen === 'rate'}
                      onClick={() =>
                        setPeriodOpen((current) =>
                          current === 'rate' ? null : 'rate',
                        )
                      }
                    >
                      <span className="text-muted-foreground">
                        {t.dashboard.rateChange}
                      </span>
                      <span className="flex items-center gap-1 tabular-nums">
                        {formatSignedAmount(
                          convertedBreakdown.rateChange,
                          baseCurrency,
                          locale,
                        )}
                        <ChevronDown
                          className={cn(
                            'size-4 text-muted-foreground transition-transform',
                            periodOpen === 'rate' && 'rotate-180',
                          )}
                          aria-hidden
                        />
                      </span>
                    </button>
                    {periodOpen === 'rate' &&
                      convertedBreakdown.holdings
                        .filter((row) => row.rateChange !== 0)
                        .map((row) => (
                          <div
                            key={`rate-${row.assetId}`}
                            className="flex justify-between gap-3 pt-1 text-xs"
                          >
                            <span className="truncate text-muted-foreground">
                              {row.name}
                            </span>
                            <span className="tabular-nums">
                              {formatSignedAmount(
                                row.rateChange,
                                baseCurrency,
                                locale,
                              )}
                            </span>
                          </div>
                        ))}
                  </li>
                </ul>
              </InfoHint>
              <Button
                type="button"
                variant="outline"
                size="xl"
                className="w-full gap-2"
                disabled={fxLoading || ratesStatus === 'loading'}
                aria-busy={ratesStatus === 'loading'}
                onClick={() => {
                  void (async () => {
                    setRatesStatus('loading')
                    const online =
                      typeof navigator === 'undefined' ? true : navigator.onLine
                    await ensureRange(
                      start,
                      chartEnd,
                      baseCurrency,
                      fxSymbols,
                      { force: true },
                    )
                    if (!online) {
                      setRatesStatus('offline')
                      return
                    }
                    if (useFxStore.getState().error) {
                      setRatesStatus('error')
                      return
                    }
                    markRatesFetched()
                    setRatesStatus('updated')
                  })()
                }}
              >
                {ratesStatus === 'loading' && (
                  <RefreshCw className="size-4 animate-spin" aria-hidden />
                )}
                {t.dashboard.updateRates}
              </Button>
              {ratesStatus === 'offline' ? (
                <p role="status" className="text-xs text-muted-foreground">
                  {t.dashboard.ratesUpdateOffline}
                </p>
              ) : ratesStatus === 'error' ? (
                <p role="status" className="text-xs text-muted-foreground">
                  {t.dashboard.ratesUpdateFailed}
                </p>
              ) : lastFetchedAt ? (
                <p
                  role="status"
                  className="flex justify-between gap-3 text-xs text-muted-foreground"
                >
                  <span>{t.dashboard.ratesUpdated}</span>
                  <time dateTime={lastFetchedAt}>
                    {formatDateTime(lastFetchedAt, locale)}
                  </time>
                </p>
              ) : ratesStatus === 'updated' ? (
                <p role="status" className="text-xs text-muted-foreground">
                  {t.dashboard.ratesUpdated}
                </p>
              ) : null}
            </div>
          )}
          {isOriginal && activeCurrencyFilter === 'all' ? (
            <p className="text-sm text-muted-foreground">
              {t.dashboard.originalChartHint}
            </p>
          ) : (
            <>
              <ChartRangePicker
                range={range}
                onRangeChange={selectRange}
                customStart={customStart}
                customEnd={customEnd}
                onCustomStartChange={(value) => {
                  setSelectedChartDate(null)
                  setAsOfError(undefined)
                  setCustomStart(value > customEnd ? customEnd : value)
                }}
                onCustomEndChange={(value) => {
                  setSelectedChartDate(null)
                  setAsOfError(undefined)
                  setCustomEnd(value < customStart ? customStart : value)
                }}
                earliest={earliest}
                latest={today}
              />
              {asOfHasData ? (
                <>
                  <NetWorthChart
                    points={series}
                    currency={
                      isOriginal ? activeCurrencyFilter : baseCurrency
                    }
                    onZoomIn={() => {
                      setSelectedChartDate(null)
                      setAsOfError(undefined)
                      const next = stepHistoryRange(range, 'in')
                      setRange(next)
                      if (next === 'All') setRangeEnd(today)
                    }}
                    onZoomOut={() => {
                      setSelectedChartDate(null)
                      setAsOfError(undefined)
                      const next = stepHistoryRange(range, 'out')
                      setRange(next)
                      if (next === 'All') setRangeEnd(today)
                    }}
                    onPanEarlier={panEarlier}
                    onPanLater={panLater}
                    onSelectDate={(date) => {
                      setAsOfError(undefined)
                      setSelectedChartDate(date)
                      if (date) setHoldingsOpen(true)
                    }}
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
                        'inline-flex size-9 items-center justify-center rounded-full',
                        canPanEarlier
                          ? 'bg-muted text-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                      disabled={!canPanEarlier}
                      aria-label={t.dashboard.panEarlier}
                      onClick={panEarlier}
                    >
                      <ChevronLeft className="size-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={cn(
                        'inline-flex size-9 items-center justify-center rounded-full',
                        canPanLater
                          ? 'bg-muted text-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                      disabled={!canPanLater}
                      aria-label={t.dashboard.panLater}
                      onClick={panLater}
                    >
                      <ChevronRight className="size-5" aria-hidden />
                    </button>
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
                        if (!canZoomIn) return
                        setSelectedChartDate(null)
                        setAsOfError(undefined)
                        const next = stepHistoryRange(range, 'in')
                        setRange(next)
                        if (next === 'All') setRangeEnd(today)
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
                        if (!canZoomOut) return
                        setSelectedChartDate(null)
                        setAsOfError(undefined)
                        const next = stepHistoryRange(range, 'out')
                        setRange(next)
                        if (next === 'All') setRangeEnd(today)
                      }}
                    >
                      {t.dashboard.zoomOut}
                    </button>
                  </ChartRangeToolbar>
                </>
              ) : (
                <EmptyState
                  title={t.dashboard.noHoldingsOnDateTitle}
                  description={t.dashboard.noHoldingsOnDateDescription}
                />
              )}
            </>
          )}
          {convertedHoldingsToday.length > 0 &&
            !(isOriginal && activeCurrencyFilter === 'all') && (
            <div className="flex flex-col gap-2" data-testid="dashboard-positions">
              <button
                type="button"
                className="flex items-center justify-between gap-2 text-left"
                aria-expanded={holdingsOpen}
                aria-label={
                  selectedChartPoint
                    ? t.history.holdingsOn(selectedChartPoint.date)
                    : t.dashboard.holdings
                }
                onClick={() => setHoldingsOpen((open) => !open)}
              >
                <span className="text-sm text-muted-foreground">
                  {selectedChartPoint
                    ? t.history.holdingsOn(selectedChartPoint.date)
                    : t.dashboard.holdings}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground" aria-hidden>
                  {convertedHoldingsToday.length}
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
                  {convertedHoldingsToday.map((row) => (
                    <li key={row.assetId}>
                      <PositionsHoldingRow
                        row={row}
                        isOriginal={isOriginal}
                        baseCurrency={baseCurrency}
                        asOfDate={selectedChartDate ?? today}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <Button asChild variant="outline">
            <Link to="/allocation">{t.dashboard.allocation}</Link>
          </Button>
          </div>
        </>
      )}
    </div>
  )
}
