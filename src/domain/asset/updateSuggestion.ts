import type { UpdateFrequency } from './Asset'

const MS_PER_DAY = 86_400_000

export function daysBetweenIso(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00.000Z`)
  const end = Date.parse(`${to}T00:00:00.000Z`)
  return Math.round((end - start) / MS_PER_DAY)
}

export function isSuggestedUpdate(
  frequency: UpdateFrequency,
  lastSnapshotDate: string | undefined,
  today: string,
): boolean {
  if (frequency === 'yearly' || frequency === 'manual') return false
  if (!lastSnapshotDate) return true
  const days = daysBetweenIso(lastSnapshotDate, today)
  if (frequency === 'weekly') return days >= 7
  return days >= 30
}

export function lastUpdatedCopy(
  lastSnapshotDate: string | undefined,
  today: string,
): string {
  if (!lastSnapshotDate) return 'No value yet'
  const days = daysBetweenIso(lastSnapshotDate, today)
  if (days <= 0) return 'Updated today'
  if (days === 1) return 'Updated yesterday'
  return `Updated ${days} days ago`
}
