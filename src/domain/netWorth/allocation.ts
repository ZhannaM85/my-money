import type { Asset } from '@/domain/asset'
import {
  contributesToNetWorth,
  effectiveAmount,
  isLiability,
  isListedOnDashboard,
} from '@/domain/asset'
import {
  convertAmount,
  lookupRateOnOrBefore,
  type RateTable,
} from '@/domain/fx'
import { latestSnapshot, type AssetSnapshot } from '@/domain/snapshot'
import { convertedContribution } from './contribution'
import type { ClassTotal, NativeAllocationRow } from './types'

export function allocation(byClass: readonly ClassTotal[]): {
  assetClass: ClassTotal['assetClass']
  amount: number
  percent: number
}[] {
  const absSum = byClass.reduce((sum, row) => sum + Math.abs(row.amount), 0)
  return byClass.map((row) => ({
    assetClass: row.assetClass,
    amount: row.amount,
    percent: absSum === 0 ? 0 : (Math.abs(row.amount) / absSum) * 100,
  }))
}

export function breakdownBy(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  rates: RateTable,
  baseCurrency: string,
  keyOf: (asset: Asset) => string,
): { id: string; amount: number; percent: number }[] {
  const buckets = new Map<string, number>()
  for (const asset of assets) {
    if (!isListedOnDashboard(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    const key = keyOf(asset)
    if (!contributesToNetWorth(asset)) {
      if (!buckets.has(key)) buckets.set(key, 0)
      continue
    }
    const result = convertedContribution(
      asset,
      snapshot,
      rates,
      baseCurrency,
      snapshot.date,
    )
    if ('missing' in result) continue
    buckets.set(key, (buckets.get(key) ?? 0) + result.amount)
  }
  const rows = [...buckets.entries()].map(([id, amount]) => ({ id, amount }))
  const absSum = rows.reduce((sum, row) => sum + Math.abs(row.amount), 0)
  return rows
    .map((row) => ({
      ...row,
      percent: absSum === 0 ? 0 : (Math.abs(row.amount) / absSum) * 100,
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
}

function shareWeightFor(
  amount: number,
  from: string,
  date: string,
  rates: RateTable | undefined,
  shareBase: string | undefined,
): { shareWeight: number; conversionAvailable: boolean } {
  if (!rates || !shareBase) {
    return { shareWeight: Math.abs(amount), conversionAvailable: true }
  }
  const rate = lookupRateOnOrBefore(rates, from, shareBase, date)
  if (rate === undefined) {
    return { shareWeight: 0, conversionAvailable: false }
  }
  return {
    shareWeight: Math.abs(convertAmount(amount, rate)),
    conversionAvailable: true,
  }
}

/** Native amounts with share % from a hidden converted base (#121). */
export function attachConvertedSharePercents<
  T extends { amount: number; currency: string },
>(
  rows: readonly T[],
  rates: RateTable,
  shareBase: string,
  asOf: string,
): (T & {
  percent: number
  shareWeight: number
  conversionAvailable: boolean
})[] {
  const enriched = rows.map((row) => {
    const share = shareWeightFor(
      row.amount,
      row.currency,
      asOf,
      rates,
      shareBase,
    )
    return { ...row, ...share }
  })
  const absSum = enriched
    .filter((row) => row.conversionAvailable)
    .reduce((sum, row) => sum + row.shareWeight, 0)
  return enriched
    .map((row) => ({
      ...row,
      percent:
        !row.conversionAvailable || absSum === 0
          ? 0
          : (row.shareWeight / absSum) * 100,
    }))
    .sort((a, b) => b.shareWeight - a.shareWeight)
}

/** Native (unconverted) totals by key·currency — Original Class/Type (#108). */
export function nativeBreakdownBy(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  keyOf: (asset: Asset) => string,
  rates?: RateTable,
  shareBase?: string,
): NativeAllocationRow[] {
  const buckets = new Map<
    string,
    {
      amount: number
      currency: string
      shareWeight: number
      conversionAvailable: boolean
    }
  >()
  for (const asset of assets) {
    if (!isListedOnDashboard(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    const native = effectiveAmount(snapshot.amount, asset)
    const signed = isLiability(asset) ? -native : native
    const labelKey = keyOf(asset)
    const id = `${labelKey}::${snapshot.currency}`
    if (!contributesToNetWorth(asset)) {
      if (!buckets.has(id)) {
        buckets.set(id, {
          amount: 0,
          currency: snapshot.currency,
          shareWeight: 0,
          conversionAvailable: true,
        })
      }
      continue
    }
    const share = shareWeightFor(
      signed,
      snapshot.currency,
      snapshot.date,
      rates,
      shareBase,
    )
    const existing = buckets.get(id)
    buckets.set(id, {
      amount: (existing?.amount ?? 0) + signed,
      currency: snapshot.currency,
      shareWeight: (existing?.shareWeight ?? 0) + share.shareWeight,
      conversionAvailable:
        (existing?.conversionAvailable ?? true) && share.conversionAvailable,
    })
  }
  const rows = [...buckets.entries()].map(([id, row]) => ({
    id,
    amount: row.amount,
    currency: row.currency,
    shareWeight: row.shareWeight,
    conversionAvailable: row.conversionAvailable,
  }))
  const useConverted = Boolean(rates && shareBase)
  const absSum = useConverted
    ? rows
        .filter((row) => row.conversionAvailable)
        .reduce((sum, row) => sum + row.shareWeight, 0)
    : rows.reduce((sum, row) => sum + Math.abs(row.amount), 0)
  return rows
    .map((row) => ({
      ...row,
      percent:
        (useConverted && !row.conversionAvailable) || absSum === 0
          ? 0
          : ((useConverted ? row.shareWeight : Math.abs(row.amount)) / absSum) *
            100,
    }))
    .sort((a, b) =>
      useConverted
        ? b.shareWeight - a.shareWeight
        : Math.abs(b.amount) - Math.abs(a.amount),
    )
}
