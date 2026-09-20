import { useMemo, useState } from 'react'
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
  sameDaySpendEntries,
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
  planSameDaySpendPersist,
  spendBaselineAmount,
  spendLineDraftsFromEntries,
  spendLinesMatchSaved,
  spendSnapshotsToEdit,
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
      flow?: number
      createdAt?: string
      id?: string
    }[],
    deleteIds?: readonly string[],
  ) => Promise<void>
}) {
  const t = useTranslation()
  const locale = useLocale()
  const [amountDraft, setAmountDraft] = useState('')
  const [amountError, setAmountError] = useState<string | undefined>()
  const [amountDate, setAmountDate] = useState(today)
  const [amountNote, setAmountNote] = useState('')
  const [entryMode, setEntryMode] = useState<BalanceEntryMode>('new_balance')
  const [spendLineEdits, setSpendLineEdits] = useState<
    Record<string, SpendLineDraft[]>
  >({})

  const onDate = snapshotOnDate(snapshots, assetId, amountDate)
  const previous = snapshotBeforeDate(snapshots, assetId, amountDate)
  const baseline = updateBaselineAmount(onDate, previous, currency)
  const givenSpentMode = headline === 'given_spent'
  const savedSpends = useMemo(
    () => sameDaySpendEntries(snapshots, assetId, amountDate),
    [snapshots, assetId, amountDate],
  )
  const savedKey = savedSpends
    .filter((entry) => entry.drop > 0)
    .map((entry) => `${entry.id}:${entry.drop}:${entry.note ?? ''}`)
    .join('|')
  const spendEditKey = `${assetId}|${amountDate}|${locale}|${savedKey}`
  const spendLines = givenSpentMode
    ? (spendLineEdits[spendEditKey] ??
      spendLineDraftsFromEntries(savedSpends, locale, assetId))
    : [emptySpendLine(`${assetId}-spend-0`)]

  const spendBaseline = givenSpentMode
    ? spendBaselineAmount(savedSpends, onDate, previous, currency)
    : baseline
  const spendEntries = givenSpentMode
    ? snapshotsFromSpendLines(spendBaseline, parseSpendLineDrafts(spendLines))
    : []
  const parsedDraft = parseAmount(amountDraft)
  const resolvedAmount = givenSpentMode
    ? spendEntries.at(-1)?.remaining
    : parsedDraft === undefined
      ? undefined
      : applyBalanceEntry(entryMode, parsedDraft, baseline)
  const spendIds = new Set(
    savedSpends.filter((entry) => entry.drop > 0).map((entry) => entry.id),
  )
  const snapshotsForDuplicate = snapshots.filter((row) => !spendIds.has(row.id))
  const duplicateAmountHint = givenSpentMode
    ? spendEntries.some((entry) =>
        hasDuplicateSnapshot(snapshotsForDuplicate, {
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
      const hasSavedSpends = savedSpends.some((entry) => entry.drop > 0)
      if (spendEntries.length === 0 && !hasSavedSpends) {
        setAmountError(t.asset.enterCurrentAmount)
        return
      }
      if (spendLinesMatchSaved(spendLines, savedSpends)) {
        setAmountError(undefined)
        return
      }
      setAmountError(undefined)
      const plan = planSameDaySpendPersist({
        existingSpends: spendSnapshotsToEdit(snapshots, assetId, amountDate),
        drafts: spendLines,
        baseline: spendBaseline,
        assetId,
        date: amountDate,
        currency,
      })
      await onSave(
        [
          ...plan.toUpdate.map((row) => ({
            id: row.id,
            date: row.date,
            amount: row.amount,
            flow: row.flow,
            ...(row.note ? { note: row.note } : {}),
          })),
          ...plan.toCreate.map((row) => ({
            date: row.date,
            amount: row.amount,
            createdAt: row.createdAt,
            flow: row.flow,
            ...(row.note ? { note: row.note } : {}),
          })),
        ],
        plan.toDelete,
      )
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
          onSpendLinesChange={(lines) => {
            setSpendLineEdits((current) => ({
              ...current,
              [spendEditKey]: lines,
            }))
          }}
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
