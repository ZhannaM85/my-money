import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
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
import { fxDebug } from '@/infrastructure/fx/fxDebug'
import {
  formatAmount,
  formatPercent,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import {
  HISTORY_RANGES,
  isoDatesInclusive,
  rangeStartIso,
  stepHistoryRange,
  type HistoryRange,
} from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { InfoHint } from '@/shared/ui/info-hint'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { cn } from '@/shared/lib/utils'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { NetWorthChart } from './NetWorthChart'

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
  const fxLoading = useFxStore((state) => state.loading)
  const [range, setRange] = useState<HistoryRange>('1M')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  const [holdingsOpen, setHoldingsOpen] = useState(false)
  const [openNativeCurrency, setOpenNativeCurrency] = useState<string | null>(
    null,
  )
  const [periodOpen, setPeriodOpen] = useState<'amount' | 'rate' | null>(null)

  const today = todayIsoDate()
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

  const start = rangeStartIso(range, today, earliest)
  const dates = useMemo(() => isoDatesInclusive(start, today), [start, today])

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
    const symbols = [
      ...new Set(filteredSnapshots.map((snapshot) => snapshot.currency)),
    ]
    void ensureRange(start, today, baseCurrency, symbols)
  }, [baseCurrency, ensureRange, filteredSnapshots, start, today])

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
  const convertedSeries = useMemo(
    () =>
      historicalNetWorth(
        filteredAssets,
        filteredSnapshots,
        quotes,
        dates,
        baseCurrency,
      ),
    [baseCurrency, dates, filteredAssets, filteredSnapshots, quotes],
  )
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
  const convertedTodayPoint = convertedSeries[convertedSeries.length - 1]
  const convertedTodayTotal =
    convertedTodayPoint?.total ?? convertedResult.total
  const convertedHoldingsToday =
    convertedTodayPoint?.holdings ?? convertedHoldings
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
  const rangeIndex = HISTORY_RANGES.indexOf(range)
  const canZoomIn = rangeIndex > 0
  const canZoomOut = rangeIndex < HISTORY_RANGES.length - 1

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

  return (
    <div className="flex flex-col gap-6">
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
                onChange={(event) => setCurrencyFilter(event.target.value)}
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
                          <div
                            key={holding.assetId}
                            className="flex items-center justify-between gap-3 border-t border-border pt-2"
                          >
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate text-sm">
                                {holding.name}
                              </span>
                              {holding.institution ? (
                                <span className="truncate text-xs text-muted-foreground">
                                  {holding.institution}
                                </span>
                              ) : null}
                            </span>
                            <span className="shrink-0 tabular-nums text-sm">
                              {formatAmount(
                                holding.nativeAmount,
                                holding.currency,
                                locale,
                              )}
                            </span>
                          </div>
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
                isOriginal
                  ? (singleNativeTotal ?? 0)
                  : convertedTodayTotal,
                isOriginal ? activeCurrencyFilter : baseCurrency,
                locale,
              )}
              description={changeLabel}
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
                disabled={fxLoading}
                onClick={() =>
                  void ensureRange(start, today, baseCurrency, fxSymbols)
                }
              >
                {t.dashboard.updateRates}
              </Button>
            </div>
          )}
          {convertedHoldingsToday.length > 0 &&
            !(isOriginal && activeCurrencyFilter === 'all') && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="flex items-center justify-between gap-2 text-left"
                aria-expanded={holdingsOpen}
                aria-label={t.dashboard.holdings}
                onClick={() => setHoldingsOpen((open) => !open)}
              >
                <span className="text-sm text-muted-foreground">
                  {t.dashboard.holdings}
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
              {holdingsOpen && (
                <ul className="flex flex-col gap-2">
                  {convertedHoldingsToday.map((row) => (
                    <li
                      key={row.assetId}
                      className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {row.name}
                        </span>
                        {!isOriginal && (
                          <span className="text-xs text-muted-foreground">
                            {row.conversionAvailable
                              ? formatAmount(
                                  row.nativeAmount,
                                  row.currency,
                                  locale,
                                )
                              : t.dashboard.conversionUnavailable}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-right">
                        {isOriginal ||
                        !row.conversionAvailable ||
                        row.convertedAmount === null ? (
                          <span className="block tabular-nums text-sm">
                            {formatAmount(
                              row.nativeAmount,
                              row.currency,
                              locale,
                            )}
                          </span>
                        ) : (
                          <span className="block tabular-nums text-sm font-medium">
                            {formatAmount(
                              row.convertedAmount,
                              baseCurrency,
                              locale,
                            )}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {isOriginal && activeCurrencyFilter === 'all' ? (
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
                      if (canZoomIn) setRange((current) => stepHistoryRange(current, 'in'))
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
                      if (canZoomOut) setRange((current) => stepHistoryRange(current, 'out'))
                    }}
                  >
                    {t.dashboard.zoomOut}
                  </button>
                </div>
              </div>
              <NetWorthChart
                points={series}
                currency={
                  isOriginal ? activeCurrencyFilter : baseCurrency
                }
                onZoomIn={() =>
                  setRange((current) => stepHistoryRange(current, 'in'))
                }
                onZoomOut={() =>
                  setRange((current) => stepHistoryRange(current, 'out'))
                }
              />
            </>
          )}
          <Button asChild variant="outline">
            <Link to="/allocation">{t.dashboard.allocation}</Link>
          </Button>
        </>
      )}
    </div>
  )
}
