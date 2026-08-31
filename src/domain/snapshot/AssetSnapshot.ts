export interface AssetSnapshot {
  id: string
  assetId: string
  date: string
  amount: number
  currency: string
  createdAt: string
  note?: string
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
  const matching = snapshots.filter(
    (snapshot) => snapshot.assetId === assetId && snapshot.date === date,
  )
  if (matching.length === 0) return undefined
  return matching.reduce((best, current) =>
    current.createdAt > best.createdAt ? current : best,
  )
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
