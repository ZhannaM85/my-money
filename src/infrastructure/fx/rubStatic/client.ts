import { z } from 'zod'
import type { FxRateQuote } from '@/domain/fx'
import { fxDebug } from '@/infrastructure/fx/fxDebug'

const staticRubSeriesSchema = z.object({
  base: z.string(),
  quote: z.literal('RUB'),
  source: z.string().optional(),
  quotes: z.array(
    z.object({
      date: z.string(),
      rate: z.number(),
    }),
  ),
})

export class StaticRubRateRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StaticRubRateRequestError'
  }
}

export class StaticRubRateClient {
  private readonly fetchFn: typeof fetch

  constructor(fetchFn: typeof fetch = fetch) {
    this.fetchFn = fetchFn
  }

  async onCode(code: string): Promise<FxRateQuote[]> {
    const url = `${import.meta.env.BASE_URL}fx/rub/${code}.json`
    fxDebug('static RUB fetch start', { code, url })
    const response = await this.fetchFn(url)
    if (!response.ok) {
      fxDebug('static RUB fetch failed', { code, url, status: response.status })
      throw new StaticRubRateRequestError(
        `Static RUB rates responded ${response.status}`,
      )
    }
    const parsed = staticRubSeriesSchema.safeParse(await response.json())
    if (!parsed.success) {
      fxDebug('static RUB parse failed', { code, url })
      throw new StaticRubRateRequestError('Static RUB rates were not valid.')
    }
    fxDebug('static RUB fetch ok', {
      code,
      url,
      source: parsed.data.source,
      quoteCount: parsed.data.quotes.length,
      first: parsed.data.quotes[0],
      last: parsed.data.quotes.at(-1),
    })
    return parsed.data.quotes.map((quote) => ({
      date: quote.date,
      base: parsed.data.base,
      quote: parsed.data.quote,
      rate: quote.rate,
    }))
  }
}
