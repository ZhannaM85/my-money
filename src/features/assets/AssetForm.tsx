import { useState, type FormEvent, type ReactNode } from 'react'
import {
  ASSET_CLASSES,
  TRACKING_STATUSES,
  TYPES_BY_CLASS,
  UPDATE_FREQUENCIES,
  VALUATION_METHODS,
  type Asset,
  type AssetClass,
  type AssetType,
  type TrackingStatus,
  type UpdateFrequency,
  type ValuationMethod,
} from '@/domain/asset'
import { BASE_CURRENCIES } from '@/domain/settings'
import { useTranslation } from '@/i18n'
import { parseAmount } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { NumberInput } from '@/shared/ui/number-input'
import { TextField } from '@/shared/ui/text-field'

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="h-12 rounded-lg border border-input bg-background px-2.5 text-base"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  )
}

export interface AssetFormValues {
  asset: Asset
  amount?: number
}

export function AssetForm({
  initial,
  initialAmount,
  defaultCurrency,
  requireAmount,
  submitLabel,
  onSubmit,
}: {
  initial?: Asset
  initialAmount?: number
  defaultCurrency?: string
  requireAmount: boolean
  submitLabel: string
  onSubmit: (values: AssetFormValues) => Promise<void>
}) {
  const t = useTranslation()
  const now = new Date().toISOString()
  const [name, setName] = useState(initial?.name ?? '')
  const [assetClass, setAssetClass] = useState<AssetClass>(
    initial?.assetClass ?? 'money',
  )
  const [type, setType] = useState<AssetType>(initial?.type ?? 'bank')
  const [currency, setCurrency] = useState(
    initial?.currency ?? defaultCurrency ?? 'EUR',
  )
  const [institution, setInstitution] = useState(initial?.institution ?? '')
  const [valuationMethod, setValuationMethod] = useState<ValuationMethod>(
    initial?.valuationMethod ?? 'account_balance',
  )
  const [purchaseValue, setPurchaseValue] = useState(
    initial?.purchaseValue?.toString() ?? '',
  )
  const [updateFrequency, setUpdateFrequency] = useState<UpdateFrequency>(
    initial?.updateFrequency ?? 'weekly',
  )
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>(
    initial?.trackingStatus ?? 'included',
  )
  const [amount, setAmount] = useState(
    initialAmount === undefined ? '' : String(initialAmount),
  )
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)

  const types = TYPES_BY_CLASS[assetClass]

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError(t.asset.nameRequired)
      return
    }
    const parsedAmount = parseAmount(amount)
    if (requireAmount && parsedAmount === undefined) {
      setError(t.asset.enterCurrentAmount)
      return
    }
    if (amount.trim() !== '' && parsedAmount === undefined) {
      setError(t.asset.amountMustBeNumber)
      return
    }
    const purchase = parseAmount(purchaseValue)
    if (purchaseValue.trim() !== '' && purchase === undefined) {
      setError(t.asset.purchaseMustBeNumber)
      return
    }
    setError(undefined)
    setSaving(true)
    try {
      await onSubmit({
        asset: {
          id: initial?.id ?? crypto.randomUUID(),
          name: trimmed,
          assetClass,
          type,
          currency,
          institution: institution.trim() || undefined,
          trackingStatus,
          valuationMethod,
          purchaseValue: purchase,
          updateFrequency,
          createdAt: initial?.createdAt ?? now,
          updatedAt: now,
        },
        amount: parsedAmount,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <TextField
        label={t.asset.name}
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={error === t.asset.nameRequired ? error : undefined}
      />
      <SelectField
        label={t.asset.class}
        value={assetClass}
        onChange={(value) => {
          const next = value as AssetClass
          setAssetClass(next)
          setType(TYPES_BY_CLASS[next][0])
        }}
      >
        {ASSET_CLASSES.map((value) => (
          <option key={value} value={value}>
            {t.asset.classes[value]}
          </option>
        ))}
      </SelectField>
      <SelectField
        label={t.asset.type}
        value={type}
        onChange={(value) => setType(value as AssetType)}
      >
        {types.map((value) => (
          <option key={value} value={value}>
            {t.asset.types[value]}
          </option>
        ))}
      </SelectField>
      <SelectField label={t.asset.currency} value={currency} onChange={setCurrency}>
        {BASE_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </SelectField>
      <TextField
        label={t.asset.institutionOptional}
        value={institution}
        onChange={(event) => setInstitution(event.target.value)}
      />
      <SelectField
        label={t.asset.valuationLabel}
        value={valuationMethod}
        onChange={(value) => setValuationMethod(value as ValuationMethod)}
      >
        {VALUATION_METHODS.map((value) => (
          <option key={value} value={value}>
            {t.asset.valuation[value]}
          </option>
        ))}
      </SelectField>
      {valuationMethod !== 'account_balance' && (
        <NumberInput
          label={t.asset.purchaseValueOptional}
          value={purchaseValue}
          onChange={(event) => setPurchaseValue(event.target.value)}
        />
      )}
      <SelectField
        label={t.asset.updateFrequency}
        value={updateFrequency}
        onChange={(value) => setUpdateFrequency(value as UpdateFrequency)}
      >
        {UPDATE_FREQUENCIES.map((value) => (
          <option key={value} value={value}>
            {t.asset.frequency[value]}
          </option>
        ))}
      </SelectField>
      {initial && (
        <SelectField
          label={t.asset.trackingLabel}
          value={trackingStatus}
          onChange={(value) => setTrackingStatus(value as TrackingStatus)}
        >
          {TRACKING_STATUSES.map((value) => (
            <option key={value} value={value}>
              {t.asset.tracking[value]}
            </option>
          ))}
        </SelectField>
      )}
      <NumberInput
        label={requireAmount ? t.asset.currentAmount : t.asset.newAmountOptional}
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        unit={currency}
        error={
          error === t.asset.enterCurrentAmount ||
          error === t.asset.amountMustBeNumber
            ? error
            : undefined
        }
      />
      {error &&
        error !== t.asset.nameRequired &&
        error !== t.asset.enterCurrentAmount &&
        error !== t.asset.amountMustBeNumber && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      <Button type="submit" size="xl" className="w-full" disabled={saving}>
        {submitLabel}
      </Button>
    </form>
  )
}
