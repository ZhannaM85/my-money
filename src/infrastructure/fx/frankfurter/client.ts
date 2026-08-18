import { z } from 'zod'
import type { FxRateQuote } from '@/domain/fx'
import { isoDatesInclusive } from '@/shared/lib/dates'
import { browserFetch } from '@/infrastructure/fx/browserFetch'
import { FRANKFURTER_API_BASE, isFrankfurterUnsupported } from './currencies'

const quoteRowSchema = z.object({
  date: z.string(),
  base: z.string(),
  quote: z.string(),
  rate: z.number(),
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

function parseQuoteRows(payload: unknown): FxRateQuote[] {
  const parsed = z.array(quoteRowSchema).safeParse(payload)
  if (!parsed.success) {
    throw new FrankfurterRequestError('Frankfurter response was not valid.')
  }
  return parsed.data
}

export class FrankfurterFxClient {
  private readonly fetchFn: typeof fetch

  constructor(fetchFn: typeof fetch = browserFetch) {
    this.fetchFn = fetchFn
  }

  async latest(
    base: string,
    symbols: readonly string[],
  ): Promise<FxRateQuote[]> {
    return this.request({ base, quotes: symbols })
  }

  async onDate(
    date: string,
    base: string,
    symbols: readonly string[],
  ): Promise<FxRateQuote[]> {
    return this.request({ date, base, quotes: symbols })
  }

  async timeseries(
    start: string,
    end: string,
    base: string,
    symbols: readonly string[],
  ): Promise<FxRateQuote[]> {
    const wanted = wantedSymbols(base, symbols)
    if (wanted.length === 0 || start > end) return []

    const rows = await this.request({
      from: start,
      to: end,
      base,
      quotes: wanted,
    })

    const quotes: FxRateQuote[] = []
    const byDate = new Map<string, FxRateQuote[]>()
    for (const row of rows) {
      const bucket = byDate.get(row.date) ?? []
      bucket.push(row)
      byDate.set(row.date, bucket)
    }

    let lastRates: Record<string, number> = {}
    for (const date of isoDatesInclusive(start, end)) {
      const dayRows = byDate.get(date)
      if (dayRows) {
        lastRates = Object.fromEntries(
          dayRows.map((row) => [row.quote, row.rate]),
        )
      }
      for (const [quote, rate] of Object.entries(lastRates)) {
        quotes.push({ date, base, quote, rate })
      }
    }
    return quotes
  }

  private async request(params: {
    date?: string
    from?: string
    to?: string
    base: string
    quotes: readonly string[]
  }): Promise<FxRateQuote[]> {
    const wanted = wantedSymbols(params.base, params.quotes)
    if (wanted.length === 0) return []

    const url = new URL(`${FRANKFURTER_API_BASE}/rates`)
    url.searchParams.set('base', params.base)
    url.searchParams.set('quotes', wanted.join(','))
    if (params.date) url.searchParams.set('date', params.date)
    if (params.from) url.searchParams.set('from', params.from)
    if (params.to) url.searchParams.set('to', params.to)

    const response = await this.fetchFn(url.toString())
    if (!response.ok) {
      throw new FrankfurterRequestError(
        `Frankfurter responded ${response.status}`,
      )
    }
    return parseQuoteRows(await response.json())
  }
}
