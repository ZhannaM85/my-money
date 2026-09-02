export function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Chart / History window presets (#126). */
export type HistoryRange = '1W' | '1M' | '1Y' | 'All' | 'Custom'

export const HISTORY_RANGES: HistoryRange[] = [
  '1W',
  '1M',
  '1Y',
  'All',
  'Custom',
]

/** Zoom in/out ladder — Custom is pick-only (#126). */
export const ZOOM_HISTORY_RANGES: Exclude<HistoryRange, 'Custom'>[] = [
  '1W',
  '1M',
  '1Y',
  'All',
]

const RANGE_DAYS: Record<Exclude<HistoryRange, 'All' | 'Custom'>, number> = {
  '1W': 7,
  '1M': 30,
  '1Y': 365,
}

/** Pinch-out / Zoom in → narrower window; pinch-in / Zoom out → wider. */
export function stepHistoryRange(
  current: HistoryRange,
  direction: 'in' | 'out',
): HistoryRange {
  if (current === 'Custom') return current
  const index = ZOOM_HISTORY_RANGES.indexOf(current)
  if (index < 0) return current
  if (direction === 'in') {
    return ZOOM_HISTORY_RANGES[Math.max(0, index - 1)]!
  }
  return ZOOM_HISTORY_RANGES[
    Math.min(ZOOM_HISTORY_RANGES.length - 1, index + 1)
  ]!
}

export function rangeStartIso(
  range: HistoryRange,
  end: string,
  earliest?: string,
  customStart?: string,
): string {
  if (range === 'Custom') {
    const start = customStart ?? earliest ?? end
    if (earliest && start < earliest) return earliest
    if (start > end) return end
    return start
  }
  if (range === 'All') return earliest ?? end
  const start = unclampedRangeStartIso(range, end)
  if (earliest && start < earliest) return earliest
  return start
}

/** Range start before clamping to the first snapshot (All/Custom unused). */
export function unclampedRangeStartIso(
  range: HistoryRange,
  end: string,
): string {
  if (range === 'All' || range === 'Custom') return end
  return addDaysIso(end, -RANGE_DAYS[range])
}

export function isRangeClampedToEarliest(
  range: HistoryRange,
  end: string,
  earliest: string,
): boolean {
  if (range === 'All' || range === 'Custom') return false
  return unclampedRangeStartIso(range, end) < earliest
}

export function historyRangeDayCount(range: HistoryRange): number | null {
  if (range === 'All' || range === 'Custom') return null
  return RANGE_DAYS[range]
}

/** One pan gesture shifts by about a quarter of the visible window (#111). */
export function historyPanStepDays(range: HistoryRange): number {
  const days = historyRangeDayCount(range)
  if (days === null) return 0
  return Math.max(1, Math.floor(days / 4))
}

export function shiftHistoryRangeEnd(
  rangeEnd: string,
  range: HistoryRange,
  direction: 'earlier' | 'later',
  today: string,
  earliest: string,
): string {
  if (range === 'All' || range === 'Custom') return today
  const step = historyPanStepDays(range)
  const delta = direction === 'earlier' ? -step : step
  let next = addDaysIso(rangeEnd, delta)
  if (next > today) next = today
  if (next < earliest) next = earliest
  return next
}

export function canPanHistoryEarlier(
  rangeEnd: string,
  range: HistoryRange,
  earliest: string,
): boolean {
  if (range === 'All' || range === 'Custom') return false
  return rangeEnd > earliest
}

export function canPanHistoryLater(
  rangeEnd: string,
  range: HistoryRange,
  today: string,
): boolean {
  if (range === 'All' || range === 'Custom') return false
  return rangeEnd < today
}

export function canZoomHistoryIn(range: HistoryRange): boolean {
  if (range === 'Custom') return false
  return ZOOM_HISTORY_RANGES.indexOf(range) > 0
}

export function canZoomHistoryOut(range: HistoryRange): boolean {
  if (range === 'Custom') return false
  const index = ZOOM_HISTORY_RANGES.indexOf(range)
  return index >= 0 && index < ZOOM_HISTORY_RANGES.length - 1
}

export function monthStartIso(isoDate: string): string {
  return `${isoDate.slice(0, 8)}01`
}

export function addMonthsIso(isoDate: string, delta: number): string {
  const year = Number(isoDate.slice(0, 4))
  const month = Number(isoDate.slice(5, 7)) - 1
  const day = Number(isoDate.slice(8, 10))
  const date = new Date(Date.UTC(year, month + delta, day))
  return date.toISOString().slice(0, 10)
}

/** Monday-start 6-week grid covering `monthStart` (YYYY-MM-01). */
export function monthGridCells(
  monthStart: string,
): { date: string; inMonth: boolean }[] {
  const start = monthStartIso(monthStart)
  const year = Number(start.slice(0, 4))
  const month = Number(start.slice(5, 7)) - 1
  const mondayOffset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
  const origin = new Date(Date.UTC(year, month, 1 - mondayOffset))
  const cells: { date: string; inMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const cell = new Date(origin)
    cell.setUTCDate(origin.getUTCDate() + i)
    cells.push({
      date: cell.toISOString().slice(0, 10),
      inMonth: cell.getUTCMonth() === month,
    })
  }
  return cells
}

export function isoDatesInclusive(from: string, to: string): string[] {
  if (from > to) return []
  const dates: string[] = []
  let current = from
  while (current <= to) {
    dates.push(current)
    current = addDaysIso(current, 1)
  }
  return dates
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.toISOString().slice(0, 10) === value
}

export function isIsoDateOnOrBefore(value: string, today: string): boolean {
  return isIsoDate(value) && isIsoDate(today) && value <= today
}
