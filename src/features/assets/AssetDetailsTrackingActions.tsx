import type { TrackingStatus } from '@/domain/asset'
import { useTranslation } from '@/i18n'
import { OverflowMenu, type OverflowMenuItem } from '@/shared/ui/overflow-menu'

export function AssetDetailsTrackingActions({
  name,
  trackingStatus,
  endedOn,
  onSetTracking,
  onRemoveFromDate,
  onUndoRemoval,
  onDelete,
}: {
  name: string
  trackingStatus: TrackingStatus
  endedOn?: string
  onSetTracking: (status: TrackingStatus) => Promise<void>
  onRemoveFromDate: () => void
  onUndoRemoval: () => void
  onDelete: () => Promise<void>
}) {
  const t = useTranslation()
  const items: OverflowMenuItem[] = []

  if (trackingStatus === 'included') {
    items.push({
      label: t.asset.excludeFromNetWorth,
      onSelect: () => void onSetTracking('excluded'),
    })
  }
  if (trackingStatus === 'excluded') {
    items.push({
      label: t.asset.includeInNetWorth,
      onSelect: () => void onSetTracking('included'),
    })
  }
  if (trackingStatus !== 'archived') {
    items.push({
      label: t.asset.hide,
      onSelect: () => void onSetTracking('archived'),
    })
  } else {
    items.push({
      label: t.asset.restore,
      onSelect: () => void onSetTracking('included'),
    })
  }
  items.push({
    label: t.assets.removeFromDate,
    ariaLabel: t.assets.removeFromDateAria(name),
    onSelect: onRemoveFromDate,
  })
  if (endedOn) {
    items.push({
      label: t.assets.undoRemove,
      ariaLabel: t.assets.undoRemoveAria(name),
      onSelect: onUndoRemoval,
    })
  }
  items.push({
    label: t.asset.deleteAsset,
    tone: 'destructive',
    onSelect: () => void onDelete(),
  })

  return <OverflowMenu ariaLabel={t.assets.rowMenuAria(name)} items={items} />
}
