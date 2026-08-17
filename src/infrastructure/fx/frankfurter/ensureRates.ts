import { lookupRate, type FxRateQuote, type RateTable } from '@/domain/fx'
import type { FxRateRepository } from '@/domain/fx'
import { FrankfurterFxClient } from './client'
import { isFrankfurterUnsupported } from './currencies'

export interface RateRequest {
  from: string
  to: string
  date: string
}

export function uniqueRateRequests(
  requests: readonly RateRequest[],
): RateRequest[] {
  const seen = new Set<string>()
  const unique: RateRequest[] = []
  for (const request of requests) {
    if (request.from === request.to) continue
    const key = `${request.date}:${request.from}:${request.to}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(request)
  }
  return unique
}

export async function ensureFxRates(
  requests: readonly RateRequest[],
  repository: FxRateRepository,
  client: FrankfurterFxClient,
): Promise<RateTable> {
  const needed = uniqueRateRequests(requests)
  const cached = await repository.getAll()
  const missingByDate = new Map<string, { to: string; symbols: Set<string> }>()

  for (const request of needed) {
    if (
      isFrankfurterUnsupported(request.from) ||
      isFrankfurterUnsupported(request.to)
    ) {
      continue
    }
    if (
      lookupRate(cached, request.from, request.to, request.date) !== undefined
    ) {
      continue
    }
    const key = `${request.date}:${request.to}`
    const group = missingByDate.get(key) ?? {
      to: request.to,
      symbols: new Set<string>(),
    }
    group.symbols.add(request.from)
    missingByDate.set(key, group)
  }

  const fetched: FxRateQuote[] = []
  for (const [key, group] of missingByDate) {
    const date = key.slice(0, 10)
    const quotes = await client.onDate(date, group.to, [...group.symbols])
    fetched.push(...quotes)
  }
  if (fetched.length > 0) {
    await repository.put(fetched)
  }
  return repository.getAll()
}
