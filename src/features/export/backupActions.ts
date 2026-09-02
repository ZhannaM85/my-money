import { buildBackupBundle, type BackupBundle } from '@/domain/backup'
import {
  readBook,
  replaceBook,
} from '@/infrastructure/persistence/indexeddb/backupStore'
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

export { parseBackupJson, InvalidBackupError } from './backupSchema'
