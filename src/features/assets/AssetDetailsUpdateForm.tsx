import { useState } from 'react'
import {
  applyBalanceEntry,
  snapshotsFromSpendLines,
  type BalanceEntryMode,
  type BalanceHeadline,
  updateBaselineAmount,
} from '@/domain/asset'
import {
  hasDuplicateSnapshot,
  optionalSnapshotNote,
  snapshotBeforeDate,
  snapshotOnDate,
  type AssetSnapshot,
} from '@/domain/snapshot'
import { useLocale, useTranslation } from '@/i18n'
import { formatEditableAmount, parseAmount } from '@/shared/lib/money'
import { isIsoDateOnOrBefore } from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { InfoHint } from '@/shared/ui/info-hint'
import { TextField } from '@/shared/ui/text-field'
import { AssetBalanceUpdateControls } from './AssetBalanceUpdateControls'
import {
  emptySpendLine,
  parseSpendLineDrafts,
  stampSpendLineTimes,
  type SpendLineDraft,
} from './spendLines'

export function AssetDetailsUpdateForm({
  assetId,
  currency,
  snapshots,
  today,
  headline,
  onHeadlineChange,
  onSave,
}: {
  assetId: string
  currency: string
  snapshots: readonly AssetSnapshot[]
  today: string
  headline: BalanceHeadline
  onHeadlineChange: (headline: BalanceHeadline) => void
  onSave: (
    inputs: readonly {
      date: string
      amount: number
      note?: string
      createdAt?: string
    }[],
  ) => Promise<void>
}) {
  const t = useTranslation()
  const locale = useLocale()
  const [amountDraft, setAmountDraft] = useState('')
  const [amountError, setAmountError] = useState<string | undefined>()
  const [amountDate, setAmountDate] = useState(today)
  const [amountNote, setAmountNote] = useState('')
  const [entryMode, setEntryMode] = useState<BalanceEntryMode>('new_balance')
  const [spendLines, setSpendLines] = useState<SpendLineDraft[]>(() => [
    emptySpendLine(`${assetId}-spend-0`),
  ])

  const onDate = snapshotOnDate(snapshots, assetId, amountDate)
  const previous = snapshotBeforeDate(snapshots, assetId, amountDate)
  const baseline = updateBaselineAmount(onDate, previous, currency)
  const givenSpentMode = headline === 'given_spent'
  const spendEntries = givenSpentMode
    ? snapshotsFromSpendLines(baseline, parseSpendLineDrafts(spendLines))
    : []
  const parsedDraft = parseAmount(amountDraft)
  const resolvedAmount = givenSpentMode
    ? spendEntries.at(-1)?.remaining
    : parsedDraft === undefined
      ? undefined
      : applyBalanceEntry(entryMode, parsedDraft, baseline)
  const duplicateAmountHint = givenSpentMode
    ? spendEntries.some((entry) =>
        hasDuplicateSnapshot(snapshots, {
          assetId,
          date: amountDate,
          amount: entry.remaining,
          currency,
        }),
      )
    : resolvedAmount !== undefined &&
      hasDuplicateSnapshot(snapshots, {
        assetId,
        date: amountDate,
        amount: resolvedAmount,
        currency,
      })
  const placeholderSource = onDate ?? previous

  async function saveAmount() {
    if (!isIsoDateOnOrBefore(amountDate, today)) {
      setAmountError(t.asset.snapshotDateInvalid)
      return
    }
    if (givenSpentMode) {
      if (spendEntries.length === 0) {
        setAmountError(t.asset.enterCurrentAmount)
        return
      }
      setAmountError(undefined)
      const stamps = stampSpendLineTimes(spendEntries.length)
      await onSave(
        spendEntries.map((entry, index) => ({
          date: amountDate,
          amount: entry.remaining,
          createdAt: stamps[index],
          ...(entry.note ? { note: entry.note } : {}),
        })),
      )
      setSpendLines([emptySpendLine(`${assetId}-spend-0`)])
      setAmountDate(today)
      return
    }
    const parsed = parseAmount(amountDraft)
    if (parsed === undefined) {
      setAmountError(t.asset.enterCurrentAmount)
      return
    }
    setAmountError(undefined)
    const amount = applyBalanceEntry(entryMode, parsed, baseline)
    const note = optionalSnapshotNote(amountNote)
    await onSave([
      { date: amountDate, amount, ...(note ? { note } : {}) },
    ])
    setAmountDraft('')
    setAmountDate(today)
    setAmountNote('')
    setEntryMode('new_balance')
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
      {!givenSpentMode ? (
        <TextField
          label={t.asset.snapshotNote}
          value={amountNote}
          onChange={(event) => setAmountNote(event.target.value)}
        />
      ) : null}
      <div className="flex min-w-0 flex-col gap-2">
        <AssetBalanceUpdateControls
          amountAriaLabel={t.asset.newAmount}
          locale={locale}
          currency={currency}
          headline={headline}
          onHeadlineChange={onHeadlineChange}
          entryMode={entryMode}
          onEntryModeChange={setEntryMode}
          draft={amountDraft}
          onDraftChange={setAmountDraft}
          placeholder={
            entryMode === 'new_balance' && placeholderSource
              ? formatEditableAmount(
                  placeholderSource.amount,
                  locale,
                  placeholderSource.currency,
                )
              : t.asset.amountPlaceholder
          }
          resultingRemaining={
            givenSpentMode
              ? spendEntries.length > 0
                ? resolvedAmount
                : undefined
              : entryMode === 'new_balance'
                ? undefined
                : resolvedAmount
          }
          spendLines={spendLines}
          onSpendLinesChange={setSpendLines}
        />
        <Button
          type="button"
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
