import { useTranslation } from '@/i18n'
import { Switch } from '@/shared/ui/switch'
import { useSettingsStore } from '@/stores/settingsStore'
import { SettingsCard } from './SettingsCard'

function ToggleRow({
  title,
  hint,
  checked,
  disabled,
  onCheckedChange,
}: {
  title: string
  hint: string
  checked: boolean
  disabled: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-border px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        aria-label={title}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}

/** Turtle-style toggles card: title, blurb, labeled switch rows (#271, #295). */
export function FeatureTogglesSection() {
  const t = useTranslation()
  const loaded = useSettingsStore((state) => state.loaded)
  const showDashboardPositions = useSettingsStore(
    (state) => state.settings.showDashboardPositions,
  )
  const setShowDashboardPositions = useSettingsStore(
    (state) => state.setShowDashboardPositions,
  )
  const newUpdateUx = useSettingsStore((state) => state.settings.newUpdateUx)
  const setNewUpdateUx = useSettingsStore((state) => state.setNewUpdateUx)

  return (
    <SettingsCard
      testId="feature-toggles"
      title={t.settings.featureTogglesTitle}
      description={t.settings.featureTogglesDescription}
      contentClassName="gap-0 px-0 pb-0"
    >
      <ToggleRow
        title={t.settings.dashboardPositions}
        hint={t.settings.dashboardPositionsHint}
        checked={showDashboardPositions}
        disabled={!loaded}
        onCheckedChange={(checked) => void setShowDashboardPositions(checked)}
      />
      <ToggleRow
        title={t.settings.newUpdateUx}
        hint={t.settings.newUpdateUxHint}
        checked={newUpdateUx}
        disabled={!loaded}
        onCheckedChange={(checked) => void setNewUpdateUx(checked)}
      />
    </SettingsCard>
  )
}
