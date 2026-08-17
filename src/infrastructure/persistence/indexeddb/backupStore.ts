import { db } from './db'
import { IndexedDbSettingsRepository } from './settingsRepository'
import type { BackupBundle } from '@/domain/backup'
import { DEFAULT_SETTINGS, SETTINGS_ID } from '@/domain/settings'

const settingsRepository = new IndexedDbSettingsRepository()

export async function readBook(): Promise<{
  settings: BackupBundle['settings']
  assets: BackupBundle['assets']
  snapshots: BackupBundle['snapshots']
}> {
  const [settings, assets, snapshots] = await Promise.all([
    settingsRepository.get(),
    db.assets.toArray(),
    db.snapshots.toArray(),
  ])
  return { settings, assets, snapshots }
}

export async function bookHasAssets(): Promise<boolean> {
  return (await db.assets.count()) > 0
}

export async function replaceBook(bundle: BackupBundle): Promise<void> {
  await db.transaction('rw', db.settings, db.assets, db.snapshots, async () => {
    await db.assets.clear()
    await db.snapshots.clear()
    await db.settings.put({
      ...DEFAULT_SETTINGS,
      ...bundle.settings,
      id: SETTINGS_ID,
    })
    if (bundle.assets.length > 0) await db.assets.bulkPut(bundle.assets)
    if (bundle.snapshots.length > 0) {
      await db.snapshots.bulkPut(bundle.snapshots)
    }
  })
}
