import { useNavigate, useSearchParams } from 'react-router-dom'
import { findAssetPreset } from '@/domain/asset'
import { useTranslation } from '@/i18n'
import { PageHeader } from '@/shared/ui/page-header'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { AssetForm } from './AssetForm'

export function NewAssetScreen() {
  const t = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const saveAsset = useAssetStore((state) => state.saveAsset)
  const preset = findAssetPreset(searchParams.get('preset') ?? '')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.asset.addTitle} />
      <AssetForm
        showPresets
        defaultAssetClass={preset?.assetClass}
        defaultType={preset?.type}
        requireAmount
        submitLabel={t.asset.saveAsset}
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
