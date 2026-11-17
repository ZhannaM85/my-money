import type { Asset, AssetClass } from '@/domain/asset'
import { isRemovedOn } from '@/domain/asset'
import { convertAmount, lookupRate, type RateTable } from '@/domain/fx'
import type { CurrencyDisplayMode } from '@/domain/settings'
import type { AssetSnapshot } from '@/domain/snapshot'

export type AssetsFilter = 'all' | AssetClass | 'archived'

/** Snapshots that already existed on `asOf`, newest per asset via `latestSnapshot`. */
export function snapshotsOnBookDate(
  snapshots: readonly AssetSnapshot[],
  asOf: string,
): AssetSnapshot[] {
  return snapshots.filter((snapshot) => snapshot.date <= asOf)
}

/** Active list, class chip, or Hidden, evaluated on `asOf` (#329). */
export function assetListedAt(
  asset: Pick<Asset, 'trackingStatus' | 'assetClass' | 'endedOn'>,
  asOf: string,
  filter: AssetsFilter,
): boolean {
  const removed = isRemovedOn(asset, asOf)
  if (filter === 'archived') {
    return asset.trackingStatus === 'archived' || removed
  }
  if (asset.trackingStatus === 'archived' || removed) return false
  if (filter === 'all') return true
  return asset.assetClass === filter
}

/**
 * Still on the book for `asOf`, but an end date is set after that day.
 * The row stays in the active list and is marked removed from `endedOn`.
 */
export function removedAfterAsOf(
  asset: { endedOn?: string },
  asOf: string,
): boolean {
  return asset.endedOn !== undefined && asOf < asset.endedOn
}

/** Amount used for sort, matching the figure on the row. */
export function shownAmount(
  snapshot: AssetSnapshot | undefined,
  quotes: RateTable,
  baseCurrency: string,
  displayMode: CurrencyDisplayMode,
): number | null {
  if (!snapshot) return null
  if (displayMode === 'base') {
    const sameCurrency = snapshot.currency === baseCurrency
    const rate = lookupRate(
      quotes,
      snapshot.currency,
      baseCurrency,
      snapshot.date,
    )
    if (rate !== undefined && !sameCurrency) {
      return convertAmount(snapshot.amount, rate)
    }
  }
  return snapshot.amount
}

/** `removed` uses «Removed from»; `ends` is only a future end while viewing today. */
export function assetEndCaption(
  asset: { endedOn?: string },
  asOf: string,
  today: string,
): 'removed' | 'ends' | null {
  if (!asset.endedOn) return null
  if (isRemovedOn(asset, asOf) || asOf < today) return 'removed'
  return 'ends'
}
