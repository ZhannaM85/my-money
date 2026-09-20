export interface AssetSnapshot {
  id: string
  assetId: string
  date: string
  amount: number
  currency: string
  createdAt: string
  note?: string
  /**
   * Explicit given/received entry (#280, #282): remaining change from that
   * mode only. Positive = received, negative = given. Omitted on Остаток saves.
   */
  flow?: number
}

export function optionalSnapshotNote(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function latestSnapshot(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
): AssetSnapshot | undefined {
  return snapshotsOnOrBefore(snapshots, assetId, '9999-12-31')
}

export function snapshotsOnOrBefore(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
  date: string,
): AssetSnapshot | undefined {
  const matching = snapshots.filter(
    (snapshot) => snapshot.assetId === assetId && snapshot.date <= date,
  )
  if (matching.length === 0) return undefined
  return matching.reduce((best, current) => {
    if (current.date > best.date) return current
    if (current.date < best.date) return best
    return current.createdAt > best.createdAt ? current : best
  })
}

/** Last snapshot strictly before `date` — not overall latest (#180). */
export function snapshotBeforeDate(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
  date: string,
): AssetSnapshot | undefined {
  const matching = snapshots.filter(
    (snapshot) => snapshot.assetId === assetId && snapshot.date < date,
  )
  if (matching.length === 0) return undefined
  return matching.reduce((best, current) => {
    if (current.date > best.date) return current
    if (current.date < best.date) return best
    return current.createdAt > best.createdAt ? current : best
  })
}

/** Exact calendar day only — not carry-forward (#176, #177). */
export function snapshotOnDate(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
  date: string,
): AssetSnapshot | undefined {
  const matching = snapshotsOnDateAll(snapshots, assetId, date)
  if (matching.length === 0) return undefined
  return matching.reduce((best, current) =>
    current.createdAt > best.createdAt ? current : best,
  )
}

/** Same-day rows, oldest `createdAt` first (#279). */
export function snapshotsOnDateAll(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
  date: string,
): AssetSnapshot[] {
  return snapshots
    .filter(
      (snapshot) => snapshot.assetId === assetId && snapshot.date === date,
    )
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export type FlowDirection = 'given' | 'received'

export type SameDaySpendEntry = {
  id: string
  remaining: number
  drop: number
  direction: FlowDirection
  flow?: number
  currency: string
  note?: string
}

export function flowDirection(
  flow: number | undefined,
  drop: number,
): FlowDirection {
  if (flow !== undefined) return flow >= 0 ? 'received' : 'given'
  return drop < 0 ? 'received' : 'given'
}

export function isExplicitFlowRow(
  entry: Pick<SameDaySpendEntry, 'drop' | 'flow'>,
): boolean {
  return entry.flow !== undefined || entry.drop !== 0
}

/** Per-snapshot remaining change on that calendar day (#279, #280). */
export function sameDaySpendEntries(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
  date: string,
): SameDaySpendEntry[] {
  const rows = snapshotsOnDateAll(snapshots, assetId, date)
  if (rows.length === 0) return []
  const previous = snapshotBeforeDate(snapshots, assetId, date)
  let priorAmount = previous?.amount
  let priorCurrency = previous?.currency
  return rows.map((row) => {
    const drop =
      priorAmount !== undefined && priorCurrency === row.currency
        ? priorAmount - row.amount
        : 0
    priorAmount = row.amount
    priorCurrency = row.currency
    const direction = flowDirection(row.flow, drop)
    return {
      id: row.id,
      remaining: row.amount,
      drop,
      direction,
      currency: row.currency,
      ...(row.flow !== undefined ? { flow: row.flow } : {}),
      ...(row.note ? { note: row.note } : {}),
    }
  })
}

/** Same date + amount (+ currency) as another row on this asset (#115). */
export function hasDuplicateSnapshot(
  snapshots: readonly AssetSnapshot[],
  candidate: {
    assetId: string
    date: string
    amount: number
    currency: string
    excludeId?: string
  },
): boolean {
  return snapshots.some(
    (row) =>
      row.assetId === candidate.assetId &&
      row.id !== candidate.excludeId &&
      row.date === candidate.date &&
      row.amount === candidate.amount &&
      row.currency === candidate.currency,
  )
}
