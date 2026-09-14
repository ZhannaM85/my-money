import { useEffect } from 'react'
import { releaseNotes } from '@/data/releaseNotes'
import { useTranslation } from '@/i18n'
import { PageHeader } from '@/shared/ui/page-header'
import { useSettingsStore } from '@/stores/settingsStore'
import { AboutSection } from './AboutSection'
import { DataSection } from './DataSection'
import { DeveloperSection } from './DeveloperSection'
import { FeatureTogglesSection } from './FeatureTogglesSection'
import { PreferencesSection } from './PreferencesSection'
import { RatesSection } from './RatesSection'
import { ToolsSection } from './ToolsSection'

export function SettingsScreen() {
  const t = useTranslation()
  const load = useSettingsStore((state) => state.load)
  const currentVersion = releaseNotes[0]?.version

  useEffect(() => {
    void load()
  }, [load])

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
      <PreferencesSection />
      <FeatureTogglesSection />
      <RatesSection />
      <ToolsSection />
      <DataSection />
      <AboutSection />
      <DeveloperSection />
    </div>
  )
}
