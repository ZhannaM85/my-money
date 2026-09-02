import { buildBackupBundle, type BackupBundle } from '@/domain/backup'
import {
  bookHasAssets,
  readBook,
  replaceBook,
} from '@/infrastructure/persistence/indexeddb/backupStore'
import { parseBackupJson } from './backupSchema'

export class BookNotEmptyError extends Error {
  constructor() {
    super(
      'Import only restores into an empty book. Export first if you need a copy of what is here.',
    )
    this.name = 'BookNotEmptyError'
  }
}

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
  if (await bookHasAssets()) {
    throw new BookNotEmptyError()
  }
  await replaceBook(bundle)
  return bundle
}

export { parseBackupJson, InvalidBackupError } from './backupSchema'
