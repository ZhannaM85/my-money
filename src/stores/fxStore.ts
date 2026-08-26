import { create } from 'zustand'
import { lookupRate, mergeRateTables, type RateTable } from '@/domain/fx'
import type { FxRateQuote } from '@/domain/fx'
import {
  IndexedDbFxRateRepository,
  IndexedDbManualFxRateRepository,
} from '@/infrastructure/persistence/indexeddb'
import {
  ensureFxRates,
  ensureFxRange,
  FrankfurterFxClient,
  type RateRequest,
} from '@/infrastructure/fx/frankfurter'
import { fxDebug } from '@/infrastructure/fx/fxDebug'
import { shouldFetchFrankfurter } from '@/features/dashboard/dashboardFx'
import {
  ensureStaticRubRates,
  ensureStaticRubRange,
  StaticRubRateClient,
} from '@/infrastructure/fx/rubStatic'

const fxRepository = new IndexedDbFxRateRepository()
const manualRepository = new IndexedDbManualFxRateRepository()
const frankfurter = new FrankfurterFxClient()
const staticRub = new StaticRubRateClient()

async function loadMergedQuotes(): Promise<{
  quotes: RateTable
  manualQuotes: RateTable
}> {
  const [system, manualQuotes] = await Promise.all([
    fxRepository.getAll(),
    manualRepository.getAll(),
  ])
  return {
    quotes: mergeRateTables(system, manualQuotes),
    manualQuotes,
  }
}

interface FxStoreState {
  quotes: RateTable
  manualQuotes: RateTable
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
  saveManualRates: (quotes: readonly FxRateQuote[]) => Promise<void>
  clearManualRatesForDate: (date: string) => Promise<void>
}

export const useFxStore = create<FxStoreState>((set) => ({
  quotes: [],
  manualQuotes: [],
  loading: false,
  loadCached: async () => {
    const { quotes, manualQuotes } = await loadMergedQuotes()
    fxDebug('loadCached', {
      systemAndManual: quotes.length,
      manual: manualQuotes.length,
    })
    set({ quotes, manualQuotes })
  },
  ensureRates: async (requests) => {
    set({ loading: true, error: undefined })
    let failed = false
    fxDebug('ensureRates start', { requests: [...requests] })
    const online =
      typeof navigator === 'undefined' ? true : navigator.onLine
    if (shouldFetchFrankfurter(online)) {
      try {
        await ensureFxRates(requests, fxRepository, frankfurter)
      } catch (error) {
        failed = true
        fxDebug('ensureRates frankfurter failed', { error: String(error) })
      }
    } else {
      fxDebug('ensureRates skipped frankfurter while offline')
    }
    try {
      await ensureStaticRubRates(requests, fxRepository, staticRub)
    } catch (error) {
      failed = true
      fxDebug('ensureRates static RUB failed', { error: String(error) })
    }
    const { quotes, manualQuotes } = await loadMergedQuotes()
    fxDebug('ensureRates done', {
      quoteCount: quotes.length,
      manualCount: manualQuotes.length,
      failed,
    })
    set({
      quotes,
      manualQuotes,
      loading: false,
      error: failed ? 'cached_rates' : undefined,
    })
  },
  ensureRange: async (start, end, base, symbols) => {
    set({ loading: true, error: undefined })
    let failed = false
    fxDebug('ensureRange start', { start, end, base, symbols: [...symbols] })
    const online =
      typeof navigator === 'undefined' ? true : navigator.onLine
    if (shouldFetchFrankfurter(online)) {
      try {
        await ensureFxRange(start, end, base, symbols, fxRepository, frankfurter)
      } catch (error) {
        failed = true
        fxDebug('ensureRange frankfurter failed', { error: String(error) })
      }
    } else {
      fxDebug('ensureRange skipped frankfurter while offline')
    }
    try {
      await ensureStaticRubRange(
        start,
        end,
        base,
        symbols,
        fxRepository,
        staticRub,
      )
    } catch (error) {
      failed = true
      fxDebug('ensureRange static RUB failed', { error: String(error) })
    }
    const { quotes, manualQuotes } = await loadMergedQuotes()
    fxDebug('ensureRange done', {
      quoteCount: quotes.length,
      manualCount: manualQuotes.length,
      failed,
    })
    set({
      quotes,
      manualQuotes,
      loading: false,
      error: failed ? 'cached_rates' : undefined,
    })
  },
  saveManualRates: async (quotes) => {
    await manualRepository.put(quotes)
    const merged = await loadMergedQuotes()
    fxDebug('saveManualRates', { saved: quotes.length })
    set({ quotes: merged.quotes, manualQuotes: merged.manualQuotes })
  },
  clearManualRatesForDate: async (date) => {
    await manualRepository.clearDate(date)
    const merged = await loadMergedQuotes()
    fxDebug('clearManualRatesForDate', { date })
    set({ quotes: merged.quotes, manualQuotes: merged.manualQuotes })
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
