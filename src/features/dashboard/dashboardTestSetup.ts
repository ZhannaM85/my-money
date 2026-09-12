import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { resetChartRangeStore } from '@/stores/chartRangeStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { FX_LAST_FETCHED_KEY, useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'

export async function resetDashboardStores() {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  await db.fxRates.clear()
  await db.manualFxRates.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useFxStore.setState({
    ...useFxStore.getState(),
    quotes: [],
    manualQuotes: [],
    loading: false,
    error: undefined,
    lastFetchedAt: undefined,
  })
  localStorage.removeItem(FX_LAST_FETCHED_KEY)
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: false,
  })
  useComparisonStore.setState({ dates: [] })
  resetChartRangeStore()
}
