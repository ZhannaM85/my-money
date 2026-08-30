import {
  shareOrDownloadFile,
  triggerBlobDownload,
} from '@/shared/lib/shareOrDownloadFile'
import { CSV_BOM } from './csvParse'

export function csvFilename(exportedAt = new Date().toISOString()): string {
  const day = exportedAt.slice(0, 10) || 'export'
  return `my-money-snapshots-${day}.csv`
}

export function downloadCsv(text: string, exportedAt?: string): void {
  triggerBlobDownload(
    new Blob([`${CSV_BOM}${text}`], {
      type: 'text/csv;charset=utf-8',
    }),
    csvFilename(exportedAt),
  )
}

export async function shareOrDownloadCsv(
  text: string,
  exportedAt?: string,
): Promise<'shared' | 'downloaded'> {
  const file = new File([`${CSV_BOM}${text}`], csvFilename(exportedAt), {
    type: 'text/csv',
  })
  return shareOrDownloadFile(file)
}
