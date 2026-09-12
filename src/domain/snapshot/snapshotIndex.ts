import type { AssetSnapshot } from './AssetSnapshot'

/** Group snapshots once so historical series can look up per asset. */
export function indexSnapshotsByAssetId(
  snapshots: readonly AssetSnapshot[],
): Map<string, AssetSnapshot[]> {
  const index = new Map<string, AssetSnapshot[]>()
  for (const snapshot of snapshots) {
    const list = index.get(snapshot.assetId)
    if (list) list.push(snapshot)
    else index.set(snapshot.assetId, [snapshot])
  }
  return index
}

/**
 * Same pick as `snapshotsOnOrBefore`: latest date ≤ `date`, then latest
 * `createdAt`. Operates on one asset’s already-indexed rows.
 */
export function latestIndexedSnapshotOnOrBefore(
  snapshots: readonly AssetSnapshot[] | undefined,
  date: string,
): AssetSnapshot | undefined {
  if (!snapshots || snapshots.length === 0) return undefined
  const matching = snapshots.filter((snapshot) => snapshot.date <= date)
  if (matching.length === 0) return undefined
  return matching.reduce((best, current) => {
    if (current.date > best.date) return current
    if (current.date < best.date) return best
    return current.createdAt > best.createdAt ? current : best
  })
}
