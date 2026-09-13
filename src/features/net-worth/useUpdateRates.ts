import { useState } from 'react'
import { useFxStore } from '@/stores/fxStore'

export type RatesStatus = 'idle' | 'loading' | 'updated' | 'offline' | 'error'

/** Update rates lives in one place (#246) — Dashboard renders the control. */
export function useUpdateRates(
  start: string,
  chartEnd: string,
  baseCurrency: string,
  fxSymbols: readonly string[],
) {
  const ensureRange = useFxStore((state) => state.ensureRange)
  const markRatesFetched = useFxStore((state) => state.markRatesFetched)
  const lastFetchedAt = useFxStore((state) => state.lastFetchedAt)
  const fxLoading = useFxStore((state) => state.loading)
  const [ratesStatus, setRatesStatus] = useState<RatesStatus>('idle')

  const refreshRates = () => {
    void (async () => {
      setRatesStatus('loading')
      const online = typeof navigator === 'undefined' ? true : navigator.onLine
      await ensureRange(start, chartEnd, baseCurrency, fxSymbols, {
        force: true,
      })
      if (!online) {
        setRatesStatus('offline')
        return
      }
      if (useFxStore.getState().error) {
        setRatesStatus('error')
        return
      }
      markRatesFetched()
      setRatesStatus('updated')
    })()
  }

  return { ratesStatus, lastFetchedAt, fxLoading, refreshRates }
}
