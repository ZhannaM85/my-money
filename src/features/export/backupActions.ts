import { buildBackupBundle, type BackupBundle } from '@/domain/backup'
import {
  bookHasAssets,
  clearBook,
  readBook,
  replaceBook,
} from '@/stores/backupBook'
import { FX_LAST_FETCHED_KEY } from '@/stores/fxStore'
import { parseBackupJson } from './backupSchema'

export async function exportBackup(): Promise<BackupBundle> {
  const { settings, assets, snapshots, fxRates, manualFxRates } =
    await readBook()
  return buildBackupBundle(
    settings,
    assets,
    snapshots,
    new Date().toISOString(),
    fxRates,
    manualFxRates,
  )
}

export async function importBackupJson(text: string): Promise<BackupBundle> {
  const bundle = parseBackupJson(text)
  await replaceBook(bundle)
  return bundle
}

export async function deleteAllLocalData(): Promise<void> {
  await clearBook()
  try {
    localStorage.removeItem(FX_LAST_FETCHED_KEY)
  } catch {
    // Private mode: IndexedDB wipe still stands.
  }
}

export { bookHasAssets }
export { parseBackupJson, InvalidBackupError } from './backupSchema'
