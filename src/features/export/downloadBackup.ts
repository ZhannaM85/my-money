export function backupFilename(exportedAt: string): string {
  const day = exportedAt.slice(0, 10) || 'backup'
  return `my-money-backup-${day}.json`
}

export function downloadBackupJson(bundle: { exportedAt: string }): void {
  const json = JSON.stringify(bundle, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = backupFilename(bundle.exportedAt)
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
