export function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export type HistoryRange = '1M' | '3M' | '6M' | '1Y' | 'All'

export const HISTORY_RANGES: HistoryRange[] = ['1M', '3M', '6M', '1Y', 'All']

const RANGE_DAYS: Record<Exclude<HistoryRange, 'All'>, number> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
}

/** Pinch-out / Zoom in → narrower window; pinch-in / Zoom out → wider. */
export function stepHistoryRange(
  current: HistoryRange,
  direction: 'in' | 'out',
): HistoryRange {
  const index = HISTORY_RANGES.indexOf(current)
  if (index < 0) return current
  if (direction === 'in') {
    return HISTORY_RANGES[Math.max(0, index - 1)]
  }
  return HISTORY_RANGES[Math.min(HISTORY_RANGES.length - 1, index + 1)]
}

export function rangeStartIso(
  range: HistoryRange,
  today: string,
  earliest?: string,
): string {
  if (range === 'All') return earliest ?? today
  const start = unclampedRangeStartIso(range, today)
  if (earliest && start < earliest) return earliest
  return start
}

/** Range start before clamping to the first snapshot (All is unused). */
export function unclampedRangeStartIso(
  range: HistoryRange,
  today: string,
): string {
  if (range === 'All') return today
  return addDaysIso(today, -RANGE_DAYS[range])
}

export function isRangeClampedToEarliest(
  range: HistoryRange,
  today: string,
  earliest: string,
): boolean {
  if (range === 'All') return false
  return unclampedRangeStartIso(range, today) < earliest
}

export function historyRangeDayCount(range: HistoryRange): number | null {
  if (range === 'All') return null
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
  if (range === 'All') return today
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
  if (range === 'All') return false
  return rangeEnd > earliest
}

export function canPanHistoryLater(
  rangeEnd: string,
  range: HistoryRange,
  today: string,
): boolean {
  if (range === 'All') return false
  return rangeEnd < today
}

export function monthStartIso(isoDate: string): string {
  return `${isoDate.slice(0, 8)}01`
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
