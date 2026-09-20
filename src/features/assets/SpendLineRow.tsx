import { Pencil, Trash2 } from 'lucide-react'
import type { FlowDirection } from '@/domain/snapshot'
import type { Locale } from '@/domain/settings'
import { useTranslation } from '@/i18n'
import { formatAmount, parseAmount } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { Input } from '@/shared/ui/input'
import { MoneyInput } from '@/shared/ui/money-input'
import { FieldSaveButton } from './FieldSaveButton'
import type { SpendLineDraft } from './spendLines'

function displayAmount(
  amount: string,
  locale: Locale,
  currency: string,
): string {
  const parsed = parseAmount(amount)
  if (parsed === undefined) return amount.trim() || '—'
  return formatAmount(parsed, currency, locale)
}

export function SpendLineRow({
  row,
  index,
  editing,
  canRemove,
  locale,
  currency,
  amountAria,
  noteAria,
  onUpdate,
  onSetDirection,
  onRemove,
  onStartEdit,
  onCommit,
}: {
  row: SpendLineDraft
  index: number
  editing: boolean
  canRemove: boolean
  locale: Locale
  currency: string
  amountAria: string
  noteAria: string
  onUpdate: (patch: Partial<SpendLineDraft>) => void
  onSetDirection: (direction: FlowDirection) => void
  onRemove: () => void
  onStartEdit: () => void
  onCommit: () => void
}) {
  const t = useTranslation()
  const n = index + 1
  const directionLabel =
    row.direction === 'received' ? t.asset.flowReceived : t.asset.flowGiven
  const note = row.note.trim()

  const removeButton = canRemove ? (
    <Button
      type="button"
      variant="outline"
      size="icon-xl"
      aria-label={t.asset.removeSpendLine(n)}
      onClick={onRemove}
    >
      <Trash2 className="size-5" aria-hidden />
    </Button>
  ) : null

  if (!editing) {
    return (
      <div
        className="flex flex-col gap-2"
        data-testid={`spend-line-${index}`}
        data-editing="false"
      >
        <span className="inline-flex h-control-compact w-fit items-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground">
          {directionLabel}
        </span>
        <div className="flex gap-2" data-testid={`spend-line-values-${index}`}>
          <span className="flex h-control min-w-0 flex-1 items-center gap-1.5">
            <span
              className="shrink-0 tabular-nums font-medium"
              data-testid={`spend-line-amount-${index}`}
            >
              {displayAmount(row.amount, locale, currency)}
            </span>
            {note ? (
              <>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <span
                  data-testid={`spend-line-note-${index}`}
                  className="min-w-0 truncate text-sm text-muted-foreground"
                >
                  {row.note}
                </span>
              </>
            ) : null}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-xl"
            aria-label={t.asset.editSpendLine(n)}
            onClick={onStartEdit}
          >
            <Pencil className="size-5" aria-hidden />
          </Button>
          {removeButton}
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-2"
      data-testid={`spend-line-${index}`}
      data-editing="true"
    >
      <div className="flex flex-wrap gap-2">
        <Chip
          pressed={row.direction !== 'received'}
          onClick={() => onSetDirection('given')}
        >
          {t.asset.flowGiven}
        </Chip>
        <Chip
          pressed={row.direction === 'received'}
          onClick={() => onSetDirection('received')}
        >
          {t.asset.flowReceived}
        </Chip>
      </div>
      <div className="flex gap-2" data-testid={`spend-line-values-${index}`}>
        <div className="w-[8.75rem] shrink-0">
          <MoneyInput
            aria-label={amountAria}
            locale={locale}
            currency={currency}
            value={row.amount}
            onValueChange={(amount) => onUpdate({ amount })}
            placeholder={t.asset.amountPlaceholder}
          />
        </div>
        <Input
          className="min-w-0 flex-1"
          aria-label={noteAria}
          placeholder={t.asset.snapshotNote}
          value={row.note}
          onChange={(event) => onUpdate({ note: event.target.value })}
        />
        <FieldSaveButton label={t.asset.saveSpendLine(n)} onClick={onCommit} />
        {removeButton}
      </div>
    </div>
  )
}
