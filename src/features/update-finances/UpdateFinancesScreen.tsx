import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ListOrdered, Pencil, Save } from 'lucide-react'
import { isSuggestedUpdate } from '@/domain/asset'
import { latestSnapshot, snapshotBeforeDate, snapshotOnDate } from '@/domain/snapshot'
import { sortAssets } from '@/features/assets/assetListOrder'
import { useAssetReorder } from '@/features/assets/useAssetReorder'
import { formatLastUpdated, useLocale, useTranslation } from '@/i18n'
import { isIsoDateOnOrBefore } from '@/shared/lib/dates'
import {
  formatAmount,
  formatEditableAmount,
  parseAmount,
  reformatAmountInput,
  todayIsoDate,
} from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'

function SortableUpdateRow({
  id,
  reorderLabel,
  children,
}: {
  id: string
  reorderLabel: string
  children: ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-stretch rounded-xl bg-card ring-1 ring-foreground/10',
        isDragging && 'z-10 opacity-80',
      )}
    >
      <button
        type="button"
        className="flex w-10 shrink-0 items-center justify-center text-muted-foreground"
        aria-label={reorderLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      {children}
    </li>
  )
}

export function UpdateFinancesScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const load = useAssetStore((state) => state.load)
  const saveSnapshots = useAssetStore((state) => state.saveSnapshots)
  const updateSnapshot = useAssetStore((state) => state.updateSnapshot)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const assetListSort = useSettingsStore((state) => state.settings.assetListSort)
  const assetListOrder = useSettingsStore(
    (state) => state.settings.assetListOrder,
  )
  const persistCustomAssetOrder = useSettingsStore(
    (state) => state.persistCustomAssetOrder,
  )
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [unchanged, setUnchanged] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState<Record<string, boolean>>({})
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
    void load()
    void loadSettings()
  }, [load, loadSettings])

  const rows = useMemo(() => {
    const tracked = assets
      .filter((asset) => asset.trackingStatus === 'included')
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

  function markUnchanged(assetId: string, previous?: number, currency?: string) {
    setUnchanged((current) => ({ ...current, [assetId]: true }))
    if (previous !== undefined) {
      setDrafts((current) => ({
        ...current,
        [assetId]: formatEditableAmount(previous, locale, currency),
      }))
    }
  }

  function startEdit(assetId: string, amount: number, currency: string) {
    setEditing((current) => ({ ...current, [assetId]: true }))
    setDrafts((current) => ({
      ...current,
      [assetId]: formatEditableAmount(amount, locale, currency),
    }))
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
    }[] = []
    const toUpdate: {
      id: string
      assetId: string
      date: string
      amount: number
      currency: string
      createdAt: string
      note?: string
    }[] = []
    for (const { asset, previous, onDate } of rows) {
      const raw = drafts[asset.id]?.trim() ?? ''
      if (onDate && !editing[asset.id]) continue
      if (raw !== '') {
        const amount = parseAmount(raw)
        if (amount === undefined) {
          setError(t.update.enterNumberFor(asset.name))
          return
        }
        if (onDate) {
          toUpdate.push({
            ...onDate,
            amount,
            date: asOf,
            currency: asset.currency,
          })
        } else {
          toWrite.push({
            assetId: asset.id,
            date: asOf,
            amount,
            currency: asset.currency,
          })
        }
        continue
      }
      if (!onDate && unchanged[asset.id] && previous) {
        toWrite.push({
          assetId: asset.id,
          date: asOf,
          amount: previous.amount,
          currency: previous.currency,
        })
      }
    }
    if (toWrite.length === 0 && toUpdate.length === 0) {
      setError(t.update.needOneRow)
      return
    }
    setError(undefined)
    setSaving(true)
    try {
      if (toWrite.length > 0) await saveSnapshots(toWrite)
      for (const snapshot of toUpdate) {
        await updateSnapshot(snapshot)
      }
      setDrafts({})
      setUnchanged({})
      setEditing({})
    } finally {
      setSaving(false)
    }
  }

  const ready = loaded && settingsLoaded

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PageHeader
          title={t.update.title}
          action={
            <DateField
              label={t.asset.snapshotDate}
              value={asOf}
              max={today}
              onChange={(event) => {
                const next = event.target.value
                setAsOf(next)
                setDrafts({})
                setUnchanged({})
                setEditing({})
                setError(undefined)
                if (!next || !isIsoDateOnOrBefore(next, today)) {
                  setAsOfError(t.asset.snapshotDateInvalid)
                  return
                }
                setAsOfError(undefined)
              }}
              error={asOfError}
            />
          }
        />
        <p
          data-testid="update-description"
          className="text-sm text-muted-foreground"
        >
          {t.update.description}
        </p>
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
          {rows.length > 1 ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant={reorder.reordering ? 'default' : 'outline'}
                size="icon-xl"
                aria-pressed={reorder.reordering}
                aria-label={
                  reorder.reordering
                    ? t.update.saveOrder
                    : t.assets.enterReorderMode
                }
                onClick={toggleReorder}
              >
                {reorder.reordering ? (
                  <Save className="size-5" aria-hidden />
                ) : (
                  <ListOrdered className="size-5" aria-hidden />
                )}
              </Button>
            </div>
          ) : null}
          {(() => {
            const list = (
              <ul className="flex flex-col gap-4">
                {rows.map(({ asset, latest, onDate, previous, suggested }) => {
                  const locked = Boolean(onDate) && !editing[asset.id]
                  const meta = (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex min-w-0 flex-col">
                          <span className="font-medium">{asset.name}</span>
                          {asset.institution?.trim() ? (
                            <span className="text-xs text-muted-foreground">
                              {asset.institution.trim()}
                            </span>
                          ) : null}
                        </span>
                        {!reorder.reordering ? (
                          <span className="text-sm text-muted-foreground">
                            {latest
                              ? formatAmount(
                                  latest.amount,
                                  latest.currency,
                                  locale,
                                )
                              : t.asset.noValueYet}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatLastUpdated(latest?.date, today, t)}
                        {' · '}
                        {suggested
                          ? t.asset.suggestedNow
                          : t.asset.frequency[asset.updateFrequency]}
                      </p>
                    </>
                  )
                  if (reorder.reordering) {
                    return (
                      <SortableUpdateRow
                        key={asset.id}
                        id={asset.id}
                        reorderLabel={t.assets.reorderAria(asset.name)}
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-2 py-3 pr-4">
                          {meta}
                        </div>
                      </SortableUpdateRow>
                    )
                  }
                  return (
                    <li
                      key={asset.id}
                      className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                    >
                      {meta}
                      <div className="flex gap-2">
                        {locked && onDate ? (
                          <>
                            <span className="flex h-12 min-w-0 flex-1 items-center justify-end tabular-nums font-medium">
                              {formatAmount(
                                onDate.amount,
                                onDate.currency,
                                locale,
                              )}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xl"
                              aria-label={t.update.editAmountAria(asset.name)}
                              onClick={() =>
                                startEdit(
                                  asset.id,
                                  onDate.amount,
                                  onDate.currency,
                                )
                              }
                            >
                              <Pencil className="size-5" aria-hidden />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="relative min-w-0 flex-1">
                              <Input
                                aria-label={t.update.newAmountAria(asset.name)}
                                inputMode="decimal"
                                value={drafts[asset.id] ?? ''}
                                placeholder={
                                  onDate
                                    ? formatEditableAmount(
                                        onDate.amount,
                                        locale,
                                        onDate.currency,
                                      )
                                    : previous
                                      ? formatEditableAmount(
                                          previous.amount,
                                          locale,
                                          previous.currency,
                                        )
                                      : t.asset.amountPlaceholder
                                }
                                className="h-12 pr-12"
                                onChange={(event) => {
                                  const value = event.target.value
                                  setDrafts((current) => ({
                                    ...current,
                                    [asset.id]: value,
                                  }))
                                  if (unchanged[asset.id]) {
                                    setUnchanged((current) => ({
                                      ...current,
                                      [asset.id]: false,
                                    }))
                                  }
                                }}
                                onBlur={() => {
                                  setDrafts((current) => {
                                    const raw = current[asset.id]
                                    if (raw === undefined) return current
                                    return {
                                      ...current,
                                      [asset.id]: reformatAmountInput(
                                        raw,
                                        locale,
                                        asset.currency,
                                      ),
                                    }
                                  })
                                }}
                              />
                              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground">
                                {asset.currency}
                              </span>
                            </div>
                            {!onDate ? (
                              <Button
                                type="button"
                                variant={
                                  unchanged[asset.id] ? 'default' : 'outline'
                                }
                                className={cn('h-12 shrink-0')}
                                disabled={!previous}
                                onClick={() =>
                                  markUnchanged(
                                    asset.id,
                                    previous?.amount,
                                    previous?.currency ?? asset.currency,
                                  )
                                }
                              >
                                {t.update.noChange}
                              </Button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          {!reorder.reordering ? (
            <Button
              type="button"
              size="xl"
              className="w-full"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {t.update.saveUpdates}
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}
