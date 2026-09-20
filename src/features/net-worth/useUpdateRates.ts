import { useState } from 'react'
import { useFxStore } from '@/stores/fxStore'
import { refreshFxRates } from './refreshFxRates'

export type RatesStatus = 'idle' | 'loading' | 'updated' | 'offline' | 'error'

/** Update rates lives in one place (#246) — More mounts the control (#256). */
export function useUpdateRates(
  start: string,
  chartEnd: string,
  baseCurrency: string,
  fxSymbols: readonly string[],
) {
  const lastFetchedAt = useFxStore((state) => state.lastFetchedAt)
  const fxLoading = useFxStore((state) => state.loading)
  const [ratesStatus, setRatesStatus] = useState<RatesStatus>('idle')

  const refreshRates = () => {
    void (async () => {
      setRatesStatus('loading')
      setRatesStatus(
        await refreshFxRates(start, chartEnd, baseCurrency, fxSymbols),
      )
    })()
  }

  return { ratesStatus, lastFetchedAt, fxLoading, refreshRates }
}
