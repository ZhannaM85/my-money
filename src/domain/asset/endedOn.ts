/**
 * Inclusive end date (#328). On and after `endedOn` the asset is absent from
 * lists, totals, positions, and history. Earlier dates keep the stored book.
 */

export function isRemovedOn(
  asset: { endedOn?: string },
  date: string,
): boolean {
  return asset.endedOn !== undefined && date >= asset.endedOn
}

/** UTC calendar day, same cut as `todayIsoDate` in shared/lib/money. */
export function activeBookDate(asOf?: string, now = new Date()): string {
  return asOf ?? now.toISOString().slice(0, 10)
}

/**
 * New valuations on or after the end date are refused. A row that was already
 * stored on or after that date can still be edited so undo restores it.
 */
export function snapshotWriteBlocked(
  asset: { endedOn?: string } | undefined,
  date: string,
  previousDate?: string,
): boolean {
  if (!asset?.endedOn || date < asset.endedOn) return false
  if (previousDate !== undefined && previousDate >= asset.endedOn) return false
  return true
}

export class SnapshotAfterEndError extends Error {
  readonly endedOn: string

  constructor(endedOn: string) {
    super('Snapshot date is on or after the asset end date.')
    this.name = 'SnapshotAfterEndError'
    this.endedOn = endedOn
  }
}
