import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { ReleaseNotesSection } from './ReleaseNotesSection'
import { SettingsGroup } from './SettingsGroup'

export function AboutSection() {
  const t = useTranslation()

  return (
    <SettingsGroup title={t.settings.groupAbout}>
      <Link
        to="/privacy"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {t.settings.readPrivacyPolicyLabel}
      </Link>
      <section id="release-notes" className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">
          {t.settings.releaseNotesLabel}
        </h3>
        <ReleaseNotesSection />
      </section>
    </SettingsGroup>
  )
}
