import {
  DEFAULT_SETTINGS,
  SETTINGS_ID,
  type Settings,
  type SettingsRepository,
} from '@/domain/settings'
import { db } from './db'

export class IndexedDbSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    const stored = await db.settings.get(SETTINGS_ID)
    if (!stored) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...stored }
  }

  async save(settings: Settings): Promise<void> {
    await db.settings.put({ ...settings, id: SETTINGS_ID })
  }
}
