import { convertAmount, lookupRate, type RateTable } from '@/domain/fx'
import type { AssetSnapshot } from '@/domain/snapshot'
import type { HoldingConversion } from './types'

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
  const countedStart = start.filter((row) => !row.excluded)
  const countedEnd = end.filter((row) => !row.excluded)
  const startById = new Map(countedStart.map((row) => [row.assetId, row]))
  const endById = new Map(countedEnd.map((row) => [row.assetId, row]))
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
    const startRate = startNative !== 0 ? startConverted / startNative : endRate
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
