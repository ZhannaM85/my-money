import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lookupRate } from '@/domain/fx'
import {
  db,
  IndexedDbFxRateRepository,
} from '@/infrastructure/persistence/indexeddb'
import { StaticRubRateClient } from './client'
import { ensureStaticRubRange, ensureStaticRubRates } from './ensureRates'

const repo = new IndexedDbFxRateRepository()

beforeEach(async () => {
  await db.fxRates.clear()
})

describe('ensureStaticRubRates', () => {
  it('loads a same-origin RUB series for direct conversions', async () => {
    const fetchFn = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          base: 'EUR',
          quote: 'RUB',
          quotes: [
            { date: '2026-08-17', rate: 98 },
            { date: '2026-08-18', rate: 100 },
          ],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    })
    const client = new StaticRubRateClient(fetchFn)

    const quotes = await ensureStaticRubRates(
      [{ from: 'RUB', to: 'EUR', date: '2026-08-18' }],
      repo,
      client,
    )

    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(String(fetchFn.mock.calls.at(0)?.at(0))).toContain('fx/rub/EUR.json')
    expect(lookupRate(quotes, 'RUB', 'EUR', '2026-08-18')).toBe(0.01)
  })

  it('loads the whole series once when a RUB date range is needed', async () => {
    const fetchFn = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          base: 'EUR',
          quote: 'RUB',
          quotes: [
            { date: '2026-08-14', rate: 98 },
            { date: '2026-08-15', rate: 98 },
            { date: '2026-08-16', rate: 98 },
          ],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    })
    const client = new StaticRubRateClient(fetchFn)

    const quotes = await ensureStaticRubRange(
      '2026-08-14',
      '2026-08-16',
      'EUR',
      ['RUB'],
      repo,
      client,
    )

    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(lookupRate(quotes, 'RUB', 'EUR', '2026-08-15')).toBeCloseTo(1 / 98)
  })

  it('refetches a cached RUB series when force is set (#186)', async () => {
    const fetchFn = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          base: 'EUR',
          quote: 'RUB',
          quotes: [
            { date: '2026-08-14', rate: 98 },
            { date: '2026-08-16', rate: 100 },
          ],
        }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    })
    const client = new StaticRubRateClient(fetchFn)

    await ensureStaticRubRange(
      '2026-08-14',
      '2026-08-16',
      'RUB',
      ['EUR'],
      repo,
      client,
    )
    expect(fetchFn).toHaveBeenCalledTimes(1)

    await ensureStaticRubRange(
      '2026-08-14',
      '2026-08-16',
      'RUB',
      ['EUR'],
      repo,
      client,
    )
    expect(fetchFn).toHaveBeenCalledTimes(1)

    await ensureStaticRubRange(
      '2026-08-14',
      '2026-08-16',
      'RUB',
      ['EUR'],
      repo,
      client,
      { force: true },
    )
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })
})
