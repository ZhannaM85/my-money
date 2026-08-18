import { create } from 'zustand'
import { lookupRate, type RateTable } from '@/domain/fx'
import { IndexedDbFxRateRepository } from '@/infrastructure/persistence/indexeddb'
import {
  ensureFxRates,
  ensureFxRange,
  FrankfurterFxClient,
  type RateRequest,
} from '@/infrastructure/fx/frankfurter'
import {
  ensureStaticRubRates,
  ensureStaticRubRange,
  StaticRubRateClient,
} from '@/infrastructure/fx/rubStatic'

const fxRepository = new IndexedDbFxRateRepository()
const frankfurter = new FrankfurterFxClient()
const staticRub = new StaticRubRateClient()

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
    let failed = false
    try {
      await ensureFxRates(requests, fxRepository, frankfurter)
    } catch {
      failed = true
    }
    try {
      await ensureStaticRubRates(requests, fxRepository, staticRub)
    } catch {
      failed = true
    }
    const quotes = await fxRepository.getAll()
    set({
      quotes,
      loading: false,
      error: failed ? 'cached_rates' : undefined,
    })
  },
  ensureRange: async (start, end, base, symbols) => {
    set({ loading: true, error: undefined })
    let failed = false
    try {
      await ensureFxRange(start, end, base, symbols, fxRepository, frankfurter)
    } catch {
      failed = true
    }
    try {
      await ensureStaticRubRange(start, end, base, symbols, fxRepository, staticRub)
    } catch {
      failed = true
    }
    const quotes = await fxRepository.getAll()
    set({
      quotes,
      loading: false,
      error: failed ? 'cached_rates' : undefined,
    })
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
