import { CSV_BOM } from './csvParse'

export function csvFilename(exportedAt = new Date().toISOString()): string {
  const day = exportedAt.slice(0, 10) || 'export'
  return `my-money-snapshots-${day}.csv`
}

export function downloadCsv(text: string, exportedAt?: string): void {
  const blob = new Blob([`${CSV_BOM}${text}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = csvFilename(exportedAt)
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
