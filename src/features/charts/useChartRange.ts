import { useState } from 'react'
import { useTranslation } from '@/i18n'
import {
  canPanHistoryEarlier,
  canPanHistoryLater,
  canZoomHistoryIn,
  canZoomHistoryOut,
  rangeStartIso,
  resolveDashboardChartEnd,
  shiftHistoryRangeEnd,
  stepHistoryRange,
  type HistoryRange,
} from '@/shared/lib/dates'
import { useChartRangeStore } from '@/stores/chartRangeStore'
import { chartRangeToolbarLabel } from './chartRangeLabel'

export type ChartRangeController = {
  range: HistoryRange
  customStart: string
  customEnd: string
  chartEnd: string
  start: string
  canZoomIn: boolean
  canZoomOut: boolean
  canPanEarlier: boolean
  canPanLater: boolean
  rangeLabel: string
  selectRange: (next: HistoryRange) => void
  applyZoom: (direction: 'in' | 'out') => void
  zoomIn: () => void
  zoomOut: () => void
  panEarlier: () => void
  panLater: () => void
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
}

type ChartRangeSlice = {
  range: HistoryRange
  rangeEnd: string
  rangeEndPinned: boolean
  customStart: string
  customEnd: string
  setRange: (range: HistoryRange) => void
  setRangeEnd: (rangeEnd: string) => void
  setRangeEndPinned: (rangeEndPinned: boolean) => void
  setCustomStart: (customStart: string) => void
  setCustomEnd: (customEnd: string) => void
}

function useChartRangeController(
  slice: ChartRangeSlice,
  earliest: string,
  today: string,
  onWindowChange?: () => void,
): ChartRangeController {
  const t = useTranslation()
  const chartEnd = resolveDashboardChartEnd(
    slice.range,
    slice.rangeEnd,
    today,
    slice.customEnd,
    slice.rangeEndPinned,
  )
  const start = rangeStartIso(
    slice.range,
    chartEnd,
    earliest,
    slice.customStart,
  )
  const canZoomIn = canZoomHistoryIn(slice.range)
  const canZoomOut = canZoomHistoryOut(slice.range)
  const canPanEarlier = canPanHistoryEarlier(chartEnd, slice.range, earliest)
  const canPanLater = canPanHistoryLater(chartEnd, slice.range, today)

  const selectRange = (next: HistoryRange) => {
    onWindowChange?.()
    if (next === 'Custom' && slice.range !== 'Custom') {
      slice.setCustomStart(start)
      slice.setCustomEnd(chartEnd)
    }
    slice.setRange(next)
    if (next === 'All' || next === 'Custom') {
      slice.setRangeEnd(today)
      slice.setRangeEndPinned(false)
    }
  }

  const applyZoom = (direction: 'in' | 'out') => {
    onWindowChange?.()
    const next = stepHistoryRange(slice.range, direction)
    slice.setRange(next)
    if (next === 'All') {
      slice.setRangeEnd(today)
      slice.setRangeEndPinned(false)
    }
  }

  const panEarlier = () => {
    if (!canPanEarlier) return
    onWindowChange?.()
    slice.setRangeEndPinned(true)
    slice.setRangeEnd(
      shiftHistoryRangeEnd(chartEnd, slice.range, 'earlier', today, earliest),
    )
  }

  const panLater = () => {
    if (!canPanLater) return
    onWindowChange?.()
    const next = shiftHistoryRangeEnd(
      chartEnd,
      slice.range,
      'later',
      today,
      earliest,
    )
    slice.setRangeEnd(next)
    if (next === today) slice.setRangeEndPinned(false)
    else slice.setRangeEndPinned(true)
  }

  const onCustomStartChange = (value: string) => {
    onWindowChange?.()
    slice.setCustomStart(value > slice.customEnd ? slice.customEnd : value)
  }

  const onCustomEndChange = (value: string) => {
    onWindowChange?.()
    slice.setCustomEnd(value < slice.customStart ? slice.customStart : value)
  }

  return {
    range: slice.range,
    customStart: slice.customStart,
    customEnd: slice.customEnd,
    chartEnd,
    start,
    canZoomIn,
    canZoomOut,
    canPanEarlier,
    canPanLater,
    rangeLabel: chartRangeToolbarLabel(slice.range, t),
    selectRange,
    applyZoom,
    zoomIn: () => applyZoom('in'),
    zoomOut: () => applyZoom('out'),
    panEarlier,
    panLater,
    onCustomStartChange,
    onCustomEndChange,
  }
}

/** Persisted range shared by Dashboard and History (#185, #239). */
export function useSharedChartRange(
  earliest: string,
  today: string,
  onWindowChange?: () => void,
): ChartRangeController {
  const slice: ChartRangeSlice = {
    range: useChartRangeStore((state) => state.range),
    rangeEnd: useChartRangeStore((state) => state.rangeEnd),
    rangeEndPinned: useChartRangeStore((state) => state.rangeEndPinned),
    customStart: useChartRangeStore((state) => state.customStart),
    customEnd: useChartRangeStore((state) => state.customEnd),
    setRange: useChartRangeStore((state) => state.setRange),
    setRangeEnd: useChartRangeStore((state) => state.setRangeEnd),
    setRangeEndPinned: useChartRangeStore((state) => state.setRangeEndPinned),
    setCustomStart: useChartRangeStore((state) => state.setCustomStart),
    setCustomEnd: useChartRangeStore((state) => state.setCustomEnd),
  }
  return useChartRangeController(slice, earliest, today, onWindowChange)
}

/** In-memory range for asset details — does not touch the shared store (#239). */
export function useLocalChartRange(
  earliest: string,
  today: string,
  defaultRange: HistoryRange = 'All',
): ChartRangeController {
  const [range, setRange] = useState<HistoryRange>(defaultRange)
  const [rangeEnd, setRangeEnd] = useState(today)
  const [rangeEndPinned, setRangeEndPinned] = useState(false)
  const [customStart, setCustomStart] = useState(today)
  const [customEnd, setCustomEnd] = useState(today)
  return useChartRangeController(
    {
      range,
      rangeEnd,
      rangeEndPinned,
      customStart,
      customEnd,
      setRange,
      setRangeEnd,
      setRangeEndPinned,
      setCustomStart,
      setCustomEnd,
    },
    earliest,
    today,
  )
}
