import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslation } from '@/i18n'
import { todayIsoDate } from '@/shared/lib/money'
import {
  canPanHistoryEarlier,
  canPanHistoryLater,
  canZoomHistoryIn,
  canZoomHistoryOut,
  rangeStartIso,
  shiftHistoryRangeEnd,
  stepHistoryRange,
  type HistoryRange,
} from '@/shared/lib/dates'
import { useAssetStore } from '@/stores/assetStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { useChartRangeStore } from '@/stores/chartRangeStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDashboardNetWorth } from './useDashboardNetWorth'

export type DashboardRatesStatus =
  'idle' | 'loading' | 'updated' | 'offline' | 'error'

export function useDashboardScreen() {
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
  const [ratesStatus, setRatesStatus] = useState<DashboardRatesStatus>('idle')
  const comparisonDates = useComparisonStore((state) => state.dates)
  const addComparisonDate = useComparisonStore((state) => state.addDate)
  const range = useChartRangeStore((state) => state.range)
  const rangeEnd = useChartRangeStore((state) => state.rangeEnd)
  const rangeEndPinned = useChartRangeStore((state) => state.rangeEndPinned)
  const customStart = useChartRangeStore((state) => state.customStart)
  const customEnd = useChartRangeStore((state) => state.customEnd)
  const setRange = useChartRangeStore((state) => state.setRange)
  const setRangeEnd = useChartRangeStore((state) => state.setRangeEnd)
  const setRangeEndPinned = useChartRangeStore(
    (state) => state.setRangeEndPinned,
  )
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
        : rangeEndPinned
          ? rangeEnd > today
            ? today
            : rangeEnd
          : today
  const isOriginal = currencyDisplayMode === 'native'
  const activeCurrencyFilter = isOriginal ? currencyFilter : 'all'

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  const earliest = useMemo(() => {
    if (snapshots.length === 0) return todayIsoDate()
    return snapshots.reduce(
      (min, snapshot) => (snapshot.date < min ? snapshot.date : min),
      snapshots[0].date,
    )
  }, [snapshots])

  const start = rangeStartIso(range, chartEnd, earliest, customStart)
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
    start,
    chartEnd,
    today,
    earliest,
    selectedChartDate,
    locale,
    range,
    thisMonthLabel: t.dashboard.thisMonth,
    overRangeLabel: t.history.overRange(range),
    fxMissing: t.dashboard.fxMissing,
  })

  const canZoomIn = canZoomHistoryIn(range)
  const canZoomOut = canZoomHistoryOut(range)
  const canPanEarlier = canPanHistoryEarlier(chartEnd, range, earliest)
  const canPanLater = canPanHistoryLater(chartEnd, range, today)

  const clearAsOfSelection = () => {
    setSelectedChartDate(null)
    setAsOfError(undefined)
  }

  const selectRange = (next: HistoryRange) => {
    clearAsOfSelection()
    if (next === 'Custom' && range !== 'Custom') {
      setCustomStart(start)
      setCustomEnd(chartEnd)
    }
    setRange(next)
    if (next === 'All' || next === 'Custom') {
      setRangeEnd(today)
      setRangeEndPinned(false)
    }
  }

  const applyZoom = (direction: 'in' | 'out') => {
    clearAsOfSelection()
    const next = stepHistoryRange(range, direction)
    setRange(next)
    if (next === 'All') {
      setRangeEnd(today)
      setRangeEndPinned(false)
    }
  }

  const panEarlier = () => {
    if (!canPanEarlier) return
    clearAsOfSelection()
    setRangeEndPinned(true)
    setRangeEnd(
      shiftHistoryRangeEnd(chartEnd, range, 'earlier', today, earliest),
    )
  }
  const panLater = () => {
    if (!canPanLater) return
    clearAsOfSelection()
    const next = shiftHistoryRangeEnd(chartEnd, range, 'later', today, earliest)
    setRangeEnd(next)
    if (next === today) setRangeEndPinned(false)
    else setRangeEndPinned(true)
  }

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

  const onCustomStartChange = (value: string) => {
    clearAsOfSelection()
    setCustomStart(value > customEnd ? customEnd : value)
  }

  const onCustomEndChange = (value: string) => {
    clearAsOfSelection()
    setCustomEnd(value < customStart ? customStart : value)
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
      await ensureRange(start, chartEnd, baseCurrency, worth.fxSymbols, {
        force: true,
      })
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
  const rangeName =
    range === '1W'
      ? t.history.rangeWeek
      : range === '1M'
        ? t.history.rangeMonth
        : range === '1Y'
          ? t.history.rangeYear
          : range === 'All'
            ? t.history.rangeAll
            : t.history.rangeCustom
  const rangeLabel = `${t.dashboard.zoomRange}: ${rangeName}`

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
    range,
    customStart,
    customEnd,
    asOfHasData: worth.asOfHasData,
    series: worth.series,
    canZoomIn,
    canZoomOut,
    canPanEarlier,
    canPanLater,
    rangeLabel,
    convertedHoldingsToday: worth.convertedHoldingsToday,
    holdingsOpen,
    onAsOfDateChange,
    onJumpToToday,
    onAddToComparison,
    onCurrencyFilterChange,
    toggleNativeCurrency,
    togglePeriod,
    refreshRates,
    selectRange,
    onCustomStartChange,
    onCustomEndChange,
    applyZoom,
    panEarlier,
    panLater,
    onSelectChartDate,
    toggleHoldings,
  }
}
