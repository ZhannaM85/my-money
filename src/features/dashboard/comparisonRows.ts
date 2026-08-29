import type { HistoricalPoint, HoldingConversion } from '@/domain/netWorth'

export interface ComparisonRow {
  assetId: string
  name: string
  byDate: Readonly<Record<string, HoldingConversion | undefined>>
}

export function comparisonRows(
  points: readonly HistoricalPoint[],
): ComparisonRow[] {
  const byAsset = new Map<string, { name: string; byDate: Record<string, HoldingConversion | undefined> }>()
  for (const point of points) {
    for (const holding of point.holdings) {
      let row = byAsset.get(holding.assetId)
      if (!row) {
        row = { name: holding.name, byDate: {} }
        byAsset.set(holding.assetId, row)
      }
      row.byDate[point.date] = holding
    }
  }
  return [...byAsset.entries()]
    .map(([assetId, row]) => ({
      assetId,
      name: row.name,
      byDate: row.byDate,
    }))
    .sort((left, right) => left.name.localeCompare(right.name))
}
