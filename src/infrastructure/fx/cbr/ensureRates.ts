import { lookupRate, type RateTable } from '@/domain/fx'
import type { FxRateRepository } from '@/domain/fx'
import { isoDatesInclusive } from '@/shared/lib/dates'
import type { RateRequest } from '@/infrastructure/fx/frankfurter/ensureRates'
import { uniqueRateRequests } from '@/infrastructure/fx/frankfurter/ensureRates'
import { CbrFxClient } from './client'

function needsCbr(request: RateRequest): boolean {
  return request.from === 'RUB' || request.to === 'RUB'
}

function foreignCodesForCbr(requests: readonly RateRequest[]): Set<string> {
  const codes = new Set<string>()
  for (const request of requests) {
    if (request.from !== 'RUB') codes.add(request.from)
    if (request.to !== 'RUB') codes.add(request.to)
  }
  codes.delete('RUB')
  return codes
}

export async function ensureCbrRates(
  requests: readonly RateRequest[],
  repository: FxRateRepository,
  client: CbrFxClient,
): Promise<RateTable> {
  const needed = uniqueRateRequests(requests).filter(needsCbr)
  if (needed.length === 0) return repository.getAll()

  const cached = await repository.getAll()
  const missingByDate = new Map<string, Set<string>>()

  for (const request of needed) {
    if (
      lookupRate(cached, request.from, request.to, request.date) !== undefined
    ) {
      continue
    }
    const group = missingByDate.get(request.date) ?? new Set<string>()
    for (const code of foreignCodesForCbr([request])) group.add(code)
    missingByDate.set(request.date, group)
  }

  const fetched = []
  for (const [date, codes] of missingByDate) {
    const dayQuotes = await client.onDate(date)
    for (const quote of dayQuotes) {
      if (quote.quote === 'RUB' && codes.has(quote.base)) {
        fetched.push(quote)
      }
    }
  }

  if (fetched.length > 0) {
    await repository.put(fetched)
  }
  return repository.getAll()
}

export async function ensureCbrRange(
  start: string,
  end: string,
  base: string,
  symbols: readonly string[],
  repository: FxRateRepository,
  client: CbrFxClient,
): Promise<RateTable> {
  const rubInvolved = base === 'RUB' || symbols.includes('RUB')
  if (!rubInvolved) return repository.getAll()

  const foreign = [...new Set([base, ...symbols].filter((code) => code !== 'RUB'))]
  if (foreign.length === 0) return repository.getAll()

  const cached = await repository.getAll()
  const missingDates = isoDatesInclusive(start, end).filter((date) =>
    foreign.some((code) => lookupRate(cached, code, 'RUB', date) === undefined),
  )
  if (missingDates.length === 0) return cached

  const fetched = []
  for (const date of missingDates) {
    const dayQuotes = await client.onDate(date)
    for (const quote of dayQuotes) {
      if (quote.quote === 'RUB' && foreign.includes(quote.base)) {
        fetched.push(quote)
      }
    }
  }
  if (fetched.length > 0) await repository.put(fetched)
  return repository.getAll()
}
