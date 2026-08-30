import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { PageHeader } from '@/shared/ui/page-header'

/** #164 — stable `/privacy` URL for App Store and Play listings. */
const LAST_UPDATED = '2026-08-30'

export function PrivacyScreen() {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.privacyPolicy.title}
        description={t.privacyPolicy.description}
      />

      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <p>{t.privacyPolicy.lastUpdatedLabel(LAST_UPDATED)}</p>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.privacyPolicy.collectionHeading}
          </p>
          <p>{t.privacyPolicy.collectionBody}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.privacyPolicy.storageHeading}
          </p>
          <p>{t.privacyPolicy.storageBody}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.privacyPolicy.networkHeading}
          </p>
          <p>{t.privacyPolicy.networkBody}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.privacyPolicy.sharingHeading}
          </p>
          <p>{t.privacyPolicy.sharingBody}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.privacyPolicy.exportHeading}
          </p>
          <p>{t.privacyPolicy.exportBody}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.privacyPolicy.childrenHeading}
          </p>
          <p>{t.privacyPolicy.childrenBody}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.privacyPolicy.changesHeading}
          </p>
          <p>{t.privacyPolicy.changesBody}</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.privacyPolicy.contactHeading}
          </p>
          <p>{t.privacyPolicy.contactBody}</p>
        </div>
      </div>

      <Link
        to="/settings"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {t.privacyPolicy.backToSettingsLabel}
      </Link>
    </div>
  )
}
