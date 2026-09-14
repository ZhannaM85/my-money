import { useTranslation } from '@/i18n'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Switch } from '@/shared/ui/switch'
import { useSettingsStore } from '@/stores/settingsStore'

/** Turtle-style toggles card: title, blurb, labeled switch rows (#271). */
export function FeatureTogglesSection() {
  const t = useTranslation()
  const loaded = useSettingsStore((state) => state.loaded)
  const showDashboardPositions = useSettingsStore(
    (state) => state.settings.showDashboardPositions,
  )
  const setShowDashboardPositions = useSettingsStore(
    (state) => state.setShowDashboardPositions,
  )

  return (
    <Card data-testid="feature-toggles">
      <CardHeader>
        <CardTitle>{t.settings.featureTogglesTitle}</CardTitle>
        <CardDescription>{t.settings.featureTogglesDescription}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="flex items-start justify-between gap-3 border-t border-border px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              {t.settings.dashboardPositions}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t.settings.dashboardPositionsHint}
            </p>
          </div>
          <Switch
            checked={showDashboardPositions}
            disabled={!loaded}
            aria-label={t.settings.dashboardPositions}
            onCheckedChange={(checked) =>
              void setShowDashboardPositions(checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
