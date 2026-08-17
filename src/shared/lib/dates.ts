export function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export type HistoryRange = '1M' | '3M' | '6M' | '1Y' | 'All'

const RANGE_DAYS: Record<Exclude<HistoryRange, 'All'>, number> = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
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
