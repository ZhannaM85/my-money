import { useMemo, useState } from 'react'
import {
  snapshotsFromSpendLines,
  type BalanceHeadline,
  updateBaselineAmount,
} from '@/domain/asset'
import {
  hasDuplicateSnapshot,
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
import { useNewUpdateUx } from '@/features/settings/useNewUpdateUx'
import { AssetBalanceUpdateControls } from './AssetBalanceUpdateControls'
import {
  persistPlanToSaveInputs,
  planRemainingPersist,
  planSpendPersist,
} from './persistHolding'
import {
  emptySpendLine,
  parseSpendLineDrafts,
  spendBaselineAmount,
  spendLineDraftsFromEntries,
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
  const newUx = useNewUpdateUx()
  const [amountDraft, setAmountDraft] = useState('')
  const [amountError, setAmountError] = useState<string | undefined>()
  const [amountDate, setAmountDate] = useState(today)
  const [amountNote, setAmountNote] = useState('')
  const [spendLineEdits, setSpendLineEdits] = useState<
    Record<string, SpendLineDraft[]>
  >({})
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | undefined>()

  const onDate = snapshotOnDate(snapshots, assetId, amountDate)
  const previous = snapshotBeforeDate(snapshots, assetId, amountDate)
  const baseline = updateBaselineAmount(onDate, previous, currency)
  const givenSpentMode = newUx && headline === 'given_spent'
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
    : parsedDraft
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

  function resetRemainingDrafts() {
    setAmountDraft('')
    setAmountDate(today)
    setAmountNote('')
  }

  async function persistResult(
    result: ReturnType<typeof planRemainingPersist>,
    requireAmount: boolean,
  ) {
    if (!result.ok) {
      if (
        result.error === 'invalid_amount' ||
        (result.error === 'noop' && requireAmount)
      ) {
        setAmountError(t.asset.enterCurrentAmount)
      }
      return false
    }
    setAmountError(undefined)
    setSaving(true)
    try {
      const { inputs, deleteIds } = persistPlanToSaveInputs(result.plan)
      await onSave(inputs, deleteIds)
      setSaveMessage(t.asset.holdingSaved)
      return true
    } finally {
      setSaving(false)
    }
  }

  async function saveRemaining() {
    if (!isIsoDateOnOrBefore(amountDate, today)) {
      setAmountError(t.asset.snapshotDateInvalid)
      return
    }
    const requireAmount = !onDate
    const ok = await persistResult(
      planRemainingPersist({
        assetId,
        date: amountDate,
        currency,
        draft: amountDraft,
        note: amountNote,
        entryMode: 'new_balance',
        onDate,
        previous,
        requireAmount,
        write: 'append',
      }),
      requireAmount,
    )
    if (ok) resetRemainingDrafts()
  }

  async function saveSpends(draftOverride?: readonly SpendLineDraft[]) {
    if (!isIsoDateOnOrBefore(amountDate, today)) {
      setAmountError(t.asset.snapshotDateInvalid)
      return
    }
    const drafts = draftOverride ? [...draftOverride] : spendLines
    const entries = draftOverride
      ? snapshotsFromSpendLines(spendBaseline, parseSpendLineDrafts(drafts))
      : spendEntries
    const hasSavedSpends = savedSpends.some((entry) => entry.drop > 0)
    if (entries.length === 0 && !hasSavedSpends) {
      setAmountError(t.asset.enterCurrentAmount)
      return
    }
    const result = planSpendPersist({
      snapshots,
      drafts,
      assetId,
      date: amountDate,
      currency,
      onDate,
      previous,
    })
    if (!result.ok) {
      setAmountError(
        result.error === 'noop' ? undefined : t.asset.enterCurrentAmount,
      )
      return
    }
    setAmountError(undefined)
    setSaving(true)
    try {
      const { inputs, deleteIds } = persistPlanToSaveInputs(result.plan)
      await onSave(inputs, deleteIds)
      setSaveMessage(t.asset.holdingSaved)
      setAmountDate(today)
    } finally {
      setSaving(false)
    }
  }

  async function saveAmount() {
    if (givenSpentMode) {
      await saveSpends()
      return
    }
    await saveRemaining()
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
      <div className="flex min-w-0 flex-col gap-2">
        <AssetBalanceUpdateControls
          amountAriaLabel={t.asset.newAmount}
          locale={locale}
          currency={currency}
          headline={headline}
          onHeadlineChange={onHeadlineChange}
          draft={amountDraft}
          onDraftChange={setAmountDraft}
          placeholder={
            placeholderSource
              ? formatEditableAmount(
                  placeholderSource.amount,
                  locale,
                  placeholderSource.currency,
                )
              : t.asset.amountPlaceholder
          }
          resultingRemaining={
            givenSpentMode && spendEntries.length > 0
              ? resolvedAmount
              : undefined
          }
          spendLines={spendLines}
          onSpendLinesChange={(lines) => {
            setSpendLineEdits((current) => ({
              ...current,
              [spendEditKey]: lines,
            }))
          }}
          onSaveAmount={newUx ? () => void saveRemaining() : undefined}
          saveAmountLabel={newUx ? t.asset.saveAmountAria : undefined}
          saveAmountTestId="asset-save-amount"
          amountSaveDisabled={saving}
          onSaveSpendLine={(_, lines) => void saveSpends(lines)}
          newUx={newUx}
          noteField={
            givenSpentMode ? undefined : (
              <TextField
                label={t.asset.snapshotNote}
                value={amountNote}
                onChange={(event) => setAmountNote(event.target.value)}
              />
            )
          }
        />
        <Button
          type="button"
          className="w-full"
          disabled={saving}
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
      {saveMessage && (
        <p
          className="text-sm text-muted-foreground"
          data-testid="asset-update-save-status"
          role="status"
        >
          {saveMessage}
        </p>
      )}
    </section>
  )
}
