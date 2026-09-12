import type { Asset } from '@/domain/asset'
import {
  contributesToNetWorth,
  effectiveAmount,
  isLiability,
  isListedOnDashboard,
} from '@/domain/asset'
import { lookupRateOnOrBefore, type RateTable } from '@/domain/fx'
import {
  indexSnapshotsByAssetId,
  latestIndexedSnapshotOnOrBefore,
  type AssetSnapshot,
} from '@/domain/snapshot'
import { convertedContribution, toHoldingConversion } from './contribution'
import type { HistoricalPoint, HoldingConversion, MissingRate } from './types'

function historicalPointFromAssets(
  assets: readonly Asset[],
  byAsset: Map<string, AssetSnapshot[]>,
  date: string,
  includeHolding: (
    asset: Asset,
    snapshot: AssetSnapshot,
    nativeAmount: number,
  ) =>
    | { totalDelta: number; holding: HoldingConversion; missing?: MissingRate }
    | undefined,
): HistoricalPoint {
  const missingRates: MissingRate[] = []
  const holdings: HoldingConversion[] = []
  let total = 0
  for (const asset of assets) {
    if (!isListedOnDashboard(asset)) continue
    const snapshot = latestIndexedSnapshotOnOrBefore(
      byAsset.get(asset.id),
      date,
    )
    if (!snapshot) continue
    const nativeRaw = effectiveAmount(snapshot.amount, asset)
    const nativeAmount = isLiability(asset) ? -nativeRaw : nativeRaw
    const included = includeHolding(asset, snapshot, nativeAmount)
    if (!included) continue
    if (included.missing) missingRates.push(included.missing)
    total += included.totalDelta
    holdings.push(included.holding)
  }
  holdings.sort((a, b) => a.name.localeCompare(b.name))
  return { date, total, missingRates, holdings }
}

/** Native (unconverted) historical series for one currency filter. */
export function historicalNativeNetWorth(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  dates: readonly string[],
  currency: string,
): HistoricalPoint[] {
  const byAsset = indexSnapshotsByAssetId(snapshots)
  return dates.map((date) =>
    historicalPointFromAssets(
      assets,
      byAsset,
      date,
      (asset, snapshot, nativeAmount) => {
        if (snapshot.currency !== currency) return undefined
        return {
          totalDelta: contributesToNetWorth(asset) ? nativeAmount : 0,
          holding: toHoldingConversion(
            asset,
            snapshot,
            nativeAmount,
            nativeAmount,
            true,
          ),
        }
      },
    ),
  )
}

export function historicalNetWorth(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  rates: RateTable,
  dates: readonly string[],
  baseCurrency: string,
): HistoricalPoint[] {
  const byAsset = indexSnapshotsByAssetId(snapshots)
  return dates.map((date) =>
    historicalPointFromAssets(
      assets,
      byAsset,
      date,
      (asset, snapshot, nativeAmount) => {
        const result = convertedContribution(
          asset,
          snapshot,
          rates,
          baseCurrency,
          date,
          lookupRateOnOrBefore,
        )
        if ('missing' in result) {
          return {
            totalDelta: 0,
            missing: result.missing,
            holding: toHoldingConversion(
              asset,
              snapshot,
              nativeAmount,
              null,
              false,
            ),
          }
        }
        return {
          totalDelta: contributesToNetWorth(asset) ? result.amount : 0,
          holding: toHoldingConversion(
            asset,
            snapshot,
            nativeAmount,
            result.amount,
            true,
          ),
        }
      },
    ),
  )
}
