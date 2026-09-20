import { useSettingsStore } from '@/stores/settingsStore'

/** New Обновить / asset-detail update path (#295). Default off. */
export function useNewUpdateUx(): boolean {
  return useSettingsStore((state) => state.settings.newUpdateUx)
}
