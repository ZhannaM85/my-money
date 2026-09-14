import { useTranslation } from '@/i18n'
import { ManualRatesSection } from './ManualRatesSection'
import { SettingsCard } from './SettingsCard'
import { SettingsUpdateRates } from './SettingsUpdateRates'

/** Update rates + manual today overrides in one meaning card (#272). */
export function RatesSection() {
  const t = useTranslation()

  return (
    <SettingsCard
      testId="settings-rates"
      title={t.settings.ratesTitle}
      description={t.settings.ratesDescription}
    >
      <SettingsUpdateRates />
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.settings.manualRatesTitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.settings.manualRatesDescription}
          </p>
        </div>
        <ManualRatesSection embedded />
      </div>
    </SettingsCard>
  )
}
