import type { FxRateQuote } from '@/domain/fx'
import { browserFetch } from '@/infrastructure/fx/browserFetch'
import { fxDebug } from '@/infrastructure/fx/fxDebug'
import {
  nbgUrlForDate,
  quotesFromNbgPayload,
} from '../../../../scripts/lib/nbgSeries.mjs'

export class NbgRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NbgRequestError'
  }
}

/** Live National Bank of Georgia day table. Codes are filtered locally; the request sends only the date. */
export class NbgFxClient {
  private readonly fetchFn: typeof fetch

  constructor(fetchFn: typeof fetch = browserFetch) {
    this.fetchFn = fetchFn
  }

  async onDate(
    date: string,
    targetCodes: readonly string[],
  ): Promise<FxRateQuote[]> {
    const codes = [...new Set(targetCodes.filter((code) => code !== 'RUB'))]
    if (codes.length === 0) return []

    const url = nbgUrlForDate(date)
    fxDebug('nbg fetch start', { date, url, codes })
    const response = await this.fetchFn(url)
    if (!response.ok) {
      fxDebug('nbg fetch failed', { date, url, status: response.status })
      throw new NbgRequestError(`NBG responded ${response.status}`)
    }

    const quotes = quotesFromNbgPayload(await response.json(), date, codes)
    fxDebug('nbg fetch ok', { date, quoteCount: quotes.length })
    return quotes
  }
}
