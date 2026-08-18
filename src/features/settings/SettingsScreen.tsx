import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BASE_CURRENCIES,
  type CurrencyDisplayMode,
  type Locale,
} from '@/domain/settings'
import { BackupSection, CsvSection } from '@/features/export'
import { releaseNotes } from '@/data/releaseNotes'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useThemeStore, type Mood } from '@/stores/themeStore'
import { cn } from '@/shared/lib/utils'
import { ManualRatesSection } from './ManualRatesSection'
import { ReleaseNotesSection } from './ReleaseNotesSection'

export function SettingsScreen() {
  const t = useTranslation()
  const settings = useSettingsStore((state) => state.settings)
  const loaded = useSettingsStore((state) => state.loaded)
  const load = useSettingsStore((state) => state.load)
  const setBaseCurrency = useSettingsStore((state) => state.setBaseCurrency)
  const setCurrencyDisplayMode = useSettingsStore(
    (state) => state.setCurrencyDisplayMode,
  )
  const setLocale = useSettingsStore((state) => state.setLocale)
  const completeOnboarding = useSettingsStore(
    (state) => state.completeOnboarding,
  )
  const loadAssets = useAssetStore((state) => state.load)
  const assetCount = useAssetStore((state) => state.assets.length)
  const mood = useThemeStore((state) => state.mood)
  const setMood = useThemeStore((state) => state.setMood)

  const moods: { id: Mood; label: string }[] = [
    { id: 'ledger', label: t.settings.moodLedger },
    { id: 'green', label: t.settings.moodGreen },
  ]
  const displayModes: { id: CurrencyDisplayMode; label: string }[] = [
    { id: 'base', label: t.settings.currencyDisplayBase },
    { id: 'native', label: t.settings.currencyDisplayNative },
  ]

  useEffect(() => {
    void load()
    void loadAssets()
  }, [load, loadAssets])

  const canSkipWelcome =
    loaded && !settings.onboardingCompleted && assetCount === 0

  const currentVersion = releaseNotes[0]?.version

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.settings.title}
        description={t.settings.description}
        action={
          currentVersion !== undefined && (
            <a
              href="#release-notes"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t.settings.versionBadgeLabel(currentVersion)}
            </a>
          )
        }
      />
      <div className="flex flex-col gap-1.5">
        <label
          className="flex flex-col gap-1.5"
          htmlFor="settings-base-currency"
        >
          <span className="text-sm font-medium">{t.settings.baseCurrency}</span>
          <select
            id="settings-base-currency"
            className={cn(
              'h-12 rounded-lg border border-input bg-background px-2.5 text-base',
              settings.currencyDisplayMode === 'native' &&
                'text-muted-foreground opacity-60',
            )}
            value={settings.baseCurrency}
            disabled={!loaded || settings.currencyDisplayMode === 'native'}
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
        {settings.currencyDisplayMode === 'native' && (
          <span className="text-xs text-muted-foreground">
            {t.settings.baseCurrencyDisabledHint}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.settings.currencyDisplay}</span>
        <div className="flex flex-wrap gap-2">
          {displayModes.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium',
                settings.currencyDisplayMode === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-pressed={settings.currencyDisplayMode === item.id}
              onClick={() => void setCurrencyDisplayMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
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
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.settings.appearance}</span>
        <div className="flex flex-wrap gap-2">
          {moods.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium',
                mood === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
              aria-pressed={mood === item.id}
              onClick={() => setMood(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
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
      <ManualRatesSection />
      <Button asChild variant="outline" size="xl" className="w-full">
        <Link to="/allocation">{t.settings.allocation}</Link>
      </Button>
      <BackupSection />
      <CsvSection />
      <section id="release-notes" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t.settings.releaseNotesLabel}</h2>
        <ReleaseNotesSection />
      </section>
    </div>
  )
}
