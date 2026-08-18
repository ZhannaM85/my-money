import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  historicalNativeNetWorth,
  historicalNetWorth,
  holdingsWithConversion,
  nativeTotalsByCurrency,
  netWorth,
  periodChange,
} from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import {
  formatAmount,
  formatPercent,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { isoDatesInclusive, rangeStartIso, type HistoryRange } from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { cn } from '@/shared/lib/utils'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { NetWorthChart } from './NetWorthChart'

const RANGES: HistoryRange[] = ['1M', '3M', '6M', '1Y', 'All']

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
  const [range, setRange] = useState<HistoryRange>('1M')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')

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
    if (isOriginal) return
    const symbols = [
      ...new Set(filteredSnapshots.map((snapshot) => snapshot.currency)),
    ]
    void ensureRange(start, today, baseCurrency, symbols)
  }, [
    baseCurrency,
    ensureRange,
    filteredSnapshots,
    isOriginal,
    start,
    today,
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
  const singleNativeTotal =
    isOriginal && activeCurrencyFilter !== 'all'
      ? (nativeTotals.find((row) => row.currency === activeCurrencyFilter)
          ?.amount ?? 0)
      : null
  const changeFrom = series[0]?.total ?? 0
  const changeTo = isOriginal
    ? (singleNativeTotal ?? 0)
    : convertedResult.total
  const change = periodChange(changeFrom, changeTo)
  const rangeIndex = RANGES.indexOf(range)
  const canZoomIn = rangeIndex > 0
  const canZoomOut = rangeIndex < RANGES.length - 1

  const classRows = convertedResult.byClass.filter((row) => row.amount !== 0)
  const loaded = assetsLoaded && settingsLoaded
  const converted = filteredSnapshots.some(
    (snapshot) => snapshot.currency !== baseCurrency,
  )
  const missingCodes = [
    ...new Set(convertedResult.missingRates.map((row) => row.from)),
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
                value={activeCurrencyFilter}
                disabled={!isOriginal}
                onChange={(event) => setCurrencyFilter(event.target.value)}
              >
                <option value="all">{t.assets.filterAll}</option>
                {availableCurrencies.map((code) => (
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
                {nativeTotals.map((row) => (
                  <li
                    key={row.currency}
                    className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
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
              value={formatAmount(
                isOriginal
                  ? (singleNativeTotal ?? 0)
                  : convertedResult.total,
                isOriginal ? activeCurrencyFilter : baseCurrency,
                locale,
              )}
              description={changeLabel}
            />
          )}
          {fxNote && <p className="text-sm text-muted-foreground">{fxNote}</p>}
          {!isOriginal && convertedHoldings.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                {t.dashboard.holdings}
              </span>
              <ul className="flex flex-col gap-2">
                {convertedHoldings.map((row) => (
                  <li
                    key={row.assetId}
                    className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {row.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {row.conversionAvailable
                          ? formatAmount(row.nativeAmount, row.currency, locale)
                          : t.dashboard.conversionUnavailable}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      {row.conversionAvailable && row.convertedAmount !== null ? (
                        <span className="block tabular-nums text-sm font-medium">
                          {formatAmount(
                            row.convertedAmount,
                            baseCurrency,
                            locale,
                          )}
                        </span>
                      ) : (
                        <span className="block tabular-nums text-sm">
                          {formatAmount(row.nativeAmount, row.currency, locale)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
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
                      if (canZoomIn) setRange(RANGES[rangeIndex - 1])
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
                      if (canZoomOut) setRange(RANGES[rangeIndex + 1])
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
              />
            </>
          )}
          {!isOriginal && classRows.length > 0 && (
            <ul className="flex flex-col gap-2">
              {classRows.map((row) => (
                <li
                  key={row.assetClass}
                  className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                >
                  <span className="text-sm">
                    {t.asset.classes[row.assetClass]}
                  </span>
                  <span className="tabular-nums text-sm">
                    {formatAmount(row.amount, baseCurrency, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline">
            <Link to="/allocation">{t.dashboard.allocation}</Link>
          </Button>
        </>
      )}
    </div>
  )
}
