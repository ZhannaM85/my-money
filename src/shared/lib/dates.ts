export function addDaysIso(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
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
