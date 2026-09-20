import { Plus, Trash2 } from 'lucide-react'
import type { Locale } from '@/domain/settings'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { MoneyInput } from '@/shared/ui/money-input'
import { emptySpendLine, type SpendLineDraft } from './spendLines'

export function SpendLinesEditor({
  lines,
  onChange,
  locale,
  currency,
  amountAria,
  noteAria,
}: {
  lines: readonly SpendLineDraft[]
  onChange: (lines: SpendLineDraft[]) => void
  locale: Locale
  currency: string
  amountAria: (index: number) => string
  noteAria: (index: number) => string
}) {
  const t = useTranslation()
  const rows = lines.length > 0 ? [...lines] : [emptySpendLine()]

  function update(index: number, patch: Partial<SpendLineDraft>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  return (
    <div className="flex flex-col gap-2" data-testid="spend-lines">
      {rows.map((row, index) => (
        <div
          key={row.key}
          className="flex flex-col gap-2"
          data-testid={`spend-line-${index}`}
        >
          <div className="flex gap-2">
            <MoneyInput
              aria-label={amountAria(index + 1)}
              locale={locale}
              currency={currency}
              value={row.amount}
              onValueChange={(amount) => update(index, { amount })}
              placeholder={t.asset.amountPlaceholder}
            />
            {rows.length > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="icon-xl"
                aria-label={t.asset.removeSpendLine(index + 1)}
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-5" aria-hidden />
              </Button>
            ) : null}
          </div>
          <Input
            aria-label={noteAria(index + 1)}
            placeholder={t.asset.snapshotNote}
            value={row.note}
            onChange={(event) => update(index, { note: event.target.value })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...rows, emptySpendLine()])}
      >
        <Plus className="size-4" aria-hidden />
        {t.asset.addSpendLine}
      </Button>
    </div>
  )
}
