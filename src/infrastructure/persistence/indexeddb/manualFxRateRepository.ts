import type { FxRateQuote } from '@/domain/fx'
import { db } from './db'

export class IndexedDbManualFxRateRepository {
  async getAll(): Promise<FxRateQuote[]> {
    return db.manualFxRates.toArray()
  }

  async getForDate(date: string): Promise<FxRateQuote[]> {
    return db.manualFxRates.where('date').equals(date).toArray()
  }

  async put(quotes: readonly FxRateQuote[]): Promise<void> {
    await db.manualFxRates.bulkPut([...quotes])
  }

  async clearDate(date: string): Promise<void> {
    await db.manualFxRates.where('date').equals(date).delete()
  }
}
