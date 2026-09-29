import {
  lookupRate,
  type FxRateQuote,
  type FxRateRepository,
  type RateTable,
} from '@/domain/fx'
import type { RateRequest } from '@/infrastructure/fx/frankfurter'
import { uniqueRateRequests } from '@/infrastructure/fx/frankfurter'
import { fxDebug } from '@/infrastructure/fx/fxDebug'
import { addDaysIso, isoDatesInclusive } from '@/shared/lib/dates'
import { NbgFxClient, NbgRequestError } from './client'

/**
 * Live NBG covers the recent tail (days since the last static deploy).
 * Multi-year history stays on `public/fx/rub`.
 */
export const NBG_RUNTIME_MAX_DAYS = 45

const NBG_CONCURRENCY = 6

function liveWindowStart(end: string): string {
  return addDaysIso(end, -(NBG_RUNTIME_MAX_DAYS - 1))
}

function inLiveWindow(date: string, end: string): boolean {
  return date >= liveWindowStart(end) && date <= end
}

function foreignCode(from: string, to: string): string | undefined {
  if (from === 'RUB' && to !== 'RUB') return to
  if (to === 'RUB' && from !== 'RUB') return from
  return undefined
}

async function mapPool(
  items: readonly string[],
  limit: number,
  worker: (item: string) => Promise<void>,
): Promise<void> {
  let next = 0
  async function run(): Promise<void> {
    while (next < items.length) {
      const index = next
      next += 1
      const item = items[index]
      if (item === undefined) return
      await worker(item)
    }
  }
  const workers = Math.min(limit, items.length)
  if (workers === 0) return
  await Promise.all(Array.from({ length: workers }, () => run()))
}

interface FetchResult {
  quotes: FxRateQuote[]
  newestFailed: boolean
}

async function fetchDates(
  dates: readonly string[],
  codesForDate: (date: string) => readonly string[],
  client: NbgFxClient,
): Promise<FetchResult> {
  const quotes: FxRateQuote[] = []
  const failures: string[] = []
  await mapPool(dates, NBG_CONCURRENCY, async (date) => {
    try {
      quotes.push(...(await client.onDate(date, codesForDate(date))))
    } catch (error) {
      failures.push(date)
      fxDebug('nbg date failed', { date, error: String(error) })
    }
  })

  const newest = dates[dates.length - 1]
  if (quotes.length === 0 && failures.length > 0) {
    throw new NbgRequestError(`NBG failed for ${failures[0]}`)
  }
  return {
    quotes,
    newestFailed: newest !== undefined && failures.includes(newest),
  }
}

async function storeQuotes(
  repository: FxRateRepository,
  result: FetchResult,
): Promise<RateTable> {
  if (result.quotes.length > 0) await repository.put(result.quotes)
  if (result.newestFailed) {
    throw new NbgRequestError('NBG failed for the latest requested date')
  }
  return repository.getAll()
}

export async function ensureNbgRates(
  requests: readonly RateRequest[],
  repository: FxRateRepository,
  client: NbgFxClient,
): Promise<RateTable> {
  const needed = uniqueRateRequests(requests).filter(
    (request) => foreignCode(request.from, request.to) !== undefined,
  )
  if (needed.length === 0) return repository.getAll()

  const end = needed.reduce(
    (max, request) => (request.date > max ? request.date : max),
    needed[0]!.date,
  )
  const cached = await repository.getAll()
  const missingByDate = new Map<string, Set<string>>()

  for (const request of needed) {
    if (!inLiveWindow(request.date, end)) continue
    if (
      lookupRate(cached, request.from, request.to, request.date) !== undefined
    ) {
      continue
    }
    const code = foreignCode(request.from, request.to)
    if (!code) continue
    const codes = missingByDate.get(request.date) ?? new Set<string>()
    codes.add(code)
    missingByDate.set(request.date, codes)
  }

  const dates = [...missingByDate.keys()].sort()
  fxDebug('ensureNbgRates', { needed: needed.length, dates })
  if (dates.length === 0) return cached

  const result = await fetchDates(
    dates,
    (date) => [...(missingByDate.get(date) ?? [])],
    client,
  )
  fxDebug('ensureNbgRates stored', { quoteCount: result.quotes.length })
  return storeQuotes(repository, result)
}

export async function ensureNbgRange(
  start: string,
  end: string,
  base: string,
  symbols: readonly string[],
  repository: FxRateRepository,
  client: NbgFxClient,
  options?: { force?: boolean },
): Promise<RateTable> {
  const rubInvolved = base === 'RUB' || symbols.includes('RUB')
  if (!rubInvolved || start > end) return repository.getAll()

  const foreign = [
    ...new Set([base, ...symbols].filter((code) => code !== 'RUB')),
  ]
  if (foreign.length === 0) return repository.getAll()

  const cached = await repository.getAll()
  const windowStart =
    start > liveWindowStart(end) ? start : liveWindowStart(end)
  const missing = isoDatesInclusive(windowStart, end).filter((date) =>
    foreign.some((code) => lookupRate(cached, code, 'RUB', date) === undefined),
  )
  const toFetch = new Set(missing)
  if (options?.force) toFetch.add(end)
  const dates = [...toFetch].sort()

  fxDebug('ensureNbgRange', {
    start,
    end,
    base,
    symbols: [...symbols],
    force: Boolean(options?.force),
    dates,
  })
  if (dates.length === 0) return cached

  const result = await fetchDates(dates, () => foreign, client)
  fxDebug('ensureNbgRange stored', { quoteCount: result.quotes.length })
  return storeQuotes(repository, result)
}
