import { appendSnapshots, readBook } from '@/stores/backupBook'
import { buildSnapshotsCsv } from './csvExport'
import {
  mappingIsComplete,
  previewCsvImport,
  type CsvColumnMapping,
  type CsvImportPreview,
} from './csvImport'
import { InvalidCsvError, parseCsv } from './csvParse'

export { InvalidCsvError }
export type { CsvColumnMapping, CsvImportPreview }

export async function exportCsv(): Promise<string> {
  const { assets, snapshots } = await readBook()
  return buildSnapshotsCsv(assets, snapshots)
}

export async function importCsv(
  text: string,
  mapping: CsvColumnMapping,
): Promise<CsvImportPreview> {
  if (!mappingIsComplete(mapping)) {
    throw new InvalidCsvError('Map date, asset, amount, and currency first.')
  }
  const rows = parseCsv(text)
  const { assets } = await readBook()
  const preview = previewCsvImport(rows, mapping, assets)
  await appendSnapshots(preview.snapshots)
  return preview
}
