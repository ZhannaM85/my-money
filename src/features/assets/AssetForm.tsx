import { useState, type FormEvent, type ReactNode } from 'react'
import {
  ASSET_CLASSES,
  CLASS_LABELS,
  FREQUENCY_LABELS,
  TRACKING_LABELS,
  TRACKING_STATUSES,
  TYPES_BY_CLASS,
  TYPE_LABELS,
  UPDATE_FREQUENCIES,
  VALUATION_LABELS,
  VALUATION_METHODS,
  type Asset,
  type AssetClass,
  type AssetType,
  type TrackingStatus,
  type UpdateFrequency,
  type ValuationMethod,
} from '@/domain/asset'
import { BASE_CURRENCIES } from '@/domain/settings'
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
  requireAmount,
  submitLabel,
  onSubmit,
}: {
  initial?: Asset
  initialAmount?: number
  requireAmount: boolean
  submitLabel: string
  onSubmit: (values: AssetFormValues) => Promise<void>
}) {
  const now = new Date().toISOString()
  const [name, setName] = useState(initial?.name ?? '')
  const [assetClass, setAssetClass] = useState<AssetClass>(
    initial?.assetClass ?? 'money',
  )
  const [type, setType] = useState<AssetType>(initial?.type ?? 'bank')
  const [currency, setCurrency] = useState(initial?.currency ?? 'EUR')
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
      setError('Name is required')
      return
    }
    const parsedAmount = amount.trim() === '' ? undefined : Number(amount)
    if (
      requireAmount &&
      (parsedAmount === undefined || Number.isNaN(parsedAmount))
    ) {
      setError('Enter a current amount')
      return
    }
    if (parsedAmount !== undefined && Number.isNaN(parsedAmount)) {
      setError('Amount must be a number')
      return
    }
    const purchase =
      purchaseValue.trim() === '' ? undefined : Number(purchaseValue)
    if (purchaseValue.trim() !== '' && Number.isNaN(purchase)) {
      setError('Purchase value must be a number')
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
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={error === 'Name is required' ? error : undefined}
      />
      <SelectField
        label="Class"
        value={assetClass}
        onChange={(value) => {
          const next = value as AssetClass
          setAssetClass(next)
          setType(TYPES_BY_CLASS[next][0])
        }}
      >
        {ASSET_CLASSES.map((value) => (
          <option key={value} value={value}>
            {CLASS_LABELS[value]}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Type"
        value={type}
        onChange={(value) => setType(value as AssetType)}
      >
        {types.map((value) => (
          <option key={value} value={value}>
            {TYPE_LABELS[value]}
          </option>
        ))}
      </SelectField>
      <SelectField label="Currency" value={currency} onChange={setCurrency}>
        {BASE_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Institution (optional)"
        value={institution}
        onChange={(event) => setInstitution(event.target.value)}
      />
      <SelectField
        label="Valuation"
        value={valuationMethod}
        onChange={(value) => setValuationMethod(value as ValuationMethod)}
      >
        {VALUATION_METHODS.map((value) => (
          <option key={value} value={value}>
            {VALUATION_LABELS[value]}
          </option>
        ))}
      </SelectField>
      {valuationMethod !== 'account_balance' && (
        <NumberInput
          label="Purchase value (optional)"
          value={purchaseValue}
          onChange={(event) => setPurchaseValue(event.target.value)}
        />
      )}
      <SelectField
        label="Update frequency"
        value={updateFrequency}
        onChange={(value) => setUpdateFrequency(value as UpdateFrequency)}
      >
        {UPDATE_FREQUENCIES.map((value) => (
          <option key={value} value={value}>
            {FREQUENCY_LABELS[value]}
          </option>
        ))}
      </SelectField>
      {initial && (
        <SelectField
          label="Tracking"
          value={trackingStatus}
          onChange={(value) => setTrackingStatus(value as TrackingStatus)}
        >
          {TRACKING_STATUSES.map((value) => (
            <option key={value} value={value}>
              {TRACKING_LABELS[value]}
            </option>
          ))}
        </SelectField>
      )}
      <NumberInput
        label={requireAmount ? 'Current amount' : 'New amount (optional)'}
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        unit={currency}
        error={
          error === 'Enter a current amount' ||
          error === 'Amount must be a number'
            ? error
            : undefined
        }
      />
      {error &&
        error !== 'Name is required' &&
        error !== 'Enter a current amount' &&
        error !== 'Amount must be a number' && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      <Button type="submit" size="xl" className="w-full" disabled={saving}>
        {submitLabel}
      </Button>
    </form>
  )
}
