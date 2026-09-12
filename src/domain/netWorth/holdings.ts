import type { Asset } from '@/domain/asset'
import {
  contributesToNetWorth,
  effectiveAmount,
  isLiability,
  isListedOnDashboard,
  listOwnershipShare,
} from '@/domain/asset'
import { convertAmount, lookupRate, type RateTable } from '@/domain/fx'
import { latestSnapshot, type AssetSnapshot } from '@/domain/snapshot'
import { toHoldingConversion } from './contribution'
import type { AllocationHolding, HoldingConversion } from './types'

/** Latest native totals by snapshot currency. Never skips for missing FX. */
export function nativeTotalsByCurrency(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
): { currency: string; amount: number }[] {
  const buckets = new Map<string, number>()
  for (const asset of assets) {
    if (!isListedOnDashboard(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    const native = effectiveAmount(snapshot.amount, asset)
    const signed = isLiability(asset) ? -native : native
    if (!contributesToNetWorth(asset)) {
      if (!buckets.has(snapshot.currency)) buckets.set(snapshot.currency, 0)
      continue
    }
    buckets.set(
      snapshot.currency,
      (buckets.get(snapshot.currency) ?? 0) + signed,
    )
  }
  return [...buckets.entries()]
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((a, b) => a.currency.localeCompare(b.currency))
}

/** Assets that belong in one Allocation Class, Currency, or Type slice (#122, #123). */
export function allocationSliceHoldings(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  match: (asset: Asset, snapshot: AssetSnapshot) => boolean,
): AllocationHolding[] {
  const rows: AllocationHolding[] = []
  for (const asset of assets) {
    if (!isListedOnDashboard(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    if (!match(asset, snapshot)) continue
    const native = effectiveAmount(snapshot.amount, asset)
    const signed = isLiability(asset) ? -native : native
    const ownershipShare = listOwnershipShare(asset)
    rows.push({
      assetId: asset.id,
      name: asset.name,
      ...(asset.institution ? { institution: asset.institution } : {}),
      amount: signed,
      currency: snapshot.currency,
      ...(ownershipShare ? { ownershipShare } : {}),
      ...(asset.trackingStatus === 'excluded' ? { excluded: true } : {}),
    })
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Every contributing holding with native amount. Missing FX does not drop the row;
 * `convertedAmount` is null and `conversionAvailable` is false instead.
 * Combined Converted totals should still use `netWorth()` (excludes missing).
 */
export function holdingsWithConversion(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  rates: RateTable,
  baseCurrency: string,
): HoldingConversion[] {
  const rows: HoldingConversion[] = []
  for (const asset of assets) {
    if (!isListedOnDashboard(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    const nativeRaw = effectiveAmount(snapshot.amount, asset)
    const nativeAmount = isLiability(asset) ? -nativeRaw : nativeRaw
    const rate = lookupRate(
      rates,
      snapshot.currency,
      baseCurrency,
      snapshot.date,
    )
    if (rate === undefined) {
      rows.push(toHoldingConversion(asset, snapshot, nativeAmount, null, false))
      continue
    }
    const convertedRaw = effectiveAmount(
      convertAmount(snapshot.amount, rate),
      asset,
    )
    const convertedAmount = isLiability(asset) ? -convertedRaw : convertedRaw
    rows.push(
      toHoldingConversion(asset, snapshot, nativeAmount, convertedAmount, true),
    )
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name))
}
