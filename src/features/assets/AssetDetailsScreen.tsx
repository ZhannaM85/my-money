import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { latestSnapshot } from '@/domain/snapshot'
import { formatAmount, todayIsoDate } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { AssetForm } from './AssetForm'

export function AssetDetailsScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const load = useAssetStore((state) => state.load)
  const saveAsset = useAssetStore((state) => state.saveAsset)
  const setTrackingStatus = useAssetStore((state) => state.setTrackingStatus)
  const asset = useAssetStore((state) =>
    state.assets.find((row) => row.id === id),
  )
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)

  useEffect(() => {
    void load()
  }, [load])

  if (!loaded) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (!asset) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Asset not found" />
        <Button asChild variant="outline">
          <Link to="/assets">Back to assets</Link>
        </Button>
      </div>
    )
  }

  const snapshot = latestSnapshot(snapshots, asset.id)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={asset.name}
        description={
          snapshot
            ? formatAmount(snapshot.amount, snapshot.currency)
            : 'No value yet'
        }
      />
      <AssetForm
        initial={asset}
        requireAmount={false}
        submitLabel="Save changes"
        onSubmit={async ({ asset: next, amount }) => {
          await saveAsset(
            next,
            amount === undefined
              ? undefined
              : {
                  assetId: next.id,
                  date: todayIsoDate(),
                  amount,
                  currency: next.currency,
                },
          )
          navigate('/assets')
        }}
      />
      {asset.trackingStatus !== 'archived' && (
        <Button
          type="button"
          variant="destructive"
          size="xl"
          className="w-full"
          onClick={() => {
            void setTrackingStatus(asset.id, 'archived').then(() =>
              navigate('/assets'),
            )
          }}
        >
          Archive asset
        </Button>
      )}
    </div>
  )
}
