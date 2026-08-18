import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { useAppUpdateAvailable } from '@/shared/hooks'
import { reloadForUpdate } from '@/shared/lib/reloadForUpdate'
import { Button } from '@/shared/ui/button'

export function AppUpdateBanner() {
  const t = useTranslation()
  const updateAvailable = useAppUpdateAvailable()
  const [reloading, setReloading] = useState(false)

  if (!updateAvailable) return null

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border bg-muted px-4 py-2 text-sm text-foreground">
      <span>{t.appUpdate.availableText}</span>
      {reloading ? (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <RefreshCw aria-hidden="true" className="size-4 animate-spin" />
          {t.appUpdate.reloadingText}
        </span>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setReloading(true)
            void reloadForUpdate({ force: true })
          }}
        >
          {t.appUpdate.reloadButton}
        </Button>
      )}
    </div>
  )
}
