import { create } from 'zustand'
import { lookupRate, type RateTable } from '@/domain/fx'
import { IndexedDbFxRateRepository } from '@/infrastructure/persistence/indexeddb'
import {
  ensureFxRates,
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
      const quotes = await ensureFxRates(requests, fxRepository, frankfurter)
      set({ quotes, loading: false })
    } catch {
      const quotes = await fxRepository.getAll()
      set({
        quotes,
        loading: false,
        error: 'Could not refresh reference rates.',
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
