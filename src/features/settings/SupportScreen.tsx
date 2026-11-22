import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { PageHeader } from '@/shared/ui/page-header'

// #331 — public App Store Support URL. Stable mailto on this HTTPS page
// (not a bare mailto: Support URL). Dedicated inbox only — never a private
// Git / Apple ID address.
export const SUPPORT_EMAIL = 'mymoney.zhannam85@gmail.com'

export function SupportScreen() {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.support.title} description={t.support.description} />

      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-foreground">
            {t.support.contactHeading}
          </p>
          <p>{t.support.contactBody}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {t.support.emailLabel}: {SUPPORT_EMAIL}
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-medium text-foreground">{t.support.faqHeading}</p>

          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">
              {t.support.faqLocalHeading}
            </p>
            <p>{t.support.faqLocalBody}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">
              {t.support.faqBackupHeading}
            </p>
            <p>{t.support.faqBackupBody}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">
              {t.support.faqExportHeading}
            </p>
            <p>{t.support.faqExportBody}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">
              {t.support.faqOnlineHeading}
            </p>
            <p>{t.support.faqOnlineBody}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <Link
          to="/privacy"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t.support.privacyLinkLabel}
        </Link>
        <Link
          to="/settings"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t.support.backToSettingsLabel}
        </Link>
      </div>
    </div>
  )
}
