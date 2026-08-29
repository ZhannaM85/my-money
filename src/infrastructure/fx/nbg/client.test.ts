import { describe, expect, it, vi } from 'vitest'
import {
  crossToRub,
  gelPerUnit,
  NbgFxClient,
  quotesFromNbgDay,
} from './client'

describe('nbg client', () => {
  it('crosses EUR→RUB via GEL with quantity', () => {
    const rate = crossToRub(gelPerUnit(3.0315, 1), gelPerUnit(3.0686, 100))
    expect(rate).toBeCloseTo(3.0315 / 0.030686, 5)
  })

  it('emits GEL→RUB by inverting the RUB row with quantity (#127)', () => {
    const quotes = quotesFromNbgDay(
      '2026-08-29',
      [
        {
          currencies: [{ code: 'RUB', quantity: 100, rate: 3.0496 }],
        },
      ],
      ['GEL'],
    )
    expect(quotes).toEqual([
      {
        date: '2026-08-29',
        base: 'GEL',
        quote: 'RUB',
        rate: expect.closeTo(100 / 3.0496, 5),
      },
    ])
  })

  it('parses an NBG day payload into CODE→RUB quotes', () => {
    const quotes = quotesFromNbgDay(
      '2026-08-18',
      [
        {
          currencies: [
            { code: 'EUR', quantity: 1, rate: 3.0315 },
            { code: 'RUB', quantity: 100, rate: 3.0686 },
          ],
        },
      ],
      ['EUR'],
    )
    expect(quotes).toEqual([
      {
        date: '2026-08-18',
        base: 'EUR',
        quote: 'RUB',
        rate: expect.closeTo(3.0315 / 0.030686, 5),
      },
    ])
  })

  it('requests the historical NBG endpoint for a date', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          currencies: [
            { code: 'EUR', quantity: 1, rate: 3 },
            { code: 'RUB', quantity: 100, rate: 3 },
          ],
        },
      ],
    })
    const client = new NbgFxClient(fetchFn)
    const quotes = await client.onDate('2026-08-01', ['EUR'])
    expect(String(fetchFn.mock.calls[0]?.[0])).toContain('date=2026-08-01')
    expect(quotes[0]?.rate).toBeCloseTo(100)
  })
})
