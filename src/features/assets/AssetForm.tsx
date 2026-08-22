import { useState, type FormEvent, type ReactNode } from 'react'
import {
  ASSET_CLASSES,
  ASSET_PRESETS,
  TRACKING_STATUSES,
  TYPES_BY_CLASS,
  UPDATE_FREQUENCIES,
  VALUATION_METHODS,
  formatOwnershipShare,
  parseOwnershipShare,
  type Asset,
  type AssetClass,
  type AssetType,
  type TrackingStatus,
  type UpdateFrequency,
  type ValuationMethod,
} from '@/domain/asset'
import { BASE_CURRENCIES } from '@/domain/settings'
import { useLocale, useTranslation } from '@/i18n'
import { formatEditableAmount, parseAmount, todayIsoDate } from '@/shared/lib/money'
import { isIsoDateOnOrBefore } from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { MoneyInput } from '@/shared/ui/money-input'
import { TextField } from '@/shared/ui/text-field'
import { cn } from '@/shared/lib/utils'

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
  snapshotDate?: string
}

export function AssetForm({
  initial,
  initialAmount,
  defaultCurrency,
  defaultAssetClass,
  defaultType,
  showPresets = false,
  requireAmount,
  submitLabel,
  onSubmit,
}: {
  initial?: Asset
  initialAmount?: number
  defaultCurrency?: string
  defaultAssetClass?: AssetClass
  defaultType?: AssetType
  showPresets?: boolean
  requireAmount: boolean
  submitLabel: string
  onSubmit: (values: AssetFormValues) => Promise<void>
}) {
  const t = useTranslation()
  const locale = useLocale()
  const now = new Date().toISOString()
  const [name, setName] = useState(initial?.name ?? '')
  const [assetClass, setAssetClass] = useState<AssetClass>(
    initial?.assetClass ?? defaultAssetClass ?? 'money',
  )
  const [type, setType] = useState<AssetType>(
    initial?.type ?? defaultType ?? 'bank',
  )
  const [currency, setCurrency] = useState(
    initial?.currency ?? defaultCurrency ?? 'EUR',
  )
  const [institution, setInstitution] = useState(initial?.institution ?? '')
  const [valuationMethod, setValuationMethod] = useState<ValuationMethod>(
    initial?.valuationMethod ?? 'account_balance',
  )
  const [purchaseValue, setPurchaseValue] = useState(
    initial?.purchaseValue === undefined
      ? ''
      : formatEditableAmount(initial.purchaseValue, locale, initial.currency),
  )
  const [updateFrequency, setUpdateFrequency] = useState<UpdateFrequency>(
    initial?.updateFrequency ?? 'weekly',
  )
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>(
    initial?.trackingStatus ?? 'included',
  )
  const [amount, setAmount] = useState(
    initialAmount === undefined
      ? ''
      : formatEditableAmount(initialAmount, locale, currency),
  )
  const [snapshotDate, setSnapshotDate] = useState(todayIsoDate())
  const [ownershipShare, setOwnershipShare] = useState(
    formatOwnershipShare(
      initial
        ? {
            numerator: initial.ownershipShareNumerator ?? 1,
            denominator: initial.ownershipShareDenominator ?? 1,
          }
        : undefined,
    ),
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
    const parsedShare = parseOwnershipShare(ownershipShare)
    if (parsedShare === undefined) {
      setError(t.asset.ownershipShareInvalid)
      return
    }
    const today = todayIsoDate()
    if (
      requireAmount &&
      !initial &&
      !isIsoDateOnOrBefore(snapshotDate, today)
    ) {
      setError(t.asset.snapshotDateInvalid)
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
          ownershipShareNumerator: parsedShare.numerator,
          ownershipShareDenominator: parsedShare.denominator,
          updateFrequency,
          createdAt: initial?.createdAt ?? now,
          updatedAt: now,
        },
        amount: parsedAmount,
        snapshotDate: requireAmount && !initial ? snapshotDate : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => void handleSubmit(event)}
    >
      {showPresets && !initial && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t.asset.quickAdd}</span>
          <div className="flex flex-wrap gap-2">
            {ASSET_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium',
                  assetClass === preset.assetClass && type === preset.type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
                onClick={() => {
                  setAssetClass(preset.assetClass)
                  setType(preset.type)
                }}
              >
                {t.asset.presets[preset.id as keyof typeof t.asset.presets]}
              </button>
            ))}
          </div>
        </div>
      )}
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
        <MoneyInput
          label={t.asset.purchaseValueOptional}
          locale={locale}
          currency={currency}
          value={purchaseValue}
          onValueChange={setPurchaseValue}
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
      <TextField
        label={t.asset.ownershipShare}
        value={ownershipShare}
        onChange={(event) => setOwnershipShare(event.target.value)}
        error={
          error === t.asset.ownershipShareInvalid ? error : undefined
        }
      />
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
      <MoneyInput
        label={requireAmount ? t.asset.currentAmount : t.asset.newAmountOptional}
        locale={locale}
        currency={currency}
        value={amount}
        onValueChange={setAmount}
        hint={
          requireAmount ? undefined : t.asset.newAmountOptionalHint
        }
        aboutLabel={
          requireAmount
            ? undefined
            : t.common.aboutField(t.asset.newAmountOptional)
        }
        error={
          error === t.asset.enterCurrentAmount ||
          error === t.asset.amountMustBeNumber
            ? error
            : undefined
        }
      />
      {requireAmount && !initial && (
        <DateField
          label={t.asset.snapshotDate}
          value={snapshotDate}
          max={todayIsoDate()}
          onChange={(event) => setSnapshotDate(event.target.value)}
          error={
            error === t.asset.snapshotDateInvalid ? error : undefined
          }
        />
      )}
      {error &&
        error !== t.asset.nameRequired &&
        error !== t.asset.enterCurrentAmount &&
        error !== t.asset.amountMustBeNumber &&
        error !== t.asset.ownershipShareInvalid &&
        error !== t.asset.snapshotDateInvalid && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      <Button type="submit" size="xl" className="w-full" disabled={saving}>
        {submitLabel}
      </Button>
    </form>
  )
}
