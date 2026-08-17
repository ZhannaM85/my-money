import { useEffect } from 'react'
import { BASE_CURRENCIES } from '@/domain/settings'
import { PageHeader } from '@/shared/ui/page-header'
import { useSettingsStore } from '@/stores/settingsStore'

export function SettingsScreen() {
  const settings = useSettingsStore((state) => state.settings)
  const loaded = useSettingsStore((state) => state.loaded)
  const load = useSettingsStore((state) => state.load)
  const setBaseCurrency = useSettingsStore((state) => state.setBaseCurrency)

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="More"
        description="Base currency is a display setting. Changing it does not rewrite past balances."
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Base currency</span>
        <select
          className="h-12 rounded-lg border border-input bg-background px-2.5 text-base"
          value={settings.baseCurrency}
          disabled={!loaded}
          onChange={(event) => {
            void setBaseCurrency(event.target.value)
          }}
        >
          {BASE_CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
