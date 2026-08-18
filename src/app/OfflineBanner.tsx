import { useTranslation } from '@/i18n'
import { useOnlineStatus } from '@/shared/hooks'
import { isNativePlatform } from '@/shared/lib/registerServiceWorker'

export function OfflineBanner() {
  const t = useTranslation()
  const isOnline = useOnlineStatus()

  if (isNativePlatform() || isOnline) return null

  return (
    <div className="border-b border-border bg-muted px-4 py-2 text-sm text-foreground">
      {t.offline.offlineText}
    </div>
  )
}
