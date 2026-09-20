import {
  applyBalanceEntry,
  type BalanceEntryMode,
  updateBaselineAmount,
} from '@/domain/asset'
import {
  optionalSnapshotNote,
  sameDaySpendEntries,
  type AssetSnapshot,
} from '@/domain/snapshot'
import { parseAmount } from '@/shared/lib/money'
import {
  parseSpendLineDrafts,
  planSameDaySpendPersist,
  spendBaselineAmount,
  spendLinesMatchSaved,
  spendSnapshotsToEdit,
  type SpendLineDraft,
} from './spendLines'

export type PersistSnapshotCreate = {
  assetId: string
  date: string
  amount: number
  currency: string
  note?: string
  flow?: number
  createdAt?: string
}

export type HoldingPersistPlan = {
  toUpdate: AssetSnapshot[]
  toCreate: PersistSnapshotCreate[]
  toDelete: string[]
}

export type HoldingPersistError = 'invalid_amount' | 'noop'

export type HoldingPersistResult =
  | { ok: true; plan: HoldingPersistPlan }
  | { ok: false; error: HoldingPersistError }

export function emptyPersistPlan(): HoldingPersistPlan {
  return { toUpdate: [], toCreate: [], toDelete: [] }
}

export function isEmptyPersistPlan(plan: HoldingPersistPlan): boolean {
  return (
    plan.toUpdate.length === 0 &&
    plan.toCreate.length === 0 &&
    plan.toDelete.length === 0
  )
}

export function mergePersistPlans(
  plans: readonly HoldingPersistPlan[],
): HoldingPersistPlan {
  return plans.reduce<HoldingPersistPlan>(
    (merged, plan) => ({
      toUpdate: [...merged.toUpdate, ...plan.toUpdate],
      toCreate: [...merged.toCreate, ...plan.toCreate],
      toDelete: [...merged.toDelete, ...plan.toDelete],
    }),
    emptyPersistPlan(),
  )
}

export function snapshotWithNote(
  snapshot: AssetSnapshot,
  note: string | undefined,
): AssetSnapshot {
  const next = { ...snapshot }
  if (note) next.note = note
  else delete next.note
  return next
}

export function planRemainingPersist({
  assetId,
  date,
  currency,
  draft,
  note,
  entryMode,
  onDate,
  previous,
  requireAmount,
  write = 'update',
}: {
  assetId: string
  date: string
  currency: string
  draft: string
  note: string
  entryMode: BalanceEntryMode
  onDate: AssetSnapshot | undefined
  previous: AssetSnapshot | undefined
  requireAmount: boolean
  write?: 'update' | 'append'
}): HoldingPersistResult {
  const raw = draft.trim()
  const parsed = raw === '' ? undefined : parseAmount(raw)
  if (raw !== '' && parsed === undefined) {
    return { ok: false, error: 'invalid_amount' }
  }
  const trimmedNote = optionalSnapshotNote(note)
  if (parsed === undefined) {
    if (requireAmount || !onDate) {
      return { ok: false, error: raw === '' ? 'noop' : 'invalid_amount' }
    }
    const next = snapshotWithNote({ ...onDate, date, currency }, trimmedNote)
    if ((onDate.note ?? '') === (trimmedNote ?? '')) {
      return { ok: false, error: 'noop' }
    }
    return {
      ok: true,
      plan: { toUpdate: [next], toCreate: [], toDelete: [] },
    }
  }
  const amount = applyBalanceEntry(
    entryMode,
    parsed,
    updateBaselineAmount(onDate, previous, currency),
  )
  if (onDate && write === 'update') {
    const next = snapshotWithNote(
      { ...onDate, amount, date, currency },
      trimmedNote,
    )
    const unchanged =
      onDate.amount === amount &&
      onDate.date === date &&
      onDate.currency === currency &&
      (onDate.note ?? '') === (trimmedNote ?? '')
    if (unchanged) return { ok: false, error: 'noop' }
    return {
      ok: true,
      plan: { toUpdate: [next], toCreate: [], toDelete: [] },
    }
  }
  return {
    ok: true,
    plan: {
      toUpdate: [],
      toCreate: [
        {
          assetId,
          date,
          amount,
          currency,
          ...(trimmedNote ? { note: trimmedNote } : {}),
        },
      ],
      toDelete: [],
    },
  }
}

export function planSpendPersist({
  snapshots,
  drafts,
  assetId,
  date,
  currency,
  onDate,
  previous,
}: {
  snapshots: readonly AssetSnapshot[]
  drafts: readonly SpendLineDraft[]
  assetId: string
  date: string
  currency: string
  onDate: AssetSnapshot | undefined
  previous: AssetSnapshot | undefined
}): HoldingPersistResult {
  const saved = sameDaySpendEntries(snapshots, assetId, date)
  if (spendLinesMatchSaved(drafts, saved)) {
    return { ok: false, error: 'noop' }
  }
  const lines = parseSpendLineDrafts(drafts)
  if (lines.length === 0 && saved.every((entry) => entry.drop <= 0)) {
    return { ok: false, error: 'noop' }
  }
  const plan = planSameDaySpendPersist({
    existingSpends: spendSnapshotsToEdit(snapshots, assetId, date),
    drafts,
    baseline: spendBaselineAmount(saved, onDate, previous, currency),
    assetId,
    date,
    currency,
  })
  if (isEmptyPersistPlan(plan)) return { ok: false, error: 'noop' }
  return { ok: true, plan }
}

export function persistPlanToSaveInputs(plan: HoldingPersistPlan): {
  inputs: {
    id?: string
    date: string
    amount: number
    note?: string
    flow?: number
    createdAt?: string
  }[]
  deleteIds: string[]
} {
  return {
    inputs: [
      ...plan.toUpdate.map((row) => ({
        id: row.id,
        date: row.date,
        amount: row.amount,
        ...(row.flow !== undefined ? { flow: row.flow } : {}),
        ...(row.note ? { note: row.note } : {}),
      })),
      ...plan.toCreate.map((row) => ({
        date: row.date,
        amount: row.amount,
        ...(row.createdAt ? { createdAt: row.createdAt } : {}),
        ...(row.flow !== undefined ? { flow: row.flow } : {}),
        ...(row.note ? { note: row.note } : {}),
      })),
    ],
    deleteIds: plan.toDelete,
  }
}

export async function applyHoldingPersistPlan(
  plan: HoldingPersistPlan,
  actions: {
    saveSnapshots: (rows: readonly PersistSnapshotCreate[]) => Promise<void>
    updateSnapshot: (row: AssetSnapshot) => Promise<void>
    deleteSnapshot: (id: string) => Promise<void>
  },
): Promise<void> {
  if (plan.toCreate.length > 0) await actions.saveSnapshots(plan.toCreate)
  for (const snapshot of plan.toUpdate) {
    await actions.updateSnapshot(snapshot)
  }
  for (const id of plan.toDelete) {
    await actions.deleteSnapshot(id)
  }
}
