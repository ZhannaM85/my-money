import { create } from 'zustand'
import { lookupRate, type RateTable } from '@/domain/fx'
import { IndexedDbFxRateRepository } from '@/infrastructure/persistence/indexeddb'
import {
  ensureFxRates,
  ensureFxRange,
  FrankfurterFxClient,
  type RateRequest,
} from '@/infrastructure/fx/frankfurter'

const fxRepository = new IndexedDbFxRateRepository()
const frankfurter = new FrankfurterFxClient()

interface FxStoreState {
  quotes: RateTable
  loading: boolean
  error?: string
  loadCached: () => Promise<void>
  ensureRates: (requests: readonly RateRequest[]) => Promise<void>
  ensureRange: (
    start: string,
    end: string,
    base: string,
    symbols: readonly string[],
  ) => Promise<void>
}

export const useFxStore = create<FxStoreState>((set) => ({
  quotes: [],
  loading: false,
  loadCached: async () => {
    const quotes = await fxRepository.getAll()
    set({ quotes })
  },
  ensureRates: async (requests) => {
    set({ loading: true, error: undefined })
    try {
      await ensureFxRates(requests, fxRepository, frankfurter)
      const quotes = await fxRepository.getAll()
      set({ quotes, loading: false })
    } catch {
      const quotes = await fxRepository.getAll()
      set({
        quotes,
        loading: false,
        error: 'cached_rates',
      })
    }
  },
  ensureRange: async (start, end, base, symbols) => {
    set({ loading: true, error: undefined })
    try {
      await ensureFxRange(start, end, base, symbols, fxRepository, frankfurter)
      const quotes = await fxRepository.getAll()
      set({ quotes, loading: false })
    } catch {
      const quotes = await fxRepository.getAll()
      set({
        quotes,
        loading: false,
        error: 'cached_rates',
      })
    }
  },
}))

export function rateOn(
  quotes: RateTable,
  from: string,
  to: string,
  date: string,
): number | undefined {
  return lookupRate(quotes, from, to, date)
}
