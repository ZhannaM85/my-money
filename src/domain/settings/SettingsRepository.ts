import type { Settings } from './Settings'

export interface SettingsRepository {
  get(): Promise<Settings>
  save(settings: Settings): Promise<void>
}
