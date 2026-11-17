import type { Asset } from '@/domain/asset'
import {
  activeBookDate,
  contributesToNetWorth,
  isRemovedOn,
} from '@/domain/asset'
import type { RateTable } from '@/domain/fx'
import { latestSnapshot, type AssetSnapshot } from '@/domain/snapshot'
import { convertedContribution, emptyByClass } from './contribution'
import type { ClassTotal, MissingRate, NetWorthResult } from './types'

export function netWorth(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  rates: RateTable,
  baseCurrency: string,
  asOf?: string,
): NetWorthResult {
  const on = activeBookDate(asOf)
  const byClass = emptyByClass()
  const missingRates: MissingRate[] = []
  let total = 0

  for (const asset of assets) {
    if (isRemovedOn(asset, on)) continue
    if (!contributesToNetWorth(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    const result = convertedContribution(
      asset,
      snapshot,
      rates,
      baseCurrency,
      snapshot.date,
    )
    if ('missing' in result) {
      missingRates.push(result.missing)
      continue
    }
    total += result.amount
    const bucket = byClass.find((row) => row.assetClass === asset.assetClass)
    if (bucket) bucket.amount += result.amount
  }

  return { total, byClass, missingRates }
}

export type { ClassTotal, MissingRate, NetWorthResult }
