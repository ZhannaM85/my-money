import type { AssetSnapshot, SnapshotRepository } from '@/domain/snapshot'
import { db } from './db'

export class IndexedDbSnapshotRepository implements SnapshotRepository {
  async getByAsset(assetId: string): Promise<AssetSnapshot[]> {
    return db.snapshots.where('assetId').equals(assetId).sortBy('date')
  }

  async getLatestByAsset(assetId: string): Promise<AssetSnapshot | undefined> {
    const rows = await this.getByAsset(assetId)
    if (rows.length === 0) return undefined
    return rows.reduce((best, current) => {
      if (current.date > best.date) return current
      if (current.date < best.date) return best
      return current.createdAt > best.createdAt ? current : best
    })
  }

  async getOnOrBefore(
    assetId: string,
    date: string,
  ): Promise<AssetSnapshot | undefined> {
    const rows = await db.snapshots
      .where('assetId')
      .equals(assetId)
      .filter((snapshot) => snapshot.date <= date)
      .toArray()
    if (rows.length === 0) return undefined
    return rows.reduce((best, current) => {
      if (current.date > best.date) return current
      if (current.date < best.date) return best
      return current.createdAt > best.createdAt ? current : best
    })
  }

  async append(snapshot: AssetSnapshot): Promise<void> {
    await db.snapshots.add(snapshot)
  }

  async upsert(snapshot: AssetSnapshot): Promise<void> {
    await db.snapshots.put(snapshot)
  }

  async deleteById(id: string): Promise<void> {
    await db.snapshots.delete(id)
  }

  async deleteByAsset(assetId: string): Promise<void> {
    await db.snapshots.where('assetId').equals(assetId).delete()
  }
}
