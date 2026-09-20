import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  applyBalanceEntry,
  assetBalanceHeadline,
  type BalanceEntryMode,
  isSuggestedUpdate,
  updateBaselineAmount,
} from '@/domain/asset'
import {
  latestSnapshot,
  optionalSnapshotNote,
  sameDaySpendEntries,
  snapshotBeforeDate,
  snapshotOnDate,
  type AssetSnapshot,
} from '@/domain/snapshot'
import { sortAssets } from '@/features/assets/assetListOrder'
import { useAssetReorder } from '@/features/assets/useAssetReorder'
import { useTranslation, useLocale } from '@/i18n'
import { isIsoDateOnOrBefore } from '@/shared/lib/dates'
import {
  formatEditableAmount,
  parseAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { ReorderIconButton } from '@/shared/ui/reorder-icon-button'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  parseSpendLineDrafts,
  planSameDaySpendPersist,
  spendBaselineAmount,
  spendLinesForEditor,
  spendLinesMatchSaved,
  spendSnapshotsToEdit,
  type SpendLineDraft,
} from '@/features/assets/spendLines'
import { UpdateHoldingRow } from './UpdateHoldingRow'

function snapshotWithNote(
  snapshot: AssetSnapshot,
  note: string | undefined,
): AssetSnapshot {
  const next = { ...snapshot }
  if (note) {
    next.note = note
  } else {
    delete next.note
  }
  return next
}

export function UpdateFinancesScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const saveSnapshots = useAssetStore((state) => state.saveSnapshots)
  const updateSnapshot = useAssetStore((state) => state.updateSnapshot)
  const deleteSnapshot = useAssetStore((state) => state.deleteSnapshot)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const assetListSort = useSettingsStore(
    (state) => state.settings.assetListSort,
  )
  const assetListOrder = useSettingsStore(
    (state) => state.settings.assetListOrder,
  )
  const persistCustomAssetOrder = useSettingsStore(
    (state) => state.persistCustomAssetOrder,
  )
  const setBalanceHeadline = useAssetStore((state) => state.setBalanceHeadline)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [entryModes, setEntryModes] = useState<
    Record<string, BalanceEntryMode>
  >({})
  const [spendLines, setSpendLines] = useState<
    Record<string, SpendLineDraft[]>
  >({})
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const today = todayIsoDate()
  const [asOf, setAsOf] = useState(today)
  const [asOfError, setAsOfError] = useState<string | undefined>()
  const reorder = useAssetReorder(assetListOrder)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  const rows = useMemo(() => {
    const tracked = assets
      .filter((asset) => asset.trackingStatus !== 'archived')
      .map((asset) => {
        const latest = latestSnapshot(snapshots, asset.id)
        const onDate = snapshotOnDate(snapshots, asset.id, asOf)
        const previous = snapshotBeforeDate(snapshots, asset.id, asOf)
        return {
          id: asset.id,
          name: asset.name,
          trackingStatus: asset.trackingStatus,
          asset,
          latest,
          onDate,
          previous,
          suggested: isSuggestedUpdate(
            asset.updateFrequency,
            latest?.date,
            today,
          ),
        }
      })
    return sortAssets(tracked, {
      sort: reorder.usingDraft ? 'custom' : assetListSort,
      order: reorder.order,
      locale,
      amountOf: (row) => row.latest?.amount ?? null,
    })
  }, [
    assetListSort,
    assets,
    asOf,
    locale,
    reorder.order,
    reorder.usingDraft,
    snapshots,
    today,
  ])

  function resetDrafts() {
    setDrafts({})
    setNotes({})
    setEditing({})
    setEntryModes({})
    setSpendLines({})
  }

  function startEdit(
    assetId: string,
    amount: number,
    currency: string,
    note?: string,
  ) {
    setEditing((current) => ({ ...current, [assetId]: true }))
    setEntryModes((current) => ({ ...current, [assetId]: 'new_balance' }))
    setDrafts((current) => ({
      ...current,
      [assetId]: formatEditableAmount(amount, locale, currency),
    }))
    setNotes((current) => ({ ...current, [assetId]: note ?? '' }))
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const visibleIds = rows.map((row) => row.asset.id)
    const from = visibleIds.indexOf(String(active.id))
    const to = visibleIds.indexOf(String(over.id))
    if (from < 0 || to < 0) return
    reorder.drop(
      visibleIds,
      assets.map((asset) => asset.id),
      from,
      to,
    )
  }

  function toggleReorder() {
    if (reorder.reordering) {
      void reorder.save(
        persistCustomAssetOrder,
        assets.map((asset) => asset.id),
      )
      return
    }
    const customVisible = sortAssets(
      rows.map((row) => row.asset),
      {
        sort: 'custom',
        order: assetListOrder,
        locale,
        amountOf: (asset) =>
          latestSnapshot(snapshots, asset.id)?.amount ?? null,
      },
    )
    reorder.enter(
      customVisible.map((asset) => asset.id),
      assets.map((asset) => asset.id),
    )
  }

  async function handleSave() {
    if (!isIsoDateOnOrBefore(asOf, today)) {
      setAsOfError(t.asset.snapshotDateInvalid)
      return
    }
    const toWrite: {
      assetId: string
      date: string
      amount: number
      currency: string
      note?: string
      createdAt?: string
    }[] = []
    const toUpdate: AssetSnapshot[] = []
    const toDelete: string[] = []
    for (const { asset, onDate, previous } of rows) {
      if (assetBalanceHeadline(asset) === 'given_spent') {
        const drafted = spendLines[asset.id]
        if (drafted === undefined) continue
        const saved = sameDaySpendEntries(snapshots, asset.id, asOf)
        if (spendLinesMatchSaved(drafted, saved)) continue
        const lines = parseSpendLineDrafts(drafted)
        if (lines.length === 0 && saved.every((entry) => entry.drop <= 0)) {
          continue
        }
        const plan = planSameDaySpendPersist({
          existingSpends: spendSnapshotsToEdit(snapshots, asset.id, asOf),
          drafts: drafted,
          baseline: spendBaselineAmount(
            saved,
            onDate,
            previous,
            asset.currency,
          ),
          assetId: asset.id,
          date: asOf,
          currency: asset.currency,
        })
        toUpdate.push(...plan.toUpdate)
        toWrite.push(...plan.toCreate)
        toDelete.push(...plan.toDelete)
        continue
      }
      const raw = drafts[asset.id]?.trim() ?? ''
      if (onDate && !editing[asset.id]) continue
      if (raw !== '') {
        const parsed = parseAmount(raw)
        if (parsed === undefined) {
          setError(t.update.enterNumberFor(asset.name))
          return
        }
        const amount = applyBalanceEntry(
          entryModes[asset.id] ?? 'new_balance',
          parsed,
          updateBaselineAmount(onDate, previous, asset.currency),
        )
        const note = optionalSnapshotNote(notes[asset.id])
        if (onDate) {
          toUpdate.push(
            snapshotWithNote(
              {
                ...onDate,
                amount,
                date: asOf,
                currency: asset.currency,
              },
              note,
            ),
          )
        } else {
          toWrite.push({
            assetId: asset.id,
            date: asOf,
            amount,
            currency: asset.currency,
            ...(note ? { note } : {}),
          })
        }
        continue
      }
    }
    if (toWrite.length === 0 && toUpdate.length === 0 && toDelete.length === 0) {
      setError(undefined)
      return
    }
    setError(undefined)
    setSaving(true)
    try {
      if (toWrite.length > 0) await saveSnapshots(toWrite)
      for (const snapshot of toUpdate) {
        await updateSnapshot(snapshot)
      }
      for (const id of toDelete) {
        await deleteSnapshot(id)
      }
      resetDrafts()
    } finally {
      setSaving(false)
    }
  }

  const canSave = useMemo(
    () =>
      rows.some(({ asset, onDate }) => {
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
      }),
    [asOf, drafts, editing, rows, snapshots, spendLines],
  )

  const ready = loaded && settingsLoaded
  const showReorder = ready && rows.length > 1
  const reorderButton = showReorder ? (
    <ReorderIconButton
      pressed={reorder.reordering}
      idleLabel={t.assets.enterReorderMode}
      saveLabel={t.update.saveOrder}
      onClick={toggleReorder}
    />
  ) : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div data-testid="update-as-of-bar" className="shrink-0 bg-background">
        <PageHeader
          className="items-center"
          title={t.update.title}
          action={
            <div className="flex items-center gap-2">
              <DateField
                label={t.asset.snapshotDate}
                hideLabel
                value={asOf}
                max={today}
                onChange={(event) => {
                  const next = event.target.value
                  setAsOf(next)
                  resetDrafts()
                  setError(undefined)
                  if (!next || !isIsoDateOnOrBefore(next, today)) {
                    setAsOfError(t.asset.snapshotDateInvalid)
                    return
                  }
                  setAsOfError(undefined)
                }}
                error={asOfError}
              />
              {reorderButton}
            </div>
          }
        />
      </div>
      {!ready ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title={t.update.emptyTitle}
          description={t.update.emptyDescription}
          action={
            <Button asChild>
              <Link to="/assets/new">{t.common.addAsset}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div
            data-testid="update-holdings-scroll"
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-y-contain touch-pan-y"
          >
            {(() => {
              const list = (
                <ul className="flex flex-col gap-4">
                  {rows.map(
                    ({ asset, latest, onDate, previous, suggested }) => (
                      <UpdateHoldingRow
                        key={asset.id}
                        asset={asset}
                        latest={latest}
                        onDate={onDate}
                        previous={previous}
                        suggested={suggested}
                        today={today}
                        locked={Boolean(onDate) && !editing[asset.id]}
                        reordering={reorder.reordering}
                        draft={drafts[asset.id] ?? ''}
                        noteValue={notes[asset.id] ?? ''}
                        entryMode={entryModes[asset.id] ?? 'new_balance'}
                        spendLines={spendLinesForEditor(
                          spendLines[asset.id],
                          sameDaySpendEntries(snapshots, asset.id, asOf),
                          locale,
                          asset.id,
                        )}
                        snapshots={snapshots}
                        onDraftChange={(value) => {
                          setDrafts((current) => ({
                            ...current,
                            [asset.id]: value,
                          }))
                        }}
                        onNoteChange={(value) => {
                          setNotes((current) => ({
                            ...current,
                            [asset.id]: value,
                          }))
                        }}
                        onEntryModeChange={(mode) => {
                          setEntryModes((current) => ({
                            ...current,
                            [asset.id]: mode,
                          }))
                        }}
                        onSpendLinesChange={(lines) => {
                          setSpendLines((current) => ({
                            ...current,
                            [asset.id]: lines,
                          }))
                        }}
                        onHeadlineChange={(headline) => {
                          void setBalanceHeadline(asset.id, headline)
                        }}
                        onStartEdit={() => {
                          if (!onDate) return
                          startEdit(
                            asset.id,
                            onDate.amount,
                            onDate.currency,
                            onDate.note,
                          )
                        }}
                      />
                    ),
                  )}
                </ul>
              )
              if (!reorder.reordering) return list
              return (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={onDragEnd}
                >
                  <SortableContext
                    items={rows.map((row) => row.asset.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {list}
                  </SortableContext>
                </DndContext>
              )
            })()}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!reorder.reordering ? (
            <div
              data-testid="update-save-bar"
              className="shrink-0 bg-background pb-[max(0.5rem,env(keyboard-inset-bottom,0px))]"
            >
              <Button
                type="button"
                className="w-full"
                disabled={saving || !canSave}
                onClick={() => void handleSave()}
              >
                {t.update.saveUpdates}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
