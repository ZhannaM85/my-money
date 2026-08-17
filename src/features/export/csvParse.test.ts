import { describe, expect, it } from 'vitest'
import { CSV_BOM, csvField, InvalidCsvError, parseCsv } from './csvParse'

describe('parseCsv', () => {
  it('parses RFC 4180 quotes, commas, and a BOM', () => {
    const text = `${CSV_BOM}date,asset,note\r\n2026-08-17,"Revolut, EUR","He said ""hi"""\n`
    expect(parseCsv(text)).toEqual([
      ['date', 'asset', 'note'],
      ['2026-08-17', 'Revolut, EUR', 'He said "hi"'],
    ])
  })

  it('keeps newlines inside quoted fields', () => {
    expect(parseCsv('a,b\n"1\n2",3')).toEqual([
      ['a', 'b'],
      ['1\n2', '3'],
    ])
  })

  it('rejects empty files and unclosed quotes', () => {
    expect(() => parseCsv('')).toThrow(InvalidCsvError)
    expect(() => parseCsv('   \r\n  ')).toThrow(InvalidCsvError)
    expect(() => parseCsv('a,"b')).toThrow(InvalidCsvError)
  })
})

describe('csvField', () => {
  it('quotes fields that need it', () => {
    expect(csvField('plain')).toBe('plain')
    expect(csvField('a,b')).toBe('"a,b"')
    expect(csvField('say "hi"')).toBe('"say ""hi"""')
  })
})
