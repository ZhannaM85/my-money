import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { convertAmount, lookupRate, type RateTable } from '@/domain/fx'
import { BASE_CURRENCIES } from '@/domain/settings'
import {
  hasDuplicateSnapshot,
  optionalSnapshotNote,
  type AssetSnapshot,
} from '@/domain/snapshot'
import { useLocale, useTranslation } from '@/i18n'
import {
  formatAmount,
  formatEditableAmount,
  parseAmount,
  reformatAmountInput,
} from '@/shared/lib/money'
import { isIsoDateOnOrBefore } from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { useConfirm } from '@/shared/ui/confirm-dialog'
import { DateField } from '@/shared/ui/date-field'
import { MoneyInput } from '@/shared/ui/money-input'
import { SelectField } from '@/shared/ui/select-field'
import { TextField } from '@/shared/ui/text-field'
import type { AssetDetailsDisplayMode } from './useAssetDetailsScreen'

export function AssetSnapshotList({
  history,
  snapshots,
  assetId,
  mode,
  quotes,
  baseCurrency,
  today,
  onSave,
  onDelete,
}: {
  history: readonly AssetSnapshot[]
  snapshots: readonly AssetSnapshot[]
  assetId: string
  mode: AssetDetailsDisplayMode
  quotes: RateTable
  baseCurrency: string
  today: string
  onSave: (snapshot: AssetSnapshot) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const t = useTranslation()
  const locale = useLocale()
  const [confirm, confirmDialog] = useConfirm()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCurrency, setEditCurrency] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editError, setEditError] = useState<string | undefined>()

  const parsedEditAmount = parseAmount(editAmount)
  const duplicateEditHint =
    editingId !== null &&
    parsedEditAmount !== undefined &&
    hasDuplicateSnapshot(snapshots, {
      assetId,
      date: editDate,
      amount: parsedEditAmount,
      currency: editCurrency,
      excludeId: editingId,
    })

  async function saveEditedSnapshot() {
    if (!editingId) return
    const row = snapshots.find((snapshot) => snapshot.id === editingId)
    if (!row) return
    const amount = parseAmount(editAmount)
    if (amount === undefined) {
      setEditError(t.asset.amountMustBeNumber)
      return
    }
    if (!isIsoDateOnOrBefore(editDate, today)) {
      setEditError(t.asset.snapshotDateInvalid)
      return
    }
    setEditError(undefined)
    const note = optionalSnapshotNote(editNote)
    const next = {
      ...row,
      amount,
      date: editDate,
      currency: editCurrency,
    }
    if (note) {
      next.note = note
    } else {
      delete next.note
    }
    await onSave(next)
    setEditingId(null)
  }

  if (history.length === 0) return null

  return (
    <>
      <ul className="flex flex-col gap-2">
        {history.map((row) => {
          const rate = lookupRate(quotes, row.currency, baseCurrency, row.date)
          const shown =
            mode === 'native' || rate === undefined
              ? formatAmount(row.amount, row.currency, locale)
              : formatAmount(
                  convertAmount(row.amount, rate),
                  baseCurrency,
                  locale,
                )
          const showNativeUnder =
            mode === 'base' &&
            rate !== undefined &&
            row.currency !== baseCurrency
          return editingId === row.id ? (
            <li
              key={row.id}
              className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
            >
              <DateField
                label={t.asset.snapshotDate}
                value={editDate}
                max={today}
                onChange={(event) => setEditDate(event.target.value)}
                error={
                  editError === t.asset.snapshotDateInvalid
                    ? editError
                    : undefined
                }
              />
              <SelectField
                label={t.asset.currency}
                value={editCurrency}
                onChange={(event) => {
                  const next = event.target.value
                  setEditCurrency(next)
                  setEditAmount((current) =>
                    reformatAmountInput(current, locale, next),
                  )
                }}
              >
                {((BASE_CURRENCIES as readonly string[]).includes(editCurrency)
                  ? BASE_CURRENCIES
                  : [editCurrency, ...BASE_CURRENCIES]
                ).map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </SelectField>
              <MoneyInput
                aria-label={t.asset.editSnapshotAmount}
                locale={locale}
                currency={editCurrency}
                value={editAmount}
                onValueChange={setEditAmount}
              />
              <TextField
                label={t.asset.snapshotNote}
                value={editNote}
                onChange={(event) => setEditNote(event.target.value)}
              />
              {duplicateEditHint && (
                <p className="text-sm text-warning" role="status">
                  {t.asset.duplicateSnapshotHint}
                </p>
              )}
              {editError && editError !== t.asset.snapshotDateInvalid && (
                <p className="text-sm text-destructive">{editError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="xl"
                  className="flex-1"
                  onClick={() => void saveEditedSnapshot()}
                >
                  {t.common.save}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  className="flex-1"
                  onClick={() => {
                    setEditingId(null)
                    setEditError(undefined)
                  }}
                >
                  {t.common.cancel}
                </Button>
              </div>
            </li>
          ) : (
            <li
              key={row.id}
              className="flex flex-col gap-1 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {row.date}
                </span>
                <span className="flex items-start gap-1">
                  <span className="flex flex-col items-end">
                    <span className="tabular-nums text-sm">{shown}</span>
                    {showNativeUnder ? (
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {formatAmount(row.amount, row.currency, locale)}
                      </span>
                    ) : null}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t.asset.editSnapshotAria(row.date)}
                    onClick={() => {
                      setEditingId(row.id)
                      setEditDate(row.date)
                      setEditCurrency(row.currency)
                      setEditAmount(
                        formatEditableAmount(row.amount, locale, row.currency),
                      )
                      setEditNote(row.note ?? '')
                      setEditError(undefined)
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t.asset.deleteSnapshotAria(row.date)}
                    onClick={() => {
                      void confirm(t.asset.deleteSnapshotConfirm).then((ok) => {
                        if (ok) void onDelete(row.id)
                      })
                    }}
                  >
                    <Trash2 />
                  </Button>
                </span>
              </span>
              {row.note ? (
                <span className="text-sm text-muted-foreground">
                  {row.note}
                </span>
              ) : null}
            </li>
          )
        })}
      </ul>
      {confirmDialog}
    </>
  )
}
