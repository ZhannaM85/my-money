import type { Asset, AssetRepository } from '@/domain/asset'
import { db } from './db'

export class IndexedDbAssetRepository implements AssetRepository {
  async getAll(): Promise<Asset[]> {
    return db.assets.toArray()
  }

  async getById(id: string): Promise<Asset | undefined> {
    return db.assets.get(id)
  }

  async upsert(asset: Asset): Promise<void> {
    await db.assets.put(asset)
  }

  async delete(id: string): Promise<void> {
    await db.assets.delete(id)
  }
}
