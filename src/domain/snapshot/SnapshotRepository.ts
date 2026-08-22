import type { AssetSnapshot } from './AssetSnapshot'

export interface SnapshotRepository {
  getByAsset(assetId: string): Promise<AssetSnapshot[]>
  getLatestByAsset(assetId: string): Promise<AssetSnapshot | undefined>
  getOnOrBefore(
    assetId: string,
    date: string,
  ): Promise<AssetSnapshot | undefined>
  append(snapshot: AssetSnapshot): Promise<void>
  upsert(snapshot: AssetSnapshot): Promise<void>
  deleteById(id: string): Promise<void>
  deleteByAsset(assetId: string): Promise<void>
}
