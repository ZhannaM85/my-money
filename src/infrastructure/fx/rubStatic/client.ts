import { z } from 'zod'
import type { FxRateQuote } from '@/domain/fx'

const staticRubSeriesSchema = z.object({
  base: z.string(),
  quote: z.literal('RUB'),
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
    const response = await this.fetchFn(url)
    if (!response.ok) {
      throw new StaticRubRateRequestError(
        `Static RUB rates responded ${response.status}`,
      )
    }
    const parsed = staticRubSeriesSchema.safeParse(await response.json())
    if (!parsed.success) {
      throw new StaticRubRateRequestError('Static RUB rates were not valid.')
    }
    return parsed.data.quotes.map((quote) => ({
      date: quote.date,
      base: parsed.data.base,
      quote: parsed.data.quote,
      rate: quote.rate,
    }))
  }
}
