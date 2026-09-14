import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { ReleaseNotesSection } from './ReleaseNotesSection'
import { SettingsCard } from './SettingsCard'

export function AboutSection() {
  const t = useTranslation()

  return (
    <SettingsCard
      testId="settings-about"
      title={t.settings.groupAbout}
      description={t.settings.aboutDescription}
    >
      <Link
        to="/privacy"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {t.settings.readPrivacyPolicyLabel}
      </Link>
      <div id="release-notes" className="flex flex-col gap-2 border-t border-border pt-4">
        <h3 className="font-medium text-foreground">
          {t.settings.releaseNotesLabel}
        </h3>
        <ReleaseNotesSection />
      </div>
    </SettingsCard>
  )
}
