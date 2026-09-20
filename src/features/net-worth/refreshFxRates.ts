import { useCallback } from 'react'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'

export type FxRefreshResult = 'updated' | 'offline' | 'error'

/** Earliest snapshot date + distinct currencies — same window More Update rates uses. */
export function fxRefreshWindow(
  snapshots: readonly { date: string; currency: string }[],
  today: string,
): { start: string; symbols: string[] } {
  const start =
    snapshots.length === 0
      ? today
      : snapshots.reduce(
          (min, snapshot) => (snapshot.date < min ? snapshot.date : min),
          snapshots[0].date,
        )
  const symbols = [...new Set(snapshots.map((snapshot) => snapshot.currency))]
  return { start, symbols }
}

/** Intentional FX refresh (#186, #254): force-fetch quotes, then stamp last-updated. */
export async function refreshFxRates(
  start: string,
  end: string,
  baseCurrency: string,
  symbols: readonly string[],
): Promise<FxRefreshResult> {
  const online = typeof navigator === 'undefined' ? true : navigator.onLine
  await useFxStore.getState().ensureRange(start, end, baseCurrency, symbols, {
    force: true,
  })
  if (!online) return 'offline'
  if (useFxStore.getState().error) return 'error'
  useFxStore.getState().markRatesFetched()
  return 'updated'
}

/** Pull-to-refresh uses this so the gesture shares the More Update rates path (#254). */
export function useRefreshFxRates(): () => Promise<FxRefreshResult> {
  const snapshots = useAssetStore((state) => state.snapshots)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)

  return useCallback(async () => {
    const today = todayIsoDate()
    const { start, symbols } = fxRefreshWindow(snapshots, today)
    return refreshFxRates(start, today, baseCurrency, symbols)
  }, [baseCurrency, snapshots])
}
