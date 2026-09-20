import type { Asset, BalanceEntryMode, BalanceHeadline } from './Asset'
import {
  sameDaySpendEntries,
  snapshotsOnDateAll,
  type AssetSnapshot,
  type FlowDirection,
} from '@/domain/snapshot'

export type { BalanceEntryMode, BalanceHeadline, FlowDirection }

export function assetBalanceHeadline(
  asset: Pick<Asset, 'balanceHeadline'>,
): BalanceHeadline {
  return asset.balanceHeadline === 'given_spent' ? 'given_spent' : 'remaining'
}

export function snapshotsChronological(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
): AssetSnapshot[] {
  return snapshots
    .filter((snapshot) => snapshot.assetId === assetId)
    .slice()
    .sort((a, b) =>
      a.date === b.date
        ? a.createdAt.localeCompare(b.createdAt)
        : a.date.localeCompare(b.date),
    )
}

export function signedFlow(direction: FlowDirection, amount: number): number {
  const magnitude = Math.abs(amount)
  return direction === 'received' ? magnitude : -magnitude
}

/**
 * Net given from explicit given/received entries only (#280, #282).
 * `flow` on a snapshot is remaining-change from that mode (+ in / − out).
 * Untagged #279 same-day multi-line rows are counted once as a compat shim.
 * Single-day Остаток updates never count — that was the $40875 bug.
 */
export function cumulativeGivenSpent(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
): number {
  let netGiven = 0
  const tagged = new Set<string>()
  for (const row of snapshotsChronological(snapshots, assetId)) {
    if (row.flow === undefined) continue
    tagged.add(row.id)
    netGiven -= row.flow
  }
  const dates = new Set(
    snapshots
      .filter((row) => row.assetId === assetId)
      .map((row) => row.date),
  )
  for (const date of dates) {
    const day = snapshotsOnDateAll(snapshots, assetId, date)
    const untagged = day.filter((row) => row.flow === undefined)
    if (untagged.length < 2) continue
    for (const entry of sameDaySpendEntries(snapshots, assetId, date)) {
      if (tagged.has(entry.id) || entry.drop === 0) continue
      netGiven += entry.drop
    }
  }
  return netGiven
}

export function headlineNativeAmount(
  headline: BalanceHeadline,
  remaining: number | undefined,
  givenSpent: number,
): number | undefined {
  if (headline === 'given_spent') return givenSpent
  return remaining
}

export function updateBaselineAmount(
  onDate: Pick<AssetSnapshot, 'amount' | 'currency'> | undefined,
  previous: Pick<AssetSnapshot, 'amount' | 'currency'> | undefined,
  currency: string,
): number {
  const row = onDate ?? previous
  if (!row || row.currency !== currency) return 0
  return row.amount
}

export function applyBalanceEntry(
  mode: BalanceEntryMode,
  parsed: number,
  baseline: number,
): number {
  if (mode === 'new_balance') return parsed
  const magnitude = Math.abs(parsed)
  return mode === 'add' ? baseline + magnitude : baseline - magnitude
}

export type SpendLine = {
  amount: number
  direction?: FlowDirection
  note?: string
}

/** One remaining snapshot per line; given decreases, received increases (#279, #282). */
export function snapshotsFromSpendLines(
  baseline: number,
  lines: readonly SpendLine[],
): { remaining: number; flow: number; note?: string }[] {
  let remaining = baseline
  return lines.map((line) => {
    const direction = line.direction === 'received' ? 'received' : 'given'
    remaining = applyBalanceEntry(
      direction === 'received' ? 'add' : 'remove',
      line.amount,
      remaining,
    )
    const flow = signedFlow(direction, line.amount)
    return line.note ? { remaining, flow, note: line.note } : { remaining, flow }
  })
}
