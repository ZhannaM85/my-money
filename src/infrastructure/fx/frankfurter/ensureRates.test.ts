import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  db,
  IndexedDbFxRateRepository,
} from '@/infrastructure/persistence/indexeddb'
import { FrankfurterFxClient } from './client'
import { ensureFxRates } from './ensureRates'

const repo = new IndexedDbFxRateRepository()

beforeEach(async () => {
  await db.fxRates.clear()
})

describe('ensureFxRates', () => {
  it('skips same-currency pairs and reuses the IndexedDB cache', async () => {
    const fetchFn = vi.fn(async () => {
      return new Response(
        JSON.stringify([
          { date: '2026-08-17', base: 'EUR', quote: 'USD', rate: 1.1 },
        ]),
        { headers: { 'Content-Type': 'application/json' } },
      )
    })
    const client = new FrankfurterFxClient(fetchFn)

    const first = await ensureFxRates(
      [
        { from: 'EUR', to: 'EUR', date: '2026-08-17' },
        { from: 'USD', to: 'EUR', date: '2026-08-17' },
        { from: 'USD', to: 'EUR', date: '2026-08-17' },
      ],
      repo,
      client,
    )
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(first.some((quote) => quote.quote === 'USD')).toBe(true)

    await ensureFxRates(
      [{ from: 'USD', to: 'EUR', date: '2026-08-17' }],
      repo,
      client,
    )
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('leaves RUB conversions to the static same-origin dataset', async () => {
    const fetchFn = vi.fn(async () => {
      return new Response(
        JSON.stringify([
          { date: '2026-08-18', base: 'EUR', quote: 'RUB', rate: 100 },
        ]),
        { headers: { 'Content-Type': 'application/json' } },
      )
    })
    const client = new FrankfurterFxClient(fetchFn)

    const quotes = await ensureFxRates(
      [{ from: 'RUB', to: 'EUR', date: '2026-08-18' }],
      repo,
      client,
    )

    expect(fetchFn).not.toHaveBeenCalled()
    expect(quotes).toEqual([])
  })
})
