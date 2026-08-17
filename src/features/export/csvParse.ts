/** UTF-8 BOM so Excel does not mangle names when the file is opened there. */
export const CSV_BOM = '\uFEFF'

export class InvalidCsvError extends Error {
  constructor(message = 'This file is not valid CSV.') {
    super(message)
    this.name = 'InvalidCsvError'
  }
}

export function csvField(value: string | number | undefined): string {
  if (value === undefined) return ''
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function csvRow(values: (string | number | undefined)[]): string {
  return values.map(csvField).join(',')
}

export function csvTable(
  header: (string | number | undefined)[],
  rows: (string | number | undefined)[][],
): string {
  return [csvRow(header), ...rows.map(csvRow)].join('\r\n')
}

export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\uFEFF/, '')
  if (input.trim() === '') {
    throw new InvalidCsvError('This file is empty.')
  }

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }
    if (char === '"') {
      inQuotes = true
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      continue
    }
    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }
    if (char === '\r') {
      continue
    }
    field += char
  }

  if (inQuotes) {
    throw new InvalidCsvError()
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const nonempty = rows.filter((cells) => cells.some((cell) => cell.trim() !== ''))
  if (nonempty.length === 0) {
    throw new InvalidCsvError('This file is empty.')
  }
  return nonempty
}
