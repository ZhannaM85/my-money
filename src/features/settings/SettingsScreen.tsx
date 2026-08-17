import { useEffect } from 'react'
import { BASE_CURRENCIES } from '@/domain/settings'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function SettingsScreen() {
  const settings = useSettingsStore((state) => state.settings)
  const loaded = useSettingsStore((state) => state.loaded)
  const load = useSettingsStore((state) => state.load)
  const setBaseCurrency = useSettingsStore((state) => state.setBaseCurrency)
  const completeOnboarding = useSettingsStore(
    (state) => state.completeOnboarding,
  )
  const loadAssets = useAssetStore((state) => state.load)
  const assetCount = useAssetStore((state) => state.assets.length)

  useEffect(() => {
    void load()
    void loadAssets()
  }, [load, loadAssets])

  const canSkipWelcome =
    loaded && !settings.onboardingCompleted && assetCount === 0

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
      {canSkipWelcome && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Welcome still wants a first asset. Skip it to use the app empty.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void completeOnboarding()}
          >
            Skip welcome
          </Button>
        </div>
      )}
    </div>
  )
}
