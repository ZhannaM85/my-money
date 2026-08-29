import { create } from 'zustand'
import {
  type AssetListSort,
  type CurrencyDisplayMode,
  DEFAULT_SETTINGS,
  type Locale,
  type Settings,
} from '@/domain/settings'
import { IndexedDbSettingsRepository } from '@/infrastructure/persistence/indexeddb'

const settingsRepository = new IndexedDbSettingsRepository()

interface SettingsStoreState {
  settings: Settings
  loaded: boolean
  load: () => Promise<void>
  setBaseCurrency: (baseCurrency: string) => Promise<void>
  setCurrencyDisplayMode: (mode: CurrencyDisplayMode) => Promise<void>
  setLocale: (locale: Locale) => Promise<void>
  setAssetListSort: (assetListSort: AssetListSort) => Promise<void>
  persistCustomAssetOrder: (assetListOrder: string[]) => Promise<void>
  setShowChartTooltip: (showChartTooltip: boolean) => Promise<void>
  completeOnboarding: () => Promise<void>
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => {
  async function save(patch: Partial<Settings>) {
    const next: Settings = {
      ...get().settings,
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    await settingsRepository.save(next)
    set({ settings: next })
  }

  return {
    settings: DEFAULT_SETTINGS,
    loaded: false,
    load: async () => {
      const settings = await settingsRepository.get()
      set({ settings, loaded: true })
    },
    setBaseCurrency: async (baseCurrency) => {
      await save({ baseCurrency })
    },
    setCurrencyDisplayMode: async (currencyDisplayMode) => {
      await save({ currencyDisplayMode })
    },
    setLocale: async (locale) => {
      await save({ locale })
    },
    setAssetListSort: async (assetListSort) => {
      await save({ assetListSort })
    },
    persistCustomAssetOrder: async (assetListOrder) => {
      await save({ assetListSort: 'custom', assetListOrder })
    },
    setShowChartTooltip: async (showChartTooltip) => {
      await save({ showChartTooltip })
    },
    completeOnboarding: async () => {
      await save({ onboardingCompleted: true })
    },
  }
})
