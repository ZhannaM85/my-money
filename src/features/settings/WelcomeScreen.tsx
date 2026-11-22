import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { PageHeader } from '@/shared/ui/page-header'

// #332 — public Marketing / Developer Website page. LinkedIn omitted until a
// stable public profile URL is chosen; GitHub author link matches Support.
const AUTHOR_GITHUB_URL = 'https://github.com/ZhannaM85'

export function WelcomeScreen() {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.welcome.title} description={t.welcome.tagline} />

      <p className="text-sm text-muted-foreground">{t.welcome.body}</p>

      <div className="flex flex-col gap-2 text-sm">
        <Link
          to="/"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t.welcome.openAppLabel}
        </Link>
        <Link
          to="/privacy"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t.welcome.privacyLinkLabel}
        </Link>
        <Link
          to="/support"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t.welcome.supportLinkLabel}
        </Link>
      </div>

      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{t.welcome.authorHeading}</p>
        <p>{t.welcome.authorBody}</p>
        <a
          href={AUTHOR_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline-offset-4 hover:underline"
        >
          {t.welcome.githubLabel}
        </a>
      </div>
    </div>
  )
}
