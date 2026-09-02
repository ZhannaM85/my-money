import { describe, expect, it } from 'vitest'
import type { Asset } from '@/domain/asset'
import {
  describeCsvIssue,
  guessCsvMapping,
  mappingIsComplete,
  parseAmount,
  previewCsvImport,
} from './csvImport'
import { parseCsv } from './csvParse'

const now = '2026-08-17T00:00:00.000Z'

const revolut: Asset = {
  id: 'a1',
  name: 'Revolut',
  assetClass: 'money',
  type: 'bank',
  currency: 'EUR',
  trackingStatus: 'included',
  valuationMethod: 'account_balance',
  updateFrequency: 'weekly',
  createdAt: now,
  updatedAt: now,
}

const cash: Asset = {
  ...revolut,
  id: 'a2',
  name: 'Cash',
}

describe('guessCsvMapping', () => {
  it('maps the exported headers, preferring assetId over assetName', () => {
    const mapping = guessCsvMapping([
      'date',
      'assetId',
      'assetName',
      'amount',
      'currency',
      'assetClass',
      'type',
      'note',
    ])
    expect(mapping).toEqual({ date: 0, asset: 1, amount: 3, currency: 4 })
    expect(mappingIsComplete(mapping)).toBe(true)
  })

  it('accepts looser spreadsheet headers', () => {
    expect(
      guessCsvMapping(['As of', 'Name', 'Balance', 'CCY']),
    ).toEqual({ date: 0, asset: 1, amount: 2, currency: 3 })
  })
})

describe('previewCsvImport', () => {
  it('matches by id or name and reports unmatched rows instead of dropping them', () => {
    const rows = parseCsv(
      [
        'date,asset,amount,currency',
        '2026-08-17,a1,1000,EUR',
        '2026-08-18,Revolut,1100,eur',
        '2026-08-19,Unknown,50,EUR',
        'not-a-date,Cash,10,EUR',
        '2026-08-20,Cash,nope,EUR',
        '2026-08-21,,30,EUR',
      ].join('\n'),
    )
    const preview = previewCsvImport(
      rows,
      { date: 0, asset: 1, amount: 2, currency: 3 },
      [revolut, cash],
    )
    expect(preview.snapshots).toEqual([
      { assetId: 'a1', date: '2026-08-17', amount: 1000, currency: 'EUR' },
      { assetId: 'a1', date: '2026-08-18', amount: 1100, currency: 'EUR' },
    ])
    expect(preview.issues.map((issue) => issue.reason)).toEqual([
      'unmatched_asset',
      'invalid_date',
      'invalid_amount',
      'missing_field',
    ])
    expect(preview.issues[0]?.rowNumber).toBe(4)
    expect(describeCsvIssue(preview.issues[0]!)).toContain('no matching asset')
  })

  it('flags an ambiguous name instead of picking an asset', () => {
    const rows = parseCsv('date,asset,amount,currency\n2026-08-17,Cash,10,EUR')
    const preview = previewCsvImport(
      rows,
      { date: 0, asset: 1, amount: 2, currency: 3 },
      [cash, { ...cash, id: 'a3' }],
    )
    expect(preview.snapshots).toEqual([])
    expect(preview.issues).toEqual([
      { rowNumber: 2, reason: 'ambiguous_asset', asset: 'Cash' },
    ])
  })

  it('imports a note column when the export header is present (#194)', () => {
    const rows = parseCsv(
      'date,asset,amount,currency,note\n2026-08-17,a1,1000,EUR,Salary landed',
    )
    const preview = previewCsvImport(
      rows,
      { date: 0, asset: 1, amount: 2, currency: 3 },
      [revolut],
    )
    expect(preview.snapshots).toEqual([
      {
        assetId: 'a1',
        date: '2026-08-17',
        amount: 1000,
        currency: 'EUR',
        note: 'Salary landed',
      },
    ])
  })
})

describe('parseAmount', () => {
  it('accepts plain and thousands-separated numbers', () => {
    expect(parseAmount('1000.5')).toBe(1000.5)
    expect(parseAmount('1,000.50')).toBe(1000.5)
    expect(parseAmount('1000,5')).toBe(1000.5)
    expect(parseAmount('nope')).toBeUndefined()
  })
})
