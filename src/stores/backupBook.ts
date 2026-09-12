import type { AssetSnapshot } from '@/domain/snapshot'
import { IndexedDbSnapshotRepository } from '@/infrastructure/persistence/indexeddb'
import {
  bookHasAssets,
  clearBook,
  readBook,
  replaceBook,
} from '@/infrastructure/persistence/indexeddb/backupStore'

export { bookHasAssets, clearBook, readBook, replaceBook }

const snapshotRepository = new IndexedDbSnapshotRepository()

export async function appendSnapshots(
  snapshots: readonly Omit<AssetSnapshot, 'id' | 'createdAt'>[],
): Promise<void> {
  for (const snapshot of snapshots) {
    await snapshotRepository.append({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...snapshot,
    })
  }
}
