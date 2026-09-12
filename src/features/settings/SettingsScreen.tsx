import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BASE_CURRENCIES,
  SHOW_ALL_CURRENCIES,
  type CurrencyDisplayMode,
  type Locale,
} from '@/domain/settings'
import { BackupSection, CsvSection } from '@/features/export'
import { releaseNotes } from '@/data/releaseNotes'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { PageHeader } from '@/shared/ui/page-header'
import { SelectField } from '@/shared/ui/select-field'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useThemeStore, MOODS, type Mood } from '@/stores/themeStore'
import { ManualRatesSection } from './ManualRatesSection'
import { FxDebugSection } from './FxDebugSection'
import { RcaSection } from './RcaSection'
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
  const setHomeScreenWidget = useSettingsStore(
    (state) => state.setHomeScreenWidget,
  )
  const completeOnboarding = useSettingsStore(
    (state) => state.completeOnboarding,
  )
  const assetCount = useAssetStore((state) => state.assets.length)
  const mood = useThemeStore((state) => state.mood)
  const setMood = useThemeStore((state) => state.setMood)
  const moodLabels: Record<Mood, string> = {
    fresh: t.settings.moodFresh,
    ledger: t.settings.moodLedger,
    green: t.settings.moodGreen,
    soft: t.settings.moodSoft,
    neutral: t.settings.moodNeutral,
    pastel: t.settings.moodPastel,
  }
  const moods = MOODS.map((id) => ({ id, label: moodLabels[id] }))
  const displayModes: { id: CurrencyDisplayMode; label: string }[] = [
    { id: 'base', label: t.settings.currencyDisplayBase },
    { id: 'native', label: t.settings.currencyDisplayNative },
  ]

  useEffect(() => {
    void load()
  }, [load])

  const canSkipWelcome =
    loaded && !settings.onboardingCompleted && assetCount === 0

  const currentVersion = releaseNotes[0]?.version

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.settings.title}
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
        <SelectField
          label={t.settings.baseCurrency}
          id="settings-base-currency"
          value={
            settings.currencyDisplayMode === 'native'
              ? SHOW_ALL_CURRENCIES
              : settings.baseCurrency
          }
          disabled={!loaded}
          onChange={(event) => {
            const value = event.target.value
            void (async () => {
              if (value === SHOW_ALL_CURRENCIES) {
                await setCurrencyDisplayMode('native')
                return
              }
              await setBaseCurrency(value)
              if (settings.currencyDisplayMode === 'native') {
                await setCurrencyDisplayMode('base')
              }
            })()
          }}
        >
          <option value={SHOW_ALL_CURRENCIES}>
            {t.settings.showAllCurrencies}
          </option>
          {BASE_CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </SelectField>
        {settings.currencyDisplayMode === 'native' && (
          <span className="text-xs text-muted-foreground">
            {t.settings.showAllCurrenciesHint}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          {t.settings.currencyDisplay}
        </span>
        <div className="flex flex-wrap gap-2">
          {displayModes.map((item) => (
            <Chip
              key={item.id}
              pressed={settings.currencyDisplayMode === item.id}
              onClick={() => void setCurrencyDisplayMode(item.id)}
            >
              {item.label}
            </Chip>
          ))}
        </div>
      </div>
      <SelectField
        label={t.settings.language}
        value={settings.locale}
        disabled={!loaded}
        onChange={(event) => {
          void setLocale(event.target.value as Locale)
        }}
      >
        <option value="en">{t.settings.languageEn}</option>
        <option value="ru">{t.settings.languageRu}</option>
      </SelectField>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t.settings.appearance}</span>
        <div className="flex flex-wrap gap-2">
          {moods.map((item) => (
            <Chip
              key={item.id}
              pressed={mood === item.id}
              onClick={() => setMood(item.id)}
            >
              {item.label}
            </Chip>
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
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          {t.settings.homeScreenWidget}
        </span>
        <p className="text-sm text-muted-foreground">
          {t.settings.homeScreenWidgetHint}
        </p>
        <Button
          type="button"
          variant={settings.homeScreenWidget ? 'default' : 'outline'}
          disabled={!loaded}
          aria-pressed={settings.homeScreenWidget}
          onClick={() => void setHomeScreenWidget(!settings.homeScreenWidget)}
        >
          {settings.homeScreenWidget
            ? t.settings.homeScreenWidgetOn
            : t.settings.homeScreenWidgetOff}
        </Button>
      </div>
      <FxDebugSection />
      <Button asChild variant="outline" size="xl" className="w-full">
        <Link to="/allocation">{t.settings.allocation}</Link>
      </Button>
      <Link
        to="/privacy"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {t.settings.readPrivacyPolicyLabel}
      </Link>
      <BackupSection />
      <CsvSection />
      <section id="release-notes" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          {t.settings.releaseNotesLabel}
        </h2>
        <ReleaseNotesSection />
      </section>
      <section id="root-causes" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{t.settings.rcaLabel}</h2>
          <p className="text-sm text-muted-foreground">
            {t.settings.rcaDescription}
          </p>
        </div>
        <RcaSection />
      </section>
    </div>
  )
}
