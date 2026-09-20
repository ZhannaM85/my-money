import { snapshotsFromSpendLines, updateBaselineAmount } from '@/domain/asset'
import type { Locale } from '@/domain/settings'
import {
  optionalSnapshotNote,
  sameDaySpendEntries,
  snapshotsOnDateAll,
  type AssetSnapshot,
  type FlowDirection,
  type SameDaySpendEntry,
} from '@/domain/snapshot'
import { formatEditableAmount, parseAmount } from '@/shared/lib/money'

export type SpendLineDraft = {
  key: string
  amount: string
  note: string
  direction: FlowDirection
  snapshotId?: string
}

/** Pencil forces edit; Save forces view. Otherwise saved lines start read-only (#283). */
export type SpendLineViewOverride = 'edit' | 'view'

export function spendLineIsEditing(
  line: Pick<SpendLineDraft, 'snapshotId'>,
  override?: SpendLineViewOverride,
): boolean {
  if (override === 'edit') return true
  if (override === 'view') return false
  return line.snapshotId === undefined
}

export function emptySpendLine(
  key: string = crypto.randomUUID(),
): SpendLineDraft {
  return { key, amount: '', note: '', direction: 'given' }
}

/**
 * Lines the given/received editor may load. Tagged `flow` always.
 * Untagged same-day remaining drops load only when there are two or more
 * (#279/#280). A single remaining snapshot must not become Сумма (#291).
 */
function editorSpendRows(
  entries: readonly SameDaySpendEntry[],
): SameDaySpendEntry[] {
  const tagged = entries.filter((entry) => entry.flow !== undefined)
  if (tagged.length > 0) return tagged
  const untagged = entries.filter((entry) => entry.drop !== 0)
  return untagged.length > 1 ? untagged : []
}

function entryAmount(entry: SameDaySpendEntry): number {
  return Math.abs(entry.flow ?? entry.drop)
}

export function spendLineDraftsFromEntries(
  entries: readonly SameDaySpendEntry[],
  locale: Locale,
  fallbackAssetId: string,
): SpendLineDraft[] {
  const rows = editorSpendRows(entries)
  if (rows.length === 0) {
    return [emptySpendLine(`${fallbackAssetId}-spend-0`)]
  }
  return rows.map((entry) => ({
    key: entry.id,
    snapshotId: entry.id,
    amount: formatEditableAmount(entryAmount(entry), locale, entry.currency),
    note: entry.note ?? '',
    direction: entry.direction,
  }))
}

export function spendLinesForEditor(
  stored: readonly SpendLineDraft[] | undefined,
  saved: readonly SameDaySpendEntry[],
  locale: Locale,
  assetId: string,
): SpendLineDraft[] {
  return stored
    ? [...stored]
    : spendLineDraftsFromEntries(saved, locale, assetId)
}

export function spendLinesOrDefault(
  stored: readonly SpendLineDraft[] | undefined,
  assetId: string,
): SpendLineDraft[] {
  return stored ? [...stored] : [emptySpendLine(`${assetId}-spend-0`)]
}

export function spendBaselineAmount(
  saved: readonly SameDaySpendEntry[],
  onDate: Pick<AssetSnapshot, 'amount' | 'currency'> | undefined,
  previous: Pick<AssetSnapshot, 'amount' | 'currency'> | undefined,
  currency: string,
): number {
  const first = editorSpendRows(saved)[0]
  if (first) return first.remaining + first.drop
  return updateBaselineAmount(onDate, previous, currency)
}

export function spendSnapshotsToEdit(
  snapshots: readonly AssetSnapshot[],
  assetId: string,
  date: string,
): AssetSnapshot[] {
  const ids = new Set(
    editorSpendRows(sameDaySpendEntries(snapshots, assetId, date)).map(
      (entry) => entry.id,
    ),
  )
  return snapshotsOnDateAll(snapshots, assetId, date).filter((row) =>
    ids.has(row.id),
  )
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

export function parseSpendLineDrafts(drafts: readonly SpendLineDraft[]): {
  amount: number
  direction: FlowDirection
  note?: string
  snapshotId?: string
}[] {
  const lines: {
    amount: number
    direction: FlowDirection
    note?: string
    snapshotId?: string
  }[] = []
  for (const draft of drafts) {
    const amount = parseAmount(draft.amount)
    if (amount === undefined) continue
    const note = optionalSnapshotNote(draft.note)
    const direction = draft.direction === 'received' ? 'received' : 'given'
    lines.push({
      amount,
      direction,
      ...(note ? { note } : {}),
      ...(draft.snapshotId ? { snapshotId: draft.snapshotId } : {}),
    })
  }
  return lines
}

export function spendLinesMatchSaved(
  drafts: readonly SpendLineDraft[],
  saved: readonly SameDaySpendEntry[],
): boolean {
  const parsed = parseSpendLineDrafts(drafts)
  const rows = editorSpendRows(saved)
  if (parsed.length !== rows.length) return false
  return parsed.every((line, index) => {
    const row = rows[index]
    return (
      row !== undefined &&
      line.amount === entryAmount(row) &&
      line.direction === row.direction &&
      (line.note ?? '') === (row.note ?? '')
    )
  })
}

export type SameDaySpendPlan = {
  toUpdate: AssetSnapshot[]
  toCreate: {
    assetId: string
    date: string
    amount: number
    currency: string
    note?: string
    flow: number
    createdAt: string
  }[]
  toDelete: string[]
}

export function planSameDaySpendPersist({
  existingSpends,
  drafts,
  baseline,
  assetId,
  date,
  currency,
  nowMs = Date.now(),
}: {
  existingSpends: readonly AssetSnapshot[]
  drafts: readonly SpendLineDraft[]
  baseline: number
  assetId: string
  date: string
  currency: string
  nowMs?: number
}): SameDaySpendPlan {
  const parsed = parseSpendLineDrafts(drafts)
  const remainings = snapshotsFromSpendLines(baseline, parsed)
  const existingById = new Map(existingSpends.map((row) => [row.id, row]))
  const toUpdate: AssetSnapshot[] = []
  const toCreate: SameDaySpendPlan['toCreate'] = []
  const used = new Set<string>()
  let createIndex = 0
  const lastCreated = existingSpends.reduce(
    (latest, row) => (row.createdAt > latest ? row.createdAt : latest),
    '',
  )
  const createStart = Math.max(
    nowMs,
    lastCreated ? Date.parse(lastCreated) + 1 : 0,
  )

  remainings.forEach((entry, index) => {
    const snapshotId = parsed[index]?.snapshotId
    const existing = snapshotId ? existingById.get(snapshotId) : undefined
    const note = entry.note
    if (existing) {
      used.add(existing.id)
      const unchanged =
        existing.amount === entry.remaining &&
        existing.flow === entry.flow &&
        (existing.note ?? '') === (note ?? '')
      if (unchanged) return
      const next: AssetSnapshot = {
        ...existing,
        amount: entry.remaining,
        flow: entry.flow,
        date,
        currency,
      }
      if (note) next.note = note
      else delete next.note
      toUpdate.push(next)
      return
    }
    toCreate.push({
      assetId,
      date,
      amount: entry.remaining,
      currency,
      flow: entry.flow,
      createdAt: spendLineCreatedAt(createIndex, createStart),
      ...(note ? { note } : {}),
    })
    createIndex += 1
  })

  return {
    toUpdate,
    toCreate,
    toDelete: existingSpends
      .filter((row) => !used.has(row.id))
      .map((row) => row.id),
  }
}
