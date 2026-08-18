import { describe, expect, it, vi } from 'vitest'
import { lookupRate } from '@/domain/fx'
import { CbrFxClient, quotesFromCbrXml } from './client'

const sampleXml = `<?xml version="1.0" encoding="windows-1251"?>
<ValCurs Date="18.08.2026" name="Foreign Currency Market">
  <Valute ID="R01239">
    <NumCode>978</NumCode>
    <CharCode>EUR</CharCode>
    <Nominal>1</Nominal>
    <Name>Euro</Name>
    <Value>98,1234</Value>
  </Valute>
  <Valute ID="R01235">
    <NumCode>840</NumCode>
    <CharCode>USD</CharCode>
    <Nominal>1</Nominal>
    <Name>US Dollar</Name>
    <Value>80,5000</Value>
  </Valute>
</ValCurs>`

describe('quotesFromCbrXml', () => {
  it('parses foreign currency rates against RUB', () => {
    const quotes = quotesFromCbrXml('2026-08-18', sampleXml)
    expect(quotes).toEqual([
      { date: '2026-08-18', base: 'EUR', quote: 'RUB', rate: 98.1234 },
      { date: '2026-08-18', base: 'USD', quote: 'RUB', rate: 80.5 },
    ])
    expect(lookupRate(quotes, 'RUB', 'EUR', '2026-08-18')).toBeCloseTo(
      1 / 98.1234,
    )
  })
})

describe('CbrFxClient', () => {
  it('requests the CBR daily endpoint for a date', async () => {
    const fetchFn = vi.fn(async () => new Response(sampleXml))
    const client = new CbrFxClient(fetchFn)
    const quotes = await client.onDate('2026-08-18')
    const calls = fetchFn.mock.calls as unknown as [string][]
    expect(decodeURIComponent(calls[0][0])).toContain('date_req=18/08/2026')
    expect(quotes.some((quote) => quote.base === 'EUR')).toBe(true)
  })
})
