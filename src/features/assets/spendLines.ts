import { optionalSnapshotNote } from '@/domain/snapshot'
import { parseAmount } from '@/shared/lib/money'

export type SpendLineDraft = {
  key: string
  amount: string
  note: string
}

export function emptySpendLine(key: string = crypto.randomUUID()): SpendLineDraft {
  return { key, amount: '', note: '' }
}

export function spendLinesOrDefault(
  stored: readonly SpendLineDraft[] | undefined,
  assetId: string,
): SpendLineDraft[] {
  return stored ? [...stored] : [emptySpendLine(`${assetId}-spend-0`)]
}

export function spendLineCreatedAt(index: number, nowMs = Date.now()): string {
  return new Date(nowMs + index).toISOString()
}

export function stampSpendLineTimes(
  count: number,
  nowMs = Date.now(),
): string[] {
  return Array.from({ length: count }, (_, index) =>
    spendLineCreatedAt(index, nowMs),
  )
}

export function parseSpendLineDrafts(
  drafts: readonly SpendLineDraft[],
): { amount: number; note?: string }[] {
  const lines: { amount: number; note?: string }[] = []
  for (const draft of drafts) {
    const amount = parseAmount(draft.amount)
    if (amount === undefined) continue
    const note = optionalSnapshotNote(draft.note)
    lines.push(note ? { amount, note } : { amount })
  }
  return lines
}
