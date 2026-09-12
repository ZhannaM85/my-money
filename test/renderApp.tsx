import 'fake-indexeddb/auto'
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { resetChartRangeStore } from '@/stores/chartRangeStore'
import {
  COMPARISON_STORAGE_KEY,
  useComparisonStore,
} from '@/stores/comparisonStore'
import { FX_LAST_FETCHED_KEY, useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { applyTheme, useThemeStore } from '@/stores/themeStore'

const THEME_STORAGE_KEY = 'my-money-theme'

/** Clear IndexedDB tables and restore Zustand stores to defaults. */
export async function resetAppStores() {
  await Promise.all([
    db.assets.clear(),
    db.snapshots.clear(),
    db.settings.clear(),
    db.fxRates.clear(),
    db.manualFxRates.clear(),
  ])
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
  localStorage.removeItem(COMPARISON_STORAGE_KEY)
  useComparisonStore.setState({ dates: [] })
  resetChartRangeStore()
  localStorage.removeItem(THEME_STORAGE_KEY)
  useThemeStore.setState({ mood: 'fresh' })
  applyTheme('fresh')
}

export type RenderAppOptions = Omit<RenderOptions, 'wrapper'> & {
  initialEntries?: string[]
}

/** RTL render wrapped in MemoryRouter. Call `resetAppStores` in beforeEach. */
export function renderApp(
  ui: ReactElement,
  options?: RenderAppOptions,
): RenderResult {
  const { initialEntries, ...renderOptions } = options ?? {}

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
