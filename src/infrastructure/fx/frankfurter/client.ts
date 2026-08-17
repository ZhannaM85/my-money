import { z } from 'zod'
import type { FxRateQuote } from '@/domain/fx'
import { isoDatesInclusive } from '@/shared/lib/dates'
import { FRANKFURTER_API_BASE, isFrankfurterUnsupported } from './currencies'

const frankfurterResponseSchema = z.object({
  amount: z.number(),
  base: z.string(),
  date: z.string(),
  rates: z.record(z.string(), z.number()),
})

const timeseriesResponseSchema = z.object({
  amount: z.number(),
  base: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  rates: z.record(z.string(), z.record(z.string(), z.number())),
})

export class FrankfurterRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FrankfurterRequestError'
  }
}

function wantedSymbols(base: string, symbols: readonly string[]): string[] {
  if (isFrankfurterUnsupported(base)) return []
  return [
    ...new Set(
      symbols.filter(
        (code) => code !== base && !isFrankfurterUnsupported(code),
      ),
    ),
  ]
}

function quotesFromResponse(
  requestedDate: string,
  payload: z.infer<typeof frankfurterResponseSchema>,
): FxRateQuote[] {
  const quotes: FxRateQuote[] = []
  for (const [quote, rate] of Object.entries(payload.rates)) {
    quotes.push({
      date: requestedDate,
      base: payload.base,
      quote,
      rate,
    })
    if (payload.date !== requestedDate) {
      quotes.push({
        date: payload.date,
        base: payload.base,
        quote,
        rate,
      })
    }
  }
  return quotes
}

export class FrankfurterFxClient {
  private readonly fetchFn: typeof fetch

  constructor(fetchFn: typeof fetch = fetch) {
    this.fetchFn = fetchFn
  }

  async latest(
    base: string,
    symbols: readonly string[],
  ): Promise<FxRateQuote[]> {
    return this.request('latest', base, symbols)
  }

  async onDate(
    date: string,
    base: string,
    symbols: readonly string[],
  ): Promise<FxRateQuote[]> {
    return this.request(date, base, symbols)
  }

  async timeseries(
    start: string,
    end: string,
    base: string,
    symbols: readonly string[],
  ): Promise<FxRateQuote[]> {
    const wanted = wantedSymbols(base, symbols)
    if (wanted.length === 0 || start > end) return []

    const url = new URL(`${FRANKFURTER_API_BASE}/${start}..${end}`)
    url.searchParams.set('base', base)
    url.searchParams.set('symbols', wanted.join(','))

    const response = await this.fetchFn(url.toString())
    if (!response.ok) {
      throw new FrankfurterRequestError(
        `Frankfurter responded ${response.status}`,
      )
    }
    const parsed = timeseriesResponseSchema.safeParse(await response.json())
    if (!parsed.success) {
      throw new FrankfurterRequestError('Frankfurter response was not valid.')
    }

    const quotes: FxRateQuote[] = []
    let lastRates: Record<string, number> = {}
    for (const date of isoDatesInclusive(start, end)) {
      const dayRates = parsed.data.rates[date]
      if (dayRates) lastRates = dayRates
      for (const [quote, rate] of Object.entries(lastRates)) {
        quotes.push({ date, base: parsed.data.base, quote, rate })
      }
    }
    return quotes
  }

  private async request(
    path: string,
    base: string,
    symbols: readonly string[],
  ): Promise<FxRateQuote[]> {
    const wanted = wantedSymbols(base, symbols)
    if (wanted.length === 0) return []

    const url = new URL(`${FRANKFURTER_API_BASE}/${path}`)
    url.searchParams.set('base', base)
    url.searchParams.set('symbols', wanted.join(','))

    const response = await this.fetchFn(url.toString())
    if (!response.ok) {
      throw new FrankfurterRequestError(
        `Frankfurter responded ${response.status}`,
      )
    }
    const parsed = frankfurterResponseSchema.safeParse(await response.json())
    if (!parsed.success) {
      throw new FrankfurterRequestError('Frankfurter response was not valid.')
    }
    const requestedDate = path === 'latest' ? parsed.data.date : path
    return quotesFromResponse(requestedDate, parsed.data)
  }
}
