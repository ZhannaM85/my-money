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
        JSON.stringify({
          amount: 1,
          base: 'EUR',
          date: '2026-08-17',
          rates: { USD: 1.1 },
        }),
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
})
