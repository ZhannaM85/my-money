import { daysBetweenIso } from '@/domain/asset'
import type { Dictionary } from './Dictionary'

export function formatLastUpdated(
  lastSnapshotDate: string | undefined,
  today: string,
  t: Dictionary,
): string {
  if (!lastSnapshotDate) return t.asset.noValueYet
  const days = daysBetweenIso(lastSnapshotDate, today)
  if (days <= 0) return t.asset.updatedToday
  if (days === 1) return t.asset.updatedYesterday
  return t.asset.updatedDaysAgo(days)
}
