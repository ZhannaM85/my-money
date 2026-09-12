import { useState } from 'react'
import { hasDuplicateSnapshot, optionalSnapshotNote } from '@/domain/snapshot'
import type { AssetSnapshot } from '@/domain/snapshot'
import { useLocale, useTranslation } from '@/i18n'
import { formatEditableAmount, parseAmount } from '@/shared/lib/money'
import { isIsoDateOnOrBefore } from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { InfoHint } from '@/shared/ui/info-hint'
import { MoneyInput } from '@/shared/ui/money-input'
import { TextField } from '@/shared/ui/text-field'

export function AssetDetailsUpdateForm({
  assetId,
  currency,
  snapshotAmount,
  snapshotCurrency,
  snapshots,
  today,
  onSave,
}: {
  assetId: string
  currency: string
  snapshotAmount?: number
  snapshotCurrency?: string
  snapshots: readonly AssetSnapshot[]
  today: string
  onSave: (input: {
    date: string
    amount: number
    note?: string
  }) => Promise<void>
}) {
  const t = useTranslation()
  const locale = useLocale()
  const [amountDraft, setAmountDraft] = useState('')
  const [amountError, setAmountError] = useState<string | undefined>()
  const [amountDate, setAmountDate] = useState(today)
  const [amountNote, setAmountNote] = useState('')

  const parsedAmountDraft = parseAmount(amountDraft)
  const duplicateAmountHint =
    parsedAmountDraft !== undefined &&
    hasDuplicateSnapshot(snapshots, {
      assetId,
      date: amountDate,
      amount: parsedAmountDraft,
      currency,
    })

  async function saveAmount() {
    const amount = parseAmount(amountDraft)
    if (amount === undefined) {
      setAmountError(t.asset.enterCurrentAmount)
      return
    }
    if (!isIsoDateOnOrBefore(amountDate, today)) {
      setAmountError(t.asset.snapshotDateInvalid)
      return
    }
    setAmountError(undefined)
    const note = optionalSnapshotNote(amountNote)
    await onSave({ date: amountDate, amount, ...(note ? { note } : {}) })
    setAmountDraft('')
    setAmountDate(today)
    setAmountNote('')
  }

  return (
    <section className="flex flex-col gap-3">
      <InfoHint
        hint={t.asset.updateThisAssetHint}
        label={t.common.aboutField(t.asset.updateThisAsset)}
      >
        <h2 className="text-lg font-semibold">{t.asset.updateThisAsset}</h2>
      </InfoHint>
      <DateField
        label={t.asset.snapshotDate}
        value={amountDate}
        max={today}
        onChange={(event) => setAmountDate(event.target.value)}
        error={
          amountError === t.asset.snapshotDateInvalid ? amountError : undefined
        }
      />
      <TextField
        label={t.asset.snapshotNote}
        value={amountNote}
        onChange={(event) => setAmountNote(event.target.value)}
      />
      <div className="flex min-w-0 flex-col gap-2">
        <MoneyInput
          aria-label={t.asset.newAmount}
          locale={locale}
          currency={currency}
          value={amountDraft}
          onValueChange={setAmountDraft}
          placeholder={
            snapshotAmount !== undefined && snapshotCurrency
              ? formatEditableAmount(snapshotAmount, locale, snapshotCurrency)
              : t.asset.amountPlaceholder
          }
        />
        <Button
          type="button"
          size="xl"
          className="w-full"
          onClick={() => void saveAmount()}
        >
          {t.common.save}
        </Button>
      </div>
      {duplicateAmountHint && (
        <p className="text-sm text-warning" role="status">
          {t.asset.duplicateSnapshotHint}
        </p>
      )}
      {amountError && amountError !== t.asset.snapshotDateInvalid && (
        <p className="text-sm text-destructive">{amountError}</p>
      )}
    </section>
  )
}
