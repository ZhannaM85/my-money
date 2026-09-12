import { useEffect, useMemo } from 'react'
import type { Asset } from '@/domain/asset'
import type { RateTable } from '@/domain/fx'
import {
  decomposeConvertedPeriodChange,
  historicalNativeNetWorth,
  historicalNetWorth,
  holdingsWithConversion,
  nativeTotalsByCurrency,
  netWorth,
  periodChange,
} from '@/domain/netWorth'
import type { AssetSnapshot } from '@/domain/snapshot'
import type { Locale } from '@/i18n'
import { fxDebug, getFxRuntimeContext } from '@/infrastructure/fx/fxDebug'
import { isoDatesInclusive, type HistoryRange } from '@/shared/lib/dates'
import { formatPercent, formatSignedAmount } from '@/shared/lib/money'
import { useFxStore } from '@/stores/fxStore'
import { asOfHasLoggedData } from './asOfHasLoggedData'
import { dashboardNeedsRemoteFx } from './dashboardFx'
import { holdingsForSelectedChartDay } from './holdingsForSelectedChartDay'

export function useDashboardNetWorth({
  assets,
  snapshots,
  quotes,
  baseCurrency,
  currencyDisplayMode,
  isOriginal,
  activeCurrencyFilter,
  start,
  chartEnd,
  today,
  earliest,
  selectedChartDate,
  locale,
  range,
  thisMonthLabel,
  overRangeLabel,
  fxMissing,
}: {
  assets: readonly Asset[]
  snapshots: readonly AssetSnapshot[]
  quotes: RateTable
  baseCurrency: string
  currencyDisplayMode: string
  isOriginal: boolean
  activeCurrencyFilter: string
  start: string
  chartEnd: string
  today: string
  earliest: string
  selectedChartDate: string | null
  locale: Locale
  range: HistoryRange
  thisMonthLabel: string
  overRangeLabel: string
  fxMissing: (codes: string) => string
}) {
  const ensureRange = useFxStore((state) => state.ensureRange)

  const dates = useMemo(
    () => isoDatesInclusive(start, chartEnd),
    [start, chartEnd],
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
    return snapshots.filter((snapshot) =>
      filteredAssetIds.has(snapshot.assetId),
    )
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
  const todayConvertedPoint = useMemo(() => {
    if (isOriginal) return undefined
    return historicalNetWorth(
      filteredAssets,
      filteredSnapshots,
      quotes,
      [today],
      baseCurrency,
    )[0]
  }, [
    baseCurrency,
    filteredAssets,
    filteredSnapshots,
    isOriginal,
    quotes,
    today,
  ])
  /** Today’s book at today’s rate — not a pinned chart-end point (#208, #225). */
  const convertedTodayTotal =
    todayConvertedPoint?.total ?? convertedResult.total
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
  const missingCodes = [
    ...new Set(
      (convertedTodayPoint?.missingRates ?? convertedResult.missingRates).map(
        (row) => row.from,
      ),
    ),
  ]
  const fxNote =
    !isOriginal && missingCodes.length > 0
      ? fxMissing(missingCodes.join(', '))
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
        ? `${formatSignedAmount(change.absolute, changeCurrency, locale)} ${range === '1M' ? thisMonthLabel : overRangeLabel}`
        : `${formatSignedAmount(change.absolute, changeCurrency, locale)} (${formatPercent(change.percent, locale)}) ${range === '1M' ? thisMonthLabel : overRangeLabel}`
  const showAsOfBar =
    (convertedHoldingsToday.length > 0 || selectedChartDate !== null) &&
    !(isOriginal && activeCurrencyFilter === 'all')

  return {
    convertedHoldings,
    nativeTotals,
    series,
    selectedChartPoint,
    convertedHoldingsToday,
    asOfHasData,
    convertedBreakdown,
    fxSymbols,
    displayHeadlineTotal,
    fxNote,
    changeLabel,
    showAsOfBar,
  }
}
