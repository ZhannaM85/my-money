import type { Asset } from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import { csvTable } from './csvParse'

export const CSV_HEADERS = [
  'date',
  'assetId',
  'assetName',
  'amount',
  'currency',
  'assetClass',
  'type',
] as const

export function buildSnapshotsCsv(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
): string {
  const byId = new Map(assets.map((asset) => [asset.id, asset]))
  const sorted = [...snapshots].sort((left, right) => {
    const byDate = left.date.localeCompare(right.date)
    if (byDate !== 0) return byDate
    const leftName = byId.get(left.assetId)?.name ?? left.assetId
    const rightName = byId.get(right.assetId)?.name ?? right.assetId
    return leftName.localeCompare(rightName)
  })
  return csvTable(
    [...CSV_HEADERS],
    sorted.map((snapshot) => {
      const asset = byId.get(snapshot.assetId)
      return [
        snapshot.date,
        snapshot.assetId,
        asset?.name ?? '',
        snapshot.amount,
        snapshot.currency,
        asset?.assetClass ?? '',
        asset?.type ?? '',
      ]
    }),
  )
}
