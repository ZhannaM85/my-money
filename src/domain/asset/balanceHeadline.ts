import type { Asset, BalanceEntryMode, BalanceHeadline } from './Asset'
import type { AssetSnapshot } from '@/domain/snapshot'

export type { BalanceEntryMode, BalanceHeadline }

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

/** Sum of same-currency drops between consecutive snapshots. */
export function cumulativeGivenSpent(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
): number {
  const rows = snapshotsChronological(snapshots, assetId)
  let given = 0
  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1]
    const current = rows[index]
    if (previous.currency !== current.currency) continue
    const drop = previous.amount - current.amount
    if (drop > 0) given += drop
  }
  return given
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
  note?: string
}

/** One remaining snapshot per spend, each decreasing the previous remaining (#279). */
export function snapshotsFromSpendLines(
  baseline: number,
  lines: readonly SpendLine[],
): { remaining: number; note?: string }[] {
  let remaining = baseline
  return lines.map((line) => {
    remaining = applyBalanceEntry('remove', line.amount, remaining)
    return line.note ? { remaining, note: line.note } : { remaining }
  })
}
