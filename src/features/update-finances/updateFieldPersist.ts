import { assetBalanceHeadline, type Asset } from '@/domain/asset'
import type { Locale } from '@/domain/settings'
import { sameDaySpendEntries, type AssetSnapshot } from '@/domain/snapshot'
import {
  applyHoldingPersistPlan,
  isEmptyPersistPlan,
  mergePersistPlans,
  planRemainingPersist,
  planSpendPersist,
  type HoldingPersistPlan,
} from '@/features/assets/persistHolding'
import {
  spendLinesForEditor,
  spendLinesMatchSaved,
  type SpendLineDraft,
} from '@/features/assets/spendLines'

export type UpdatePersistRow = {
  asset: Asset
  onDate: AssetSnapshot | undefined
  previous: AssetSnapshot | undefined
}

export type UpdatePersistScope = 'auto' | 'remaining' | 'note' | 'spends'

export function planUpdatePersistRow({
  row,
  scope,
  asOf,
  locale,
  drafts,
  notes,
  editing,
  spendLines,
  snapshots,
  enterNumberFor,
}: {
  row: UpdatePersistRow
  scope: UpdatePersistScope
  asOf: string
  locale: Locale
  drafts: Record<string, string>
  notes: Record<string, string>
  editing: Record<string, boolean>
  spendLines: Record<string, SpendLineDraft[]>
  snapshots: readonly AssetSnapshot[]
  enterNumberFor: (name: string) => string
}): { ok: true; plan: HoldingPersistPlan } | { ok: false; error?: string } {
  const { asset, onDate, previous } = row
  const givenSpent = assetBalanceHeadline(asset) === 'given_spent'
  if (scope === 'spends' || (scope === 'auto' && givenSpent)) {
    if (scope === 'auto' && spendLines[asset.id] === undefined) {
      return { ok: false }
    }
    return planSpendPersist({
      snapshots,
      drafts: spendLinesForEditor(
        spendLines[asset.id],
        sameDaySpendEntries(snapshots, asset.id, asOf),
        locale,
        asset.id,
      ),
      assetId: asset.id,
      date: asOf,
      currency: asset.currency,
      onDate,
      previous,
    })
  }
  if (givenSpent) return { ok: false }
  if (scope === 'auto' && onDate && !editing[asset.id]) return { ok: false }
  if (scope === 'auto' && (drafts[asset.id]?.trim() ?? '') === '') {
    return { ok: false }
  }
  const result = planRemainingPersist({
    assetId: asset.id,
    date: asOf,
    currency: asset.currency,
    draft: drafts[asset.id] ?? '',
    note: notes[asset.id] ?? onDate?.note ?? '',
    entryMode: 'new_balance',
    onDate,
    previous,
    requireAmount: scope === 'auto' || !onDate,
  })
  if (!result.ok && result.error === 'invalid_amount') {
    return { ok: false, error: enterNumberFor(asset.name) }
  }
  if (!result.ok && result.error === 'noop') {
    return { ok: false }
  }
  return result
}

export async function persistUpdatePlan(
  plan: HoldingPersistPlan,
  actions: {
    saveSnapshots: Parameters<
      typeof applyHoldingPersistPlan
    >[1]['saveSnapshots']
    updateSnapshot: (row: AssetSnapshot) => Promise<void>
    deleteSnapshot: (id: string) => Promise<void>
  },
): Promise<boolean> {
  if (isEmptyPersistPlan(plan)) return false
  await applyHoldingPersistPlan(plan, actions)
  return true
}

export function mergeUpdatePlans(
  plans: readonly HoldingPersistPlan[],
): HoldingPersistPlan {
  return mergePersistPlans(plans)
}

export function omitDraftKey<T>(
  current: Record<string, T>,
  key: string,
): Record<string, T> {
  const next = { ...current }
  delete next[key]
  return next
}

export function updateRowCanSave(
  row: UpdatePersistRow,
  asOf: string,
  drafts: Record<string, string>,
  editing: Record<string, boolean>,
  spendLines: Record<string, SpendLineDraft[]>,
  snapshots: readonly AssetSnapshot[],
): boolean {
  const { asset, onDate } = row
  if (assetBalanceHeadline(asset) === 'given_spent') {
    const drafted = spendLines[asset.id]
    if (drafted === undefined) return false
    return !spendLinesMatchSaved(
      drafted,
      sameDaySpendEntries(snapshots, asset.id, asOf),
    )
  }
  if (onDate && !editing[asset.id]) return false
  return (drafts[asset.id]?.trim() ?? '') !== ''
}
