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
  const start = addDaysIso(today, -RANGE_DAYS[range])
  if (earliest && start < earliest) return earliest
  return start
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
