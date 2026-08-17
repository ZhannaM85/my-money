import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BASE_CURRENCIES, type Locale } from '@/domain/settings'
import { BackupSection, CsvSection } from '@/features/export'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function SettingsScreen() {
  const t = useTranslation()
  const settings = useSettingsStore((state) => state.settings)
  const loaded = useSettingsStore((state) => state.loaded)
  const load = useSettingsStore((state) => state.load)
  const setBaseCurrency = useSettingsStore((state) => state.setBaseCurrency)
  const setLocale = useSettingsStore((state) => state.setLocale)
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
        title={t.settings.title}
        description={t.settings.description}
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t.settings.baseCurrency}</span>
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
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{t.settings.language}</span>
        <select
          className="h-12 rounded-lg border border-input bg-background px-2.5 text-base"
          value={settings.locale}
          disabled={!loaded}
          onChange={(event) => {
            void setLocale(event.target.value as Locale)
          }}
        >
          <option value="en">{t.settings.languageEn}</option>
          <option value="ru">{t.settings.languageRu}</option>
        </select>
      </label>
      {canSkipWelcome && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {t.settings.skipWelcomeHint}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void completeOnboarding()}
          >
            {t.settings.skipWelcome}
          </Button>
        </div>
      )}
      <Button asChild variant="outline" size="xl" className="w-full">
        <Link to="/allocation">{t.settings.allocation}</Link>
      </Button>
      <BackupSection />
      <CsvSection />
    </div>
  )
}
