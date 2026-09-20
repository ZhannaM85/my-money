import { useMemo } from 'react'
import {
  fxRefreshWindow,
  UpdateRates,
  useUpdateRates,
} from '@/features/net-worth'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'

/** Update rates lives on More so Dashboard can stay hero-first (#256). */
export function SettingsUpdateRates() {
  const snapshots = useAssetStore((state) => state.snapshots)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const today = todayIsoDate()
  const { start, symbols } = useMemo(
    () => fxRefreshWindow(snapshots, today),
    [snapshots, today],
  )
  const rates = useUpdateRates(start, today, baseCurrency, symbols)

  return (
    <UpdateRates
      fxLoading={rates.fxLoading}
      ratesStatus={rates.ratesStatus}
      lastFetchedAt={rates.lastFetchedAt}
      onUpdateRates={rates.refreshRates}
    />
  )
}
