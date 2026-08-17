import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/shared/ui/page-header'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { AssetForm } from './AssetForm'

export function NewAssetScreen() {
  const navigate = useNavigate()
  const saveAsset = useAssetStore((state) => state.saveAsset)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add asset" />
      <AssetForm
        requireAmount
        submitLabel="Save asset"
        onSubmit={async ({ asset, amount }) => {
          await saveAsset(asset, {
            assetId: asset.id,
            date: todayIsoDate(),
            amount: amount ?? 0,
            currency: asset.currency,
          })
          navigate('/assets')
        }}
      />
    </div>
  )
}
