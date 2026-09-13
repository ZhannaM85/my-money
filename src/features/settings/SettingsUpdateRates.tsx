import { useMemo } from 'react'
import { UpdateRates, useUpdateRates } from '@/features/net-worth'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'

/** Update rates lives on More so Dashboard can stay hero-first (#256). */
export function SettingsUpdateRates() {
  const snapshots = useAssetStore((state) => state.snapshots)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const today = todayIsoDate()
  const earliest = useMemo(() => {
    if (snapshots.length === 0) return today
    return snapshots.reduce(
      (min, snapshot) => (snapshot.date < min ? snapshot.date : min),
      snapshots[0].date,
    )
  }, [snapshots, today])
  const symbols = useMemo(
    () => [...new Set(snapshots.map((snapshot) => snapshot.currency))],
    [snapshots],
  )
  const rates = useUpdateRates(earliest, today, baseCurrency, symbols)

  return (
    <UpdateRates
      fxLoading={rates.fxLoading}
      ratesStatus={rates.ratesStatus}
      lastFetchedAt={rates.lastFetchedAt}
      onUpdateRates={rates.refreshRates}
    />
  )
}
