import {
  shareOrDownloadFile,
  triggerBlobDownload,
} from '@/shared/lib/shareOrDownloadFile'

export function backupFilename(exportedAt: string): string {
  const day = exportedAt.slice(0, 10) || 'backup'
  return `my-money-backup-${day}.json`
}

export function downloadBackupJson(bundle: { exportedAt: string }): void {
  const json = JSON.stringify(bundle, null, 2)
  triggerBlobDownload(
    new Blob([json], { type: 'application/json' }),
    backupFilename(bundle.exportedAt),
  )
}

export async function shareOrDownloadBackupJson(bundle: {
  exportedAt: string
}): Promise<'shared' | 'downloaded'> {
  const json = JSON.stringify(bundle, null, 2)
  const file = new File([json], backupFilename(bundle.exportedAt), {
    type: 'application/json',
  })
  return shareOrDownloadFile(file)
}
