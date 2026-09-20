import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { FlowDirection } from '@/domain/snapshot'
import type { Locale } from '@/domain/settings'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { SpendLineRow } from './SpendLineRow'
import {
  emptySpendLine,
  spendLineIsEditing,
  type SpendLineDraft,
  type SpendLineViewOverride,
} from './spendLines'

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
  const [overrides, setOverrides] = useState<
    Record<string, SpendLineViewOverride>
  >({})
  const rows = lines.length > 0 ? [...lines] : [emptySpendLine()]

  function update(index: number, patch: Partial<SpendLineDraft>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function setDirection(index: number, direction: FlowDirection) {
    if (rows[index]?.direction === direction) return
    update(index, { direction })
  }

  function setOverride(key: string, override: SpendLineViewOverride) {
    setOverrides((current) => ({ ...current, [key]: override }))
  }

  return (
    <div className="flex flex-col gap-2" data-testid="spend-lines">
      {rows.map((row, index) => (
        <SpendLineRow
          key={row.key}
          row={row}
          index={index}
          editing={spendLineIsEditing(row, overrides[row.key])}
          canRemove={rows.length > 1 || Boolean(row.snapshotId)}
          locale={locale}
          currency={currency}
          amountAria={amountAria(index + 1)}
          noteAria={noteAria(index + 1)}
          onUpdate={(patch) => update(index, patch)}
          onSetDirection={(direction) => setDirection(index, direction)}
          onRemove={() => onChange(rows.filter((_, i) => i !== index))}
          onStartEdit={() => setOverride(row.key, 'edit')}
          onCommit={() => setOverride(row.key, 'view')}
        />
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
