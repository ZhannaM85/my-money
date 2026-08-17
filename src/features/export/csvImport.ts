import type { Asset } from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import type { Dictionary } from '@/i18n/Dictionary'
import { en } from '@/i18n/en'

export const CSV_FIELDS = ['date', 'asset', 'amount', 'currency'] as const
export type CsvField = (typeof CSV_FIELDS)[number]
export type CsvColumnMapping = Record<CsvField, number>

export type CsvRowIssueReason =
  | 'missing_field'
  | 'invalid_date'
  | 'invalid_amount'
  | 'unmatched_asset'
  | 'ambiguous_asset'

export interface CsvRowIssue {
  rowNumber: number
  reason: CsvRowIssueReason
  asset?: string
}

export interface CsvImportPreview {
  snapshots: Omit<AssetSnapshot, 'id' | 'createdAt'>[]
  issues: CsvRowIssue[]
}

const DATE_KEYS = new Set(['date', 'asof', 'asofdate', 'snapshotdate'])
const ASSET_KEYS = new Set(['asset', 'assetname', 'name', 'assetid', 'id'])
const AMOUNT_KEYS = new Set(['amount', 'value', 'balance'])
const CURRENCY_KEYS = new Set(['currency', 'ccy', 'curr'])
const FIELD_KEYS: Record<CsvField, Set<string>> = {
  date: DATE_KEYS,
  asset: ASSET_KEYS,
  amount: AMOUNT_KEYS,
  currency: CURRENCY_KEYS,
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

export function guessCsvMapping(headers: string[]): Partial<CsvColumnMapping> {
  const mapping: Partial<CsvColumnMapping> = {}
  const used = new Set<number>()
  for (const field of CSV_FIELDS) {
    const index = headers.findIndex(
      (header, column) =>
        !used.has(column) && FIELD_KEYS[field].has(normalizeHeader(header)),
    )
    if (index >= 0) {
      mapping[field] = index
      used.add(index)
    }
  }
  return mapping
}

export function mappingIsComplete(
  mapping: Partial<CsvColumnMapping>,
): mapping is CsvColumnMapping {
  return CSV_FIELDS.every((field) => Number.isInteger(mapping[field]))
}

export function parseIsoDate(raw: string): string | undefined {
  const trimmed = raw.trim().slice(0, 10)
  return ISO_DATE.test(trimmed) ? trimmed : undefined
}

export function parseAmount(raw: string): number | undefined {
  const trimmed = raw.trim().replace(/\s/g, '')
  if (trimmed === '') return undefined
  const normalized = trimmed.includes('.')
    ? trimmed.replace(/,/g, '')
    : trimmed.replace(',', '.')
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : undefined
}

function resolveAsset(
  value: string,
  assets: readonly Asset[],
): Asset | CsvRowIssueReason {
  const trimmed = value.trim()
  if (trimmed === '') return 'missing_field'
  const byId = assets.find((asset) => asset.id === trimmed)
  if (byId) return byId
  const nameMatches = assets.filter(
    (asset) => asset.name.toLowerCase() === trimmed.toLowerCase(),
  )
  if (nameMatches.length === 1) return nameMatches[0]
  if (nameMatches.length > 1) return 'ambiguous_asset'
  return 'unmatched_asset'
}

function cell(row: string[], index: number): string {
  return row[index] ?? ''
}

export function previewCsvImport(
  rows: string[][],
  mapping: CsvColumnMapping,
  assets: readonly Asset[],
): CsvImportPreview {
  const snapshots: Omit<AssetSnapshot, 'id' | 'createdAt'>[] = []
  const issues: CsvRowIssue[] = []
  const data = rows.slice(1)

  for (let i = 0; i < data.length; i += 1) {
    const row = data[i]
    const rowNumber = i + 2
    const dateRaw = cell(row, mapping.date)
    const assetRaw = cell(row, mapping.asset)
    const amountRaw = cell(row, mapping.amount)
    const currencyRaw = cell(row, mapping.currency)

    if (
      dateRaw.trim() === '' &&
      assetRaw.trim() === '' &&
      amountRaw.trim() === '' &&
      currencyRaw.trim() === ''
    ) {
      continue
    }

    if (
      dateRaw.trim() === '' ||
      assetRaw.trim() === '' ||
      amountRaw.trim() === '' ||
      currencyRaw.trim() === ''
    ) {
      issues.push({
        rowNumber,
        reason: 'missing_field',
        asset: assetRaw.trim() || undefined,
      })
      continue
    }

    const date = parseIsoDate(dateRaw)
    if (!date) {
      issues.push({ rowNumber, reason: 'invalid_date', asset: assetRaw.trim() })
      continue
    }

    const amount = parseAmount(amountRaw)
    if (amount === undefined) {
      issues.push({
        rowNumber,
        reason: 'invalid_amount',
        asset: assetRaw.trim(),
      })
      continue
    }

    const resolved = resolveAsset(assetRaw, assets)
    if (typeof resolved === 'string') {
      issues.push({ rowNumber, reason: resolved, asset: assetRaw.trim() })
      continue
    }

    snapshots.push({
      assetId: resolved.id,
      date,
      amount,
      currency: currencyRaw.trim().toUpperCase(),
    })
  }

  return { snapshots, issues }
}

export function describeCsvIssue(
  issue: CsvRowIssue,
  t: Dictionary = en,
): string {
  const who = issue.asset ? ` (${issue.asset})` : ''
  switch (issue.reason) {
    case 'missing_field':
      return t.csv.issue.missingField(issue.rowNumber, who)
    case 'invalid_date':
      return t.csv.issue.invalidDate(issue.rowNumber, who)
    case 'invalid_amount':
      return t.csv.issue.invalidAmount(issue.rowNumber, who)
    case 'unmatched_asset':
      return t.csv.issue.unmatchedAsset(issue.rowNumber, who)
    case 'ambiguous_asset':
      return t.csv.issue.ambiguousAsset(issue.rowNumber, who)
  }
}
