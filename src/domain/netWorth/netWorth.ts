import type { Asset, AssetClass } from '@/domain/asset'
import { contributesToNetWorth, effectiveAmount, isLiability } from '@/domain/asset'
import {
  convertAmount,
  lookupRate,
  lookupRateOnOrBefore,
  type RateTable,
} from '@/domain/fx'
import {
  latestSnapshot,
  snapshotsOnOrBefore,
  type AssetSnapshot,
} from '@/domain/snapshot'

export interface ClassTotal {
  assetClass: AssetClass
  amount: number
}

export interface MissingRate {
  assetId: string
  from: string
  to: string
  date: string
}

export interface NetWorthResult {
  total: number
  byClass: ClassTotal[]
  missingRates: MissingRate[]
}

function emptyByClass(): ClassTotal[] {
  return [
    { assetClass: 'money', amount: 0 },
    { assetClass: 'investments', amount: 0 },
    { assetClass: 'property', amount: 0 },
    { assetClass: 'valuables', amount: 0 },
    { assetClass: 'liabilities', amount: 0 },
  ]
}

function convertedContribution(
  asset: Asset,
  snapshot: AssetSnapshot,
  rates: RateTable,
  baseCurrency: string,
  rateDate: string,
  rateLookup: typeof lookupRate = lookupRate,
): { amount: number } | { missing: MissingRate } {
  const rate = rateLookup(rates, snapshot.currency, baseCurrency, rateDate)
  if (rate === undefined) {
    return {
      missing: {
        assetId: asset.id,
        from: snapshot.currency,
        to: baseCurrency,
        date: rateDate,
      },
    }
  }
  const native = effectiveAmount(convertAmount(snapshot.amount, rate), asset)
  return { amount: isLiability(asset) ? -native : native }
}

/** Latest native totals by snapshot currency. Never skips for missing FX. */
export function nativeTotalsByCurrency(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
): { currency: string; amount: number }[] {
  const buckets = new Map<string, number>()
  for (const asset of assets) {
    if (!contributesToNetWorth(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    const native = effectiveAmount(snapshot.amount, asset)
    const signed = isLiability(asset) ? -native : native
    buckets.set(
      snapshot.currency,
      (buckets.get(snapshot.currency) ?? 0) + signed,
    )
  }
  return [...buckets.entries()]
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((a, b) => a.currency.localeCompare(b.currency))
}

/** Native (unconverted) historical series for one currency filter. */
export function historicalNativeNetWorth(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  dates: readonly string[],
  currency: string,
): HistoricalPoint[] {
  return dates.map((date) => {
    const holdings: HoldingConversion[] = []
    let total = 0
    for (const asset of assets) {
      if (!contributesToNetWorth(asset)) continue
      const snapshot = snapshotsOnOrBefore(snapshots, asset.id, date)
      if (!snapshot || snapshot.currency !== currency) continue
      const native = effectiveAmount(snapshot.amount, asset)
      const signed = isLiability(asset) ? -native : native
      total += signed
      holdings.push({
        assetId: asset.id,
        name: asset.name,
        currency: snapshot.currency,
        nativeAmount: signed,
        convertedAmount: signed,
        conversionAvailable: true,
        ...(snapshot.note ? { note: snapshot.note } : {}),
        ...(asset.institution?.trim()
          ? { institution: asset.institution.trim() }
          : {}),
      })
    }
    holdings.sort((a, b) => a.name.localeCompare(b.name))
    return { date, total, missingRates: [], holdings }
  })
}

export interface HoldingConversion {
  assetId: string
  name: string
  currency: string
  nativeAmount: number
  /** Base-currency amount when a rate exists; otherwise null. */
  convertedAmount: number | null
  conversionAvailable: boolean
  note?: string
  institution?: string
}

export interface HistoricalPoint {
  date: string
  total: number
  missingRates: MissingRate[]
  holdings: HoldingConversion[]
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
    if (!contributesToNetWorth(asset)) continue
    const snapshot = latestSnapshot(snapshots, asset.id)
    if (!snapshot) continue
    const nativeRaw = effectiveAmount(snapshot.amount, asset)
    const nativeAmount = isLiability(asset) ? -nativeRaw : nativeRaw
    const rate = lookupRate(rates, snapshot.currency, baseCurrency, snapshot.date)
    if (rate === undefined) {
      rows.push({
        assetId: asset.id,
        name: asset.name,
        currency: snapshot.currency,
        nativeAmount,
        convertedAmount: null,
        conversionAvailable: false,
        ...(snapshot.note ? { note: snapshot.note } : {}),
        ...(asset.institution?.trim()
          ? { institution: asset.institution.trim() }
          : {}),
      })
      continue
    }
    const convertedRaw = effectiveAmount(convertAmount(snapshot.amount, rate), asset)
    const convertedAmount = isLiability(asset) ? -convertedRaw : convertedRaw
    rows.push({
      assetId: asset.id,
      name: asset.name,
      currency: snapshot.currency,
      nativeAmount,
      convertedAmount,
      conversionAvailable: true,
      ...(snapshot.note ? { note: snapshot.note } : {}),
      ...(asset.institution?.trim()
        ? { institution: asset.institution.trim() }
        : {}),
    })
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name))
}

export function netWorth(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  rates: RateTable,
  baseCurrency: string,
): NetWorthResult {
  const byClass = emptyByClass()
  const missingRates: MissingRate[] = []
  let total = 0

  for (const asset of assets) {
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

export function historicalNetWorth(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  rates: RateTable,
  dates: readonly string[],
  baseCurrency: string,
): HistoricalPoint[] {
  return dates.map((date) => {
    const missingRates: MissingRate[] = []
    const holdings: HoldingConversion[] = []
    let total = 0
    for (const asset of assets) {
      if (!contributesToNetWorth(asset)) continue
      const snapshot = snapshotsOnOrBefore(snapshots, asset.id, date)
      if (!snapshot) continue
      const nativeRaw = effectiveAmount(snapshot.amount, asset)
      const nativeAmount = isLiability(asset) ? -nativeRaw : nativeRaw
      const result = convertedContribution(
        asset,
        snapshot,
        rates,
        baseCurrency,
        date,
        lookupRateOnOrBefore,
      )
      if ('missing' in result) {
        missingRates.push(result.missing)
        holdings.push({
          assetId: asset.id,
          name: asset.name,
          currency: snapshot.currency,
          nativeAmount,
          convertedAmount: null,
          conversionAvailable: false,
          ...(snapshot.note ? { note: snapshot.note } : {}),
          ...(asset.institution?.trim()
            ? { institution: asset.institution.trim() }
            : {}),
        })
        continue
      }
      total += result.amount
      holdings.push({
        assetId: asset.id,
        name: asset.name,
        currency: snapshot.currency,
        nativeAmount,
        convertedAmount: result.amount,
        conversionAvailable: true,
        ...(snapshot.note ? { note: snapshot.note } : {}),
        ...(asset.institution?.trim()
          ? { institution: asset.institution.trim() }
          : {}),
      })
    }
    holdings.sort((a, b) => a.name.localeCompare(b.name))
    return { date, total, missingRates, holdings }
  })
}

export function allocation(byClass: readonly ClassTotal[]): {
  assetClass: AssetClass
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
    if ('missing' in result) continue
    const key = keyOf(asset)
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

export function periodChange(
  from: number,
  to: number,
): { absolute: number; percent: number | null } {
  const absolute = to - from
  if (from === 0) return { absolute, percent: null }
  return { absolute, percent: (absolute / Math.abs(from)) * 100 }
}

/**
 * Split a Converted period move into amount updates (valued at the end rate)
 * vs FX on the starting native balances. amountChange + rateChange equals
 * the converted total change when both points converted fully.
 */
export function decomposeConvertedPeriodChange(
  start: readonly HoldingConversion[],
  end: readonly HoldingConversion[],
): {
  amountChange: number
  rateChange: number
  totalChange: number
  holdings: {
    assetId: string
    name: string
    amountChange: number
    rateChange: number
  }[]
} {
  const startById = new Map(start.map((row) => [row.assetId, row]))
  const endById = new Map(end.map((row) => [row.assetId, row]))
  const ids = [...new Set([...startById.keys(), ...endById.keys()])].sort(
    (a, b) => {
      const left = startById.get(a)?.name ?? endById.get(a)?.name ?? a
      const right = startById.get(b)?.name ?? endById.get(b)?.name ?? b
      return left.localeCompare(right)
    },
  )
  let amountChange = 0
  let rateChange = 0
  const holdings: {
    assetId: string
    name: string
    amountChange: number
    rateChange: number
  }[] = []
  for (const id of ids) {
    const from = startById.get(id)
    const to = endById.get(id)
    const startNative = from?.nativeAmount ?? 0
    const endNative = to?.nativeAmount ?? 0
    const startConverted =
      from?.conversionAvailable && from.convertedAmount !== null
        ? from.convertedAmount
        : 0
    const endConverted =
      to?.conversionAvailable && to.convertedAmount !== null
        ? to.convertedAmount
        : 0
    const endRate =
      endNative !== 0
        ? endConverted / endNative
        : startNative !== 0
          ? startConverted / startNative
          : 0
    const startRate =
      startNative !== 0 ? startConverted / startNative : endRate
    const holdingAmount = (endNative - startNative) * endRate
    const holdingRate = startNative * (endRate - startRate)
    amountChange += holdingAmount
    rateChange += holdingRate
    holdings.push({
      assetId: id,
      name: to?.name ?? from?.name ?? id,
      amountChange: holdingAmount,
      rateChange: holdingRate,
    })
  }
  return {
    amountChange,
    rateChange,
    totalChange: amountChange + rateChange,
    holdings,
  }
}

export function assetPerformance(
  snapshots: readonly AssetSnapshot[],
  rates: RateTable,
  baseCurrency: string,
): {
  nativeAbsolute: number
  nativePercent: number | null
  baseAbsolute: number | null
  basePercent: number | null
} | null {
  if (snapshots.length === 0) return null
  const ordered = [...snapshots].sort((a, b) =>
    a.date === b.date
      ? a.createdAt.localeCompare(b.createdAt)
      : a.date.localeCompare(b.date),
  )
  const first = ordered[0]
  const last = ordered[ordered.length - 1]
  const nativeAbsolute = last.amount - first.amount
  const nativePercent =
    first.amount === 0 ? null : (nativeAbsolute / Math.abs(first.amount)) * 100

  const firstRate = lookupRate(rates, first.currency, baseCurrency, first.date)
  const lastRate = lookupRate(rates, last.currency, baseCurrency, last.date)
  if (firstRate === undefined || lastRate === undefined) {
    return {
      nativeAbsolute,
      nativePercent,
      baseAbsolute: null,
      basePercent: null,
    }
  }
  const firstBase = convertAmount(first.amount, firstRate)
  const lastBase = convertAmount(last.amount, lastRate)
  const baseAbsolute = lastBase - firstBase
  const basePercent =
    firstBase === 0 ? null : (baseAbsolute / Math.abs(firstBase)) * 100
  return { nativeAbsolute, nativePercent, baseAbsolute, basePercent }
}
