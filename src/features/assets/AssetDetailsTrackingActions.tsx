import type { TrackingStatus } from '@/domain/asset'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'

export function AssetDetailsTrackingActions({
  trackingStatus,
  onSetTracking,
  onDelete,
}: {
  trackingStatus: TrackingStatus
  onSetTracking: (status: TrackingStatus) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-2">
      {trackingStatus === 'included' ? (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void onSetTracking('excluded')}
        >
          {t.asset.excludeFromNetWorth}
        </Button>
      ) : null}
      {trackingStatus === 'excluded' ? (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void onSetTracking('included')}
        >
          {t.asset.includeInNetWorth}
        </Button>
      ) : null}
      {trackingStatus !== 'archived' ? (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void onSetTracking('archived')}
        >
          {t.asset.hide}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void onSetTracking('included')}
        >
          {t.asset.restore}
        </Button>
      )}
      <Button
        type="button"
        variant="destructive"
        size="xl"
        className="w-full"
        onClick={() => void onDelete()}
      >
        {t.asset.deleteAsset}
      </Button>
    </div>
  )
}
