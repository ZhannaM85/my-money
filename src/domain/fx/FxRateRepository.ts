import type { FxRateQuote } from './convertAmount'

export interface FxRateRepository {
  getRate(from: string, to: string, date: string): Promise<number | undefined>
  getLatest(from: string, to: string): Promise<number | undefined>
  put(quotes: readonly FxRateQuote[]): Promise<void>
}
