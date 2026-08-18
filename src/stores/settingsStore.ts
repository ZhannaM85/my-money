import { create } from 'zustand'
import {
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
  completeOnboarding: () => Promise<void>
}

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const settings = await settingsRepository.get()
    set({ settings, loaded: true })
  },
  setBaseCurrency: async (baseCurrency) => {
    const next: Settings = {
      ...get().settings,
      baseCurrency,
      updatedAt: new Date().toISOString(),
    }
    await settingsRepository.save(next)
    set({ settings: next })
  },
  setCurrencyDisplayMode: async (currencyDisplayMode) => {
    const next: Settings = {
      ...get().settings,
      currencyDisplayMode,
      updatedAt: new Date().toISOString(),
    }
    await settingsRepository.save(next)
    set({ settings: next })
  },
  setLocale: async (locale) => {
    const next: Settings = {
      ...get().settings,
      locale,
      updatedAt: new Date().toISOString(),
    }
    await settingsRepository.save(next)
    set({ settings: next })
  },
  completeOnboarding: async () => {
    const next: Settings = {
      ...get().settings,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    }
    await settingsRepository.save(next)
    set({ settings: next })
  },
}))
