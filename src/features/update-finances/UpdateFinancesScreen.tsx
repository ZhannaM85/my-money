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
import { isSuggestedUpdate } from '@/domain/asset'
import {
  latestSnapshot,
  sameDaySpendEntries,
  snapshotBeforeDate,
  snapshotOnDate,
} from '@/domain/snapshot'
import { sortAssets } from '@/features/assets/assetListOrder'
import { useAssetReorder } from '@/features/assets/useAssetReorder'
import { useTranslation, useLocale } from '@/i18n'
import { isIsoDateOnOrBefore } from '@/shared/lib/dates'
import { formatEditableAmount, todayIsoDate } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { ReorderIconButton } from '@/shared/ui/reorder-icon-button'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  spendLinesForEditor,
  type SpendLineDraft,
} from '@/features/assets/spendLines'
import {
  mergeUpdatePlans,
  omitDraftKey,
  persistUpdatePlan,
  planUpdatePersistRow,
  updateRowCanSave,
} from './updateFieldPersist'
import { UpdateHoldingRow } from './UpdateHoldingRow'

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
  const [spendLines, setSpendLines] = useState<
    Record<string, SpendLineDraft[]>
  >({})
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const [savingAssetId, setSavingAssetId] = useState<string | undefined>()
  const [fieldStatus, setFieldStatus] = useState<
    Record<string, { message?: string; error?: string }>
  >({})
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
    setSpendLines({})
  }

  function clearAssetDrafts(assetId: string) {
    setDrafts((current) => omitDraftKey(current, assetId))
    setNotes((current) => omitDraftKey(current, assetId))
    setEditing((current) => omitDraftKey(current, assetId))
    setSpendLines((current) => omitDraftKey(current, assetId))
  }

  function startEdit(
    assetId: string,
    amount: number,
    currency: string,
    note?: string,
  ) {
    setEditing((current) => ({ ...current, [assetId]: true }))
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

  function planRow(
    assetId: string,
    scope: 'auto' | 'remaining' | 'note' | 'spends',
  ): ReturnType<typeof planUpdatePersistRow> {
    const row = rows.find((item) => item.asset.id === assetId)
    if (!row) return { ok: false }
    return planUpdatePersistRow({
      row,
      scope,
      asOf,
      locale,
      drafts,
      notes,
      editing,
      spendLines,
      snapshots,
      enterNumberFor: t.update.enterNumberFor,
    })
  }

  async function handleSave() {
    if (!isIsoDateOnOrBefore(asOf, today)) {
      setAsOfError(t.asset.snapshotDateInvalid)
      return
    }
    const plans = []
    for (const { asset } of rows) {
      const result = planRow(asset.id, 'auto')
      if (!result.ok) {
        if (result.error) {
          setError(result.error)
          return
        }
        continue
      }
      plans.push(result.plan)
    }
    setError(undefined)
    setSaving(true)
    try {
      const wrote = await persistUpdatePlan(mergeUpdatePlans(plans), {
        saveSnapshots,
        updateSnapshot,
        deleteSnapshot,
      })
      if (wrote) {
        resetDrafts()
        setFieldStatus({})
      }
    } finally {
      setSaving(false)
    }
  }

  async function saveField(
    assetId: string,
    scope: 'remaining' | 'note' | 'spends',
  ) {
    if (!isIsoDateOnOrBefore(asOf, today)) {
      setAsOfError(t.asset.snapshotDateInvalid)
      return
    }
    const result = planRow(assetId, scope)
    if (!result.ok) {
      setFieldStatus((current) => ({
        ...current,
        [assetId]: { error: result.error },
      }))
      return
    }
    setFieldStatus((current) => ({ ...current, [assetId]: {} }))
    setSavingAssetId(assetId)
    try {
      await persistUpdatePlan(result.plan, {
        saveSnapshots,
        updateSnapshot,
        deleteSnapshot,
      })
      if (scope !== 'spends') clearAssetDrafts(assetId)
      setFieldStatus((current) => ({
        ...current,
        [assetId]: { message: t.update.holdingSaved },
      }))
    } catch {
      setFieldStatus((current) => ({
        ...current,
        [assetId]: { error: t.update.saveFailed },
      }))
    } finally {
      setSavingAssetId(undefined)
    }
  }

  const canSave = useMemo(
    () =>
      rows.some((row) =>
        updateRowCanSave(row, asOf, drafts, editing, spendLines, snapshots),
      ),
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
                        onSaveAmount={() =>
                          void saveField(asset.id, 'remaining')
                        }
                        onSaveSpends={() => void saveField(asset.id, 'spends')}
                        saveDisabled={saving || savingAssetId === asset.id}
                        saveMessage={fieldStatus[asset.id]?.message}
                        saveError={fieldStatus[asset.id]?.error}
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
