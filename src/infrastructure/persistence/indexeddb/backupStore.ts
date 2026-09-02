import { db } from './db'
import { IndexedDbSettingsRepository } from './settingsRepository'
import type { BackupBundle } from '@/domain/backup'
import { DEFAULT_SETTINGS, SETTINGS_ID } from '@/domain/settings'

const settingsRepository = new IndexedDbSettingsRepository()

export async function readBook(): Promise<{
  settings: BackupBundle['settings']
  assets: BackupBundle['assets']
  snapshots: BackupBundle['snapshots']
  fxRates: BackupBundle['fxRates']
  manualFxRates: BackupBundle['manualFxRates']
}> {
  const [settings, assets, snapshots, fxRates, manualFxRates] =
    await Promise.all([
      settingsRepository.get(),
      db.assets.toArray(),
      db.snapshots.toArray(),
      db.fxRates.toArray(),
      db.manualFxRates.toArray(),
    ])
  return { settings, assets, snapshots, fxRates, manualFxRates }
}

export async function bookHasAssets(): Promise<boolean> {
  return (await db.assets.count()) > 0
}

export async function clearBook(): Promise<void> {
  await db.transaction(
    'rw',
    db.settings,
    db.assets,
    db.snapshots,
    db.fxRates,
    db.manualFxRates,
    async () => {
      await db.assets.clear()
      await db.snapshots.clear()
      await db.fxRates.clear()
      await db.manualFxRates.clear()
      const current = await settingsRepository.get()
      await db.settings.put({
        ...current,
        onboardingCompleted: false,
        assetListOrder: [],
        updatedAt: new Date().toISOString(),
      })
    },
  )
}

export async function replaceBook(bundle: BackupBundle): Promise<void> {
  await db.transaction(
    'rw',
    db.settings,
    db.assets,
    db.snapshots,
    db.fxRates,
    db.manualFxRates,
    async () => {
      await db.assets.clear()
      await db.snapshots.clear()
      await db.fxRates.clear()
      await db.manualFxRates.clear()
      await db.settings.put({
        ...DEFAULT_SETTINGS,
        ...bundle.settings,
        id: SETTINGS_ID,
      })
      if (bundle.assets.length > 0) await db.assets.bulkPut(bundle.assets)
      if (bundle.snapshots.length > 0) {
        await db.snapshots.bulkPut(bundle.snapshots)
      }
      if (bundle.fxRates.length > 0) await db.fxRates.bulkPut(bundle.fxRates)
      if (bundle.manualFxRates.length > 0) {
        await db.manualFxRates.bulkPut(bundle.manualFxRates)
      }
    },
  )
}
