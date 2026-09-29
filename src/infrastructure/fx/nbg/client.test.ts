import { describe, expect, it, vi } from 'vitest'
import { NbgFxClient, NbgRequestError } from './client'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function fetching(body: unknown, status = 200) {
  return vi.fn(async (input: RequestInfo | URL) => {
    expect(new URL(String(input)).hostname).toBe('nbg.gov.ge')
    return jsonResponse(body, status)
  })
}

const day = {
  date: '2026-09-29T00:00:00.000Z',
  currencies: [
    { code: 'USD', quantity: 1, rate: 2.6055 },
    { code: 'EUR', quantity: 1, rate: 2.9632 },
    { code: 'RUB', quantity: 100, rate: 3.0866 },
  ],
}

describe('NbgFxClient', () => {
  it('crosses CODE→RUB via GEL and sends only the date', async () => {
    const fetchFn = fetching([day])
    const client = new NbgFxClient(fetchFn)

    const quotes = await client.onDate('2026-09-29', ['USD', 'RUB', 'USD'])

    expect(fetchFn).toHaveBeenCalledTimes(1)
    const url = String(fetchFn.mock.calls[0]?.[0])
    expect(url).toBe(
      'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/?date=2026-09-29',
    )
    expect(url).not.toMatch(/amount|name|asset/i)
    expect(quotes).toHaveLength(1)
    expect(quotes[0]).toMatchObject({
      date: '2026-09-29',
      base: 'USD',
      quote: 'RUB',
    })
    expect(quotes[0]?.rate).toBeCloseTo(2.6055 / (3.0866 / 100), 5)
  })

  it('inverts the RUB row for GEL→RUB', async () => {
    const fetchFn = fetching([day])
    const client = new NbgFxClient(fetchFn)

    const quotes = await client.onDate('2026-09-29', ['GEL'])

    expect(quotes[0]?.rate).toBeCloseTo(100 / 3.0866, 5)
  })

  it('throws when NBG responds with an error status', async () => {
    const fetchFn = fetching({}, 503)
    const client = new NbgFxClient(fetchFn)

    await expect(client.onDate('2026-09-29', ['USD'])).rejects.toBeInstanceOf(
      NbgRequestError,
    )
  })
})
