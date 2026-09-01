import { lookupRate, type RateTable } from '@/domain/fx'
import type { FxRateRepository } from '@/domain/fx'
import type { RateRequest } from '@/infrastructure/fx/frankfurter'
import { uniqueRateRequests } from '@/infrastructure/fx/frankfurter'
import { fxDebug } from '@/infrastructure/fx/fxDebug'
import { StaticRubRateClient } from './client'

function needsStaticRub(request: RateRequest): boolean {
  return request.from === 'RUB' || request.to === 'RUB'
}

function foreignCodesForRub(requests: readonly RateRequest[]): string[] {
  return [
    ...new Set(
      requests.flatMap((request) =>
        [request.from, request.to].filter((code) => code !== 'RUB'),
      ),
    ),
  ]
}

export async function ensureStaticRubRates(
  requests: readonly RateRequest[],
  repository: FxRateRepository,
  client: StaticRubRateClient,
): Promise<RateTable> {
  const needed = uniqueRateRequests(requests).filter(needsStaticRub)
  if (needed.length === 0) return repository.getAll()

  const cached = await repository.getAll()
  const codes = foreignCodesForRub(
    needed.filter(
      (request) =>
        lookupRate(cached, request.from, request.to, request.date) === undefined,
    ),
  )
  fxDebug('ensureStaticRubRates', {
    needed: needed.length,
    missingCodes: codes,
  })
  if (codes.length === 0) return cached

  const fetched = await Promise.all(codes.map((code) => client.onCode(code)))
  const quotes = fetched.flat()
  if (quotes.length > 0) {
    await repository.put(quotes)
  }
  fxDebug('ensureStaticRubRates stored', { quoteCount: quotes.length })
  return repository.getAll()
}

export async function ensureStaticRubRange(
  start: string,
  end: string,
  base: string,
  symbols: readonly string[],
  repository: FxRateRepository,
  client: StaticRubRateClient,
  options?: { force?: boolean },
): Promise<RateTable> {
  const rubInvolved = base === 'RUB' || symbols.includes('RUB')
  if (!rubInvolved) return repository.getAll()

  const foreign = [...new Set([base, ...symbols].filter((code) => code !== 'RUB'))]
  if (foreign.length === 0) return repository.getAll()

  const cached = await repository.getAll()
  const missingForeign = foreign.filter(
    (code) =>
      lookupRate(cached, code, 'RUB', start) === undefined ||
      lookupRate(cached, code, 'RUB', end) === undefined,
  )
  const toFetch = options?.force ? foreign : missingForeign
  fxDebug('ensureStaticRubRange', {
    start,
    end,
    base,
    symbols,
    missingForeign,
    force: Boolean(options?.force),
    toFetch,
  })
  if (toFetch.length === 0) return cached

  const fetched = await Promise.all(
    toFetch.map((code) => client.onCode(code)),
  )
  const quotes = fetched.flat()
  if (quotes.length > 0) {
    await repository.put(quotes)
  }
  fxDebug('ensureStaticRubRange stored', { quoteCount: quotes.length })
  return repository.getAll()
}
