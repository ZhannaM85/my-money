import type { Asset } from './Asset'

export interface AssetRepository {
  getAll(): Promise<Asset[]>
  getById(id: string): Promise<Asset | undefined>
  upsert(asset: Asset): Promise<void>
  delete(id: string): Promise<void>
}
