export interface AssetSnapshot {
  id: string
  assetId: string
  date: string
  amount: number
  currency: string
  createdAt: string
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
