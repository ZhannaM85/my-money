import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lookupRate } from '@/domain/fx'
import {
  db,
  IndexedDbFxRateRepository,
} from '@/infrastructure/persistence/indexeddb'
import { addDaysIso } from '@/shared/lib/dates'
import { NbgFxClient } from './client'
import {
  ensureNbgRange,
  ensureNbgRates,
  NBG_RUNTIME_MAX_DAYS,
} from './ensureRates'

const repo = new IndexedDbFxRateRepository()

function nbgDay(usd = 2.6055, rub = 3.0866) {
  return [
    {
      date: '2026-09-29T00:00:00.000Z',
      currencies: [
        { code: 'USD', quantity: 1, rate: usd },
        { code: 'EUR', quantity: 1, rate: 2.9632 },
        { code: 'RUB', quantity: 100, rate: rub },
      ],
    },
  ]
}

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

beforeEach(async () => {
  await db.fxRates.clear()
})

describe('ensureNbgRates', () => {
  it('stores a missing USD→RUB day from NBG and reuses the cache', async () => {
    const fetchFn = fetching(nbgDay())
    const client = new NbgFxClient(fetchFn)

    const first = await ensureNbgRates(
      [
        { from: 'USD', to: 'USD', date: '2026-09-29' },
        { from: 'USD', to: 'RUB', date: '2026-09-29' },
        { from: 'USD', to: 'RUB', date: '2026-09-29' },
      ],
      repo,
      client,
    )

    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(lookupRate(first, 'USD', 'RUB', '2026-09-29')).toBeCloseTo(
      2.6055 / (3.0866 / 100),
      5,
    )

    await ensureNbgRates(
      [{ from: 'USD', to: 'RUB', date: '2026-09-29' }],
      repo,
      client,
    )
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('does not call NBG for pairs that are not RUB', async () => {
    const fetchFn = fetching(nbgDay())
    const client = new NbgFxClient(fetchFn)

    await ensureNbgRates(
      [{ from: 'USD', to: 'EUR', date: '2026-09-29' }],
      repo,
      client,
    )

    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('leaves dates outside the recent window to static history', async () => {
    const fetchFn = fetching(nbgDay())
    const client = new NbgFxClient(fetchFn)

    await ensureNbgRates(
      [
        { from: 'USD', to: 'RUB', date: '2020-01-01' },
        { from: 'USD', to: 'RUB', date: '2026-09-29' },
      ],
      repo,
      client,
    )

    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(String(fetchFn.mock.calls[0]?.[0])).toContain('date=2026-09-29')
  })
})

describe('ensureNbgRange', () => {
  it('fetches only missing days inside the live window', async () => {
    const fetchFn = fetching(nbgDay())
    const client = new NbgFxClient(fetchFn)
    await repo.put([
      { date: '2026-09-27', base: 'USD', quote: 'RUB', rate: 80 },
      { date: '2026-09-29', base: 'USD', quote: 'RUB', rate: 81 },
    ])

    const quotes = await ensureNbgRange(
      '2026-09-27',
      '2026-09-29',
      'RUB',
      ['USD'],
      repo,
      client,
    )

    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(String(fetchFn.mock.calls[0]?.[0])).toContain('date=2026-09-28')
    expect(lookupRate(quotes, 'USD', 'RUB', '2026-09-27')).toBe(80)
    expect(lookupRate(quotes, 'USD', 'RUB', '2026-09-28')).toBeCloseTo(
      2.6055 / (3.0866 / 100),
      5,
    )
    expect(lookupRate(quotes, 'USD', 'RUB', '2026-09-29')).toBe(81)
  })

  it('refetches the range end when force is set (#301)', async () => {
    const fetchFn = fetching(nbgDay(2.7, 3.1))
    const client = new NbgFxClient(fetchFn)
    await repo.put([
      { date: '2026-09-28', base: 'USD', quote: 'RUB', rate: 80 },
      { date: '2026-09-29', base: 'USD', quote: 'RUB', rate: 81 },
    ])

    await ensureNbgRange(
      '2026-09-28',
      '2026-09-29',
      'RUB',
      ['USD'],
      repo,
      client,
    )
    expect(fetchFn).not.toHaveBeenCalled()

    const quotes = await ensureNbgRange(
      '2026-09-28',
      '2026-09-29',
      'RUB',
      ['USD'],
      repo,
      client,
      { force: true },
    )

    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(String(fetchFn.mock.calls[0]?.[0])).toContain('date=2026-09-29')
    expect(lookupRate(quotes, 'USD', 'RUB', '2026-09-29')).toBeCloseTo(
      2.7 / (3.1 / 100),
      5,
    )
    expect(lookupRate(quotes, 'USD', 'RUB', '2026-09-28')).toBe(80)
  })

  it('caps a cold range at the recent window', async () => {
    const fetchFn = fetching(nbgDay())
    const client = new NbgFxClient(fetchFn)
    const end = '2026-09-29'

    await ensureNbgRange('2020-01-01', end, 'RUB', ['USD'], repo, client)

    expect(fetchFn).toHaveBeenCalledTimes(NBG_RUNTIME_MAX_DAYS)
    const dates = fetchFn.mock.calls
      .map((call) => new URL(String(call[0])).searchParams.get('date'))
      .sort()
    expect(dates[0]).toBe(addDaysIso(end, -(NBG_RUNTIME_MAX_DAYS - 1)))
    expect(dates.at(-1)).toBe(end)
  })

  it('does not call NBG when the range has no RUB', async () => {
    const fetchFn = fetching(nbgDay())
    const client = new NbgFxClient(fetchFn)

    await ensureNbgRange(
      '2026-09-28',
      '2026-09-29',
      'EUR',
      ['USD'],
      repo,
      client,
      { force: true },
    )

    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('keeps earlier live quotes when the newest day fails', async () => {
    const fetchFn = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('2026-09-29')) return jsonResponse({}, 503)
      return jsonResponse(nbgDay())
    })
    const client = new NbgFxClient(fetchFn)

    await expect(
      ensureNbgRange('2026-09-28', '2026-09-29', 'RUB', ['USD'], repo, client),
    ).rejects.toThrow(/latest requested date/)

    const stored = await repo.getAll()
    expect(lookupRate(stored, 'USD', 'RUB', '2026-09-28')).toBeCloseTo(
      2.6055 / (3.0866 / 100),
      5,
    )
    expect(lookupRate(stored, 'USD', 'RUB', '2026-09-29')).toBeUndefined()
  })
})
