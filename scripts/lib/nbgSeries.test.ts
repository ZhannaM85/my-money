import { describe, expect, it } from 'vitest'
import {
  crossToRub,
  gelPerUnit,
  quotesFromNbgPayload,
} from './nbgSeries.mjs'

describe('nbgSeries', () => {
  it('applies quantity when computing GEL per unit', () => {
    expect(gelPerUnit(3.0686, 100)).toBeCloseTo(0.030686)
    expect(gelPerUnit(3.0315, 1)).toBeCloseTo(3.0315)
  })

  it('crosses EUR and RUB via GEL', () => {
    const eurToRub = crossToRub(gelPerUnit(3.0315, 1), gelPerUnit(3.0686, 100))
    expect(eurToRub).toBeCloseTo(3.0315 / 0.030686, 5)
  })

  it('builds CODE→RUB quotes from an NBG day payload', () => {
    const payload = [
      {
        date: '2026-08-18T00:00:00.000Z',
        currencies: [
          { code: 'EUR', quantity: 1, rate: 3.0315 },
          { code: 'RUB', quantity: 100, rate: 3.0686 },
          { code: 'USD', quantity: 1, rate: 2.7 },
        ],
      },
    ]
    const quotes = quotesFromNbgPayload(payload, '2026-08-18', ['EUR', 'USD'])
    expect(quotes).toHaveLength(2)
    expect(quotes[0]).toMatchObject({
      date: '2026-08-18',
      base: 'EUR',
      quote: 'RUB',
    })
    expect(quotes[0].rate).toBeCloseTo(3.0315 / 0.030686, 5)
    expect(quotes[1].base).toBe('USD')
  })
})
