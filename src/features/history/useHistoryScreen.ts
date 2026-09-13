import { useEffect, useMemo, useState } from 'react'
import {
  historicalNetWorth,
  holdingsWithConversion,
  nativeTotalsByCurrency,
} from '@/domain/netWorth'
import { useSharedChartRange } from '@/features/charts'
import { useConvertedPeriodReadModel } from '@/features/net-worth'
import { useLocale, useTranslation } from '@/i18n'
import { isRangeClampedToEarliest } from '@/shared/lib/dates'
import { formatChartAxisDate, todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'

export type HistoryDayDetail =
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

export function useHistoryScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const isOriginal =
    useSettingsStore((state) => state.settings.currencyDisplayMode) === 'native'
  const quotes = useFxStore((state) => state.quotes)
  const [openDates, setOpenDates] = useState<ReadonlySet<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null)
  const today = todayIsoDate()

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const earliest = useMemo(() => {
    if (snapshots.length === 0) return today
    return snapshots.reduce(
      (min, snapshot) => (snapshot.date < min ? snapshot.date : min),
      snapshots[0].date,
    )
  }, [snapshots, today])

  const chartRange = useSharedChartRange(earliest, today)
  const { range, start, chartEnd } = chartRange
  const rangeLabel = isRangeClampedToEarliest(range, chartEnd, earliest)
    ? t.history.sinceDate(formatChartAxisDate(start, locale))
    : t.history.overRange(range)
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

  const period = useConvertedPeriodReadModel({
    assets,
    snapshots,
    quotes,
    start,
    chartEnd,
    baseCurrency,
    isOriginal,
  })

  const nativeTotals = useMemo(
    () => nativeTotalsByCurrency(assets, snapshots),
    [assets, snapshots],
  )
  const convertedList = useMemo(() => {
    const byDate = new Map(period.series.map((point) => [point.date, point]))
    const points = snapshotDays
      .map((date) => byDate.get(date))
      .filter(
        (point): point is NonNullable<typeof point> => point !== undefined,
      )
    return [...points].reverse().map((point, index, rows) => {
      const older = rows[index + 1]
      return {
        ...point,
        delta: older ? point.total - older.total : null,
      }
    })
  }, [period.series, snapshotDays])
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
    const visibleRow = convertedList.find(
      (row) => row.date === selectedCalendarDate,
    )
    if (visibleRow) return visibleRow

    const previousDate = allSnapshotDates
      .filter((date) => date < selectedCalendarDate)
      .sort()
      .at(-1)
    const points = historicalNetWorth(
      assets,
      snapshots,
      quotes,
      previousDate
        ? [previousDate, selectedCalendarDate]
        : [selectedCalendarDate],
      baseCurrency,
    )
    const point = points.at(-1)
    if (!point) return null
    const older = previousDate ? points[0] : undefined
    return {
      date: selectedCalendarDate,
      total: point.total,
      delta: older ? point.total - older.total : null,
      holdings: point.holdings,
    }
  }, [
    allSnapshotDates,
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

  const showList = () => {
    setViewMode('list')
    setSelectedCalendarDate(null)
  }

  const showCalendar = () => {
    setViewMode('calendar')
  }

  const selectCalendarDate = (date: string) => {
    setSelectedCalendarDate(date)
    setOpenDates((current) => {
      const next = new Set(current)
      next.add(date)
      return next
    })
  }

  return {
    t,
    locale,
    loaded,
    assets,
    today,
    earliest,
    isOriginal,
    baseCurrency,
    chartRange,
    rangeLabel,
    nativeTotals,
    series: period.series,
    latestPoint: period.endPoint,
    breakdown: period.breakdown,
    change: period.change,
    allSnapshotDates,
    viewMode,
    selectedCalendarDate,
    selectedCalendarDay,
    openDates,
    originalList,
    convertedList,
    showList,
    showCalendar,
    selectCalendarDate,
    toggleOpenDate,
  }
}
