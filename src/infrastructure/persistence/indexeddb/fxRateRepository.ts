import {
  lookupRate,
  type FxRateQuote,
  type FxRateRepository,
} from '@/domain/fx'
import { db } from './db'

export class IndexedDbFxRateRepository implements FxRateRepository {
  async getRate(
    from: string,
    to: string,
    date: string,
  ): Promise<number | undefined> {
    const quotes = await db.fxRates.where('date').equals(date).toArray()
    return lookupRate(quotes, from, to, date)
  }

  async getLatest(from: string, to: string): Promise<number | undefined> {
    if (from === to) return 1
    const quotes = await db.fxRates.toArray()
    if (quotes.length === 0) return undefined
    const latestDate = quotes.reduce(
      (max, quote) => (quote.date > max ? quote.date : max),
      quotes[0].date,
    )
    return lookupRate(quotes, from, to, latestDate)
  }

  async put(quotes: readonly FxRateQuote[]): Promise<void> {
    await db.fxRates.bulkPut([...quotes])
  }
}
