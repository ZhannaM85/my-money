import { useEffect, useMemo, useState } from 'react'
import { useSharedChartRange } from '@/features/charts'
import { useLocale, useTranslation } from '@/i18n'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDashboardNetWorth } from './useDashboardNetWorth'

export type DashboardRatesStatus =
  'idle' | 'loading' | 'updated' | 'offline' | 'error'

export function useDashboardScreen() {
  const t = useTranslation()
  const locale = useLocale()
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
  const [ratesStatus, setRatesStatus] = useState<DashboardRatesStatus>('idle')
  const comparisonDates = useComparisonStore((state) => state.dates)
  const addComparisonDate = useComparisonStore((state) => state.addDate)

  const today = todayIsoDate()
  const isOriginal = currencyDisplayMode === 'native'
  const activeCurrencyFilter = isOriginal ? currencyFilter : 'all'

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const earliest = useMemo(() => {
    if (snapshots.length === 0) return todayIsoDate()
    return snapshots.reduce(
      (min, snapshot) => (snapshot.date < min ? snapshot.date : min),
      snapshots[0].date,
    )
  }, [snapshots])

  const clearAsOfSelection = () => {
    setSelectedChartDate(null)
    setAsOfError(undefined)
  }

  const chartRange = useSharedChartRange(earliest, today, clearAsOfSelection)
  const availableCurrencies = useMemo(
    () => [...new Set(snapshots.map((snapshot) => snapshot.currency))].sort(),
    [snapshots],
  )
  const worth = useDashboardNetWorth({
    assets,
    snapshots,
    quotes,
    baseCurrency,
    currencyDisplayMode,
    isOriginal,
    activeCurrencyFilter,
    start: chartRange.start,
    chartEnd: chartRange.chartEnd,
    today,
    earliest,
    selectedChartDate,
    locale,
    range: chartRange.range,
    thisMonthLabel: t.dashboard.thisMonth,
    overRangeLabel: t.history.overRange(chartRange.range),
    fxMissing: t.dashboard.fxMissing,
  })

  const onAsOfDateChange = (next: string) => {
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
  }

  const onJumpToToday = () => {
    setAsOfError(undefined)
    setSelectedChartDate(null)
  }

  const onAddToComparison = () => {
    addComparisonDate(selectedChartDate ?? today)
  }

  const onCurrencyFilterChange = (value: string) => {
    setSelectedChartDate(null)
    setCurrencyFilter(value)
  }

  const toggleNativeCurrency = (currency: string) => {
    setOpenNativeCurrency((current) => (current === currency ? null : currency))
  }

  const togglePeriod = (key: 'amount' | 'rate') => {
    setPeriodOpen((current) => (current === key ? null : key))
  }

  const onSelectChartDate = (date: string | null) => {
    setAsOfError(undefined)
    setSelectedChartDate(date)
  }

  const toggleHoldings = () => {
    setHoldingsOpen((open) => !open)
  }

  const refreshRates = () => {
    void (async () => {
      setRatesStatus('loading')
      const online = typeof navigator === 'undefined' ? true : navigator.onLine
      await ensureRange(
        chartRange.start,
        chartRange.chartEnd,
        baseCurrency,
        worth.fxSymbols,
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
  }

  const loaded = assetsLoaded && settingsLoaded
  const showNativeAll = isOriginal && activeCurrencyFilter === 'all'

  return {
    loaded,
    assets,
    today,
    earliest,
    isOriginal,
    activeCurrencyFilter,
    baseCurrency,
    availableCurrencies,
    nativeTotals: worth.nativeTotals,
    convertedHoldings: worth.convertedHoldings,
    openNativeCurrency,
    displayHeadlineTotal: worth.displayHeadlineTotal,
    selectedChartPoint: worth.selectedChartPoint,
    changeLabel: worth.changeLabel,
    fxNote: worth.fxNote,
    showAsOfBar: worth.showAsOfBar,
    showNativeAll,
    selectedChartDate,
    asOfError,
    comparisonDates,
    convertedBreakdown: worth.convertedBreakdown,
    periodOpen,
    fxLoading,
    ratesStatus,
    lastFetchedAt,
    chartRange,
    asOfHasData: worth.asOfHasData,
    series: worth.series,
    convertedHoldingsToday: worth.convertedHoldingsToday,
    holdingsOpen,
    onAsOfDateChange,
    onJumpToToday,
    onAddToComparison,
    onCurrencyFilterChange,
    toggleNativeCurrency,
    togglePeriod,
    refreshRates,
    onSelectChartDate,
    toggleHoldings,
  }
}
