import { create } from 'zustand'
import { DEFAULT_SETTINGS, type Settings } from '@/domain/settings'
import { IndexedDbSettingsRepository } from '@/infrastructure/persistence/indexeddb'

const settingsRepository = new IndexedDbSettingsRepository()

interface SettingsStoreState {
  settings: Settings
  loaded: boolean
  load: () => Promise<void>
  setBaseCurrency: (baseCurrency: string) => Promise<void>
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
}))
