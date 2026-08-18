import { describe, expect, it, vi } from 'vitest'
import { FrankfurterFxClient } from './client'
import { FRANKFURTER_API_BASE } from './currencies'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('FrankfurterFxClient', () => {
  it('fetches latest and historical quotes without sending user data', async () => {
    const fetchFn = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      expect(url.startsWith(FRANKFURTER_API_BASE)).toBe(true)
      expect(url).not.toMatch(/Revolut|1000|asset/i)
      if (!url.includes('date=')) {
        return jsonResponse([
          { date: '2026-08-17', base: 'EUR', quote: 'USD', rate: 1.1 },
        ])
      }
      return jsonResponse([
        { date: '2026-08-16', base: 'EUR', quote: 'USD', rate: 1.08 },
      ])
    })
    const client = new FrankfurterFxClient(fetchFn)

    const latest = await client.latest('EUR', ['USD', 'EUR', 'RUB'])
    expect(latest).toEqual([
      { date: '2026-08-17', base: 'EUR', quote: 'USD', rate: 1.1 },
    ])
    expect(String(fetchFn.mock.calls[0][0])).toContain('quotes=USD')
    expect(String(fetchFn.mock.calls[0][0])).not.toContain('RUB')

    const historical = await client.onDate('2026-08-16', 'EUR', ['USD', 'RUB'])
    expect(historical).toEqual([
      { date: '2026-08-16', base: 'EUR', quote: 'USD', rate: 1.08 },
    ])
  })

  it('does not call the network for same-currency-only or RUB requests', async () => {
    const fetchFn = vi.fn()
    const client = new FrankfurterFxClient(fetchFn)
    expect(await client.latest('EUR', ['EUR'])).toEqual([])
    expect(await client.latest('RUB', ['USD'])).toEqual([])
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('fill-forwards weekend gaps in a timeseries', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse([
        { date: '2026-08-14', base: 'EUR', quote: 'USD', rate: 1.08 },
      ]),
    )
    const client = new FrankfurterFxClient(fetchFn)
    const quotes = await client.timeseries('2026-08-14', '2026-08-16', 'EUR', [
      'USD',
    ])
    expect(quotes.map((quote) => quote.date)).toEqual([
      '2026-08-14',
      '2026-08-15',
      '2026-08-16',
    ])
    expect(quotes.every((quote) => quote.rate === 1.08)).toBe(true)
  })
})
