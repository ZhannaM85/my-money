import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BASE_CURRENCIES } from '@/domain/settings'
import { AssetForm } from '@/features/assets/AssetForm'
import { todayIsoDate } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'

type Step = 'currency' | 'asset' | 'next'

export function OnboardingScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('currency')
  const [formKey, setFormKey] = useState(0)
  const load = useSettingsStore((state) => state.load)
  const settings = useSettingsStore((state) => state.settings)
  const setBaseCurrency = useSettingsStore((state) => state.setBaseCurrency)
  const completeOnboarding = useSettingsStore(
    (state) => state.completeOnboarding,
  )
  const saveAsset = useAssetStore((state) => state.saveAsset)

  useEffect(() => {
    void load()
  }, [load])

  async function skip() {
    await completeOnboarding()
    navigate('/', { replace: true })
  }

  async function goToDashboard() {
    await completeOnboarding()
    navigate('/', { replace: true })
  }

  if (step === 'next') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Asset saved"
          description="Add another, or see your first net worth."
        />
        <Button
          type="button"
          size="xl"
          className="w-full"
          onClick={() => {
            setFormKey((key) => key + 1)
            setStep('asset')
          }}
        >
          Add another
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void goToDashboard()}
        >
          See my net worth
        </Button>
      </div>
    )
  }

  if (step === 'asset') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="First asset"
          description="Add what you own or owe. The amount becomes the first snapshot."
        />
        <AssetForm
          key={formKey}
          requireAmount
          defaultCurrency={settings.baseCurrency}
          submitLabel="Save asset"
          onSubmit={async ({ asset, amount }) => {
            await saveAsset(asset, {
              assetId: asset.id,
              date: todayIsoDate(),
              amount: amount ?? 0,
              currency: asset.currency,
            })
            await completeOnboarding()
            setStep('next')
          }}
        />
        <Button type="button" variant="ghost" onClick={() => void skip()}>
          Skip for now
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Welcome"
        description="Know what you own. In one currency. Over time."
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Base currency</span>
        <select
          className="h-12 rounded-lg border border-input bg-background px-2.5 text-base"
          value={settings.baseCurrency}
          onChange={(event) => {
            void setBaseCurrency(event.target.value)
          }}
        >
          {BASE_CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        size="xl"
        className="w-full"
        onClick={() => setStep('asset')}
      >
        Continue
      </Button>
      <Button type="button" variant="ghost" onClick={() => void skip()}>
        Skip for now
      </Button>
    </div>
  )
}
