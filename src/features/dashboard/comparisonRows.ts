import type { HistoricalPoint, HoldingConversion } from '@/domain/netWorth'

export interface ComparisonRow {
  assetId: string
  name: string
  ownershipShare?: string
  byDate: Readonly<Record<string, HoldingConversion | undefined>>
}

/** Half a cent — treat FX noise as unchanged (#174). */
const ZERO_DELTA = 0.005

/**
 * Base-currency change of a later column vs the first (earliest) date.
 * Null when either side is missing, unconverted, or unchanged.
 */
export function comparisonDelta(
  current: HoldingConversion | undefined,
  baseline: HoldingConversion | undefined,
): number | null {
  if (
    current === undefined ||
    baseline === undefined ||
    !current.conversionAvailable ||
    !baseline.conversionAvailable ||
    current.convertedAmount === null ||
    baseline.convertedAmount === null
  ) {
    return null
  }
  const delta = current.convertedAmount - baseline.convertedAmount
  if (Math.abs(delta) < ZERO_DELTA) return null
  return delta
}

export function comparisonTotalDelta(
  current: number | undefined,
  baseline: number | undefined,
): number | null {
  if (current === undefined || baseline === undefined) return null
  const delta = current - baseline
  if (Math.abs(delta) < ZERO_DELTA) return null
  return delta
}

export function comparisonRows(
  points: readonly HistoricalPoint[],
): ComparisonRow[] {
  const byAsset = new Map<
    string,
    {
      name: string
      ownershipShare?: string
      byDate: Record<string, HoldingConversion | undefined>
    }
  >()
  for (const point of points) {
    for (const holding of point.holdings) {
      if (holding.excluded) continue
      let row = byAsset.get(holding.assetId)
      if (!row) {
        row = {
          name: holding.name,
          ...(holding.ownershipShare
            ? { ownershipShare: holding.ownershipShare }
            : {}),
          byDate: {},
        }
        byAsset.set(holding.assetId, row)
      }
      row.byDate[point.date] = holding
    }
  }
  return [...byAsset.entries()]
    .map(([assetId, row]) => ({
      assetId,
      name: row.name,
      ...(row.ownershipShare ? { ownershipShare: row.ownershipShare } : {}),
      byDate: row.byDate,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}
