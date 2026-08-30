import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
import { EllipsisVertical, GripVertical } from 'lucide-react'
import {
  ASSET_CLASSES,
  listOwnershipShare,
  type AssetClass,
} from '@/domain/asset'
import { convertAmount, lookupRate, type RateTable } from '@/domain/fx'
import {
  ASSET_LIST_SORTS,
  type AssetListSort,
  type CurrencyDisplayMode,
} from '@/domain/settings'
import { latestSnapshot, type AssetSnapshot } from '@/domain/snapshot'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'
import { sortAssets } from './assetListOrder'
import { useAssetReorder } from './useAssetReorder'

type Filter = 'all' | AssetClass | 'archived'

function shownAmount(
  snapshot: AssetSnapshot | undefined,
  quotes: RateTable,
  baseCurrency: string,
  displayMode: CurrencyDisplayMode,
): number | null {
  if (!snapshot) return null
  if (displayMode === 'base') {
    const sameCurrency = snapshot.currency === baseCurrency
    const rate = lookupRate(
      quotes,
      snapshot.currency,
      baseCurrency,
      snapshot.date,
    )
    if (rate !== undefined && !sameCurrency) {
      return convertAmount(snapshot.amount, rate)
    }
  }
  return snapshot.amount
}

function SortableAssetRow({
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

function AssetRowMenu({
  name,
  excluded,
  onToggle,
}: {
  name: string
  excluded: boolean
  onToggle: () => void
}) {
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocumentPointerDown(event: PointerEvent) {
      const root = rootRef.current
      if (root && event.target instanceof Node && root.contains(event.target)) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDocumentPointerDown)
    return () =>
      document.removeEventListener('pointerdown', onDocumentPointerDown)
  }, [open])

  const actionLabel = excluded
    ? t.dashboard.showOnPositions
    : t.dashboard.hideFromPositions
  const actionAria = excluded
    ? t.dashboard.showOnPositionsAria(name)
    : t.dashboard.hideFromPositionsAria(name)

  return (
    <div ref={rootRef} className="relative shrink-0 self-stretch">
      <button
        type="button"
        className="flex h-full min-w-11 items-center justify-center px-2 text-muted-foreground"
        aria-label={t.assets.rowMenuAria(name)}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <EllipsisVertical className="size-5" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-2 top-full z-30 min-w-36 rounded-lg bg-card py-1 shadow-md ring-1 ring-foreground/10"
        >
          <button
            type="button"
            role="menuitem"
            className="w-full px-3 py-3 text-left text-sm"
            aria-label={actionAria}
            onClick={() => {
              setOpen(false)
              onToggle()
            }}
          >
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function AssetsScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const loadAssets = useAssetStore((state) => state.load)
  const setTrackingStatus = useAssetStore((state) => state.setTrackingStatus)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const displayMode = useSettingsStore(
    (state) => state.settings.currencyDisplayMode,
  )
  const assetListSort = useSettingsStore(
    (state) => state.settings.assetListSort,
  )
  const assetListOrder = useSettingsStore(
    (state) => state.settings.assetListOrder,
  )
  const setAssetListSort = useSettingsStore((state) => state.setAssetListSort)
  const persistCustomAssetOrder = useSettingsStore(
    (state) => state.persistCustomAssetOrder,
  )
  const quotes = useFxStore((state) => state.quotes)
  const [filter, setFilter] = useState<Filter>('all')
  const reorder = useAssetReorder(assetListOrder)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t.assets.filterAll },
    ...ASSET_CLASSES.map((id) => ({ id, label: t.asset.classes[id] })),
    { id: 'archived', label: t.assets.filterArchived },
  ]
  const sortLabels: Record<AssetListSort, string> = {
    custom: t.assets.sortCustom,
    name_asc: t.assets.sortNameAsc,
    name_desc: t.assets.sortNameDesc,
    amount_asc: t.assets.sortAmountAsc,
    amount_desc: t.assets.sortAmountDesc,
  }

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  const visible = useMemo(() => {
    const filtered = assets.filter((asset) => {
      if (filter === 'archived') return asset.trackingStatus === 'archived'
      if (asset.trackingStatus === 'archived') return false
      if (filter === 'all') return true
      return asset.assetClass === filter
    })
    return sortAssets(filtered, {
      sort: reorder.usingDraft ? 'custom' : assetListSort,
      order: reorder.order,
      locale,
      amountOf: (asset) =>
        shownAmount(
          latestSnapshot(snapshots, asset.id),
          quotes,
          baseCurrency,
          displayMode,
        ),
    })
  }, [
    assetListSort,
    reorder.order,
    reorder.usingDraft,
    assets,
    baseCurrency,
    displayMode,
    filter,
    locale,
    quotes,
    snapshots,
  ])

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const visibleIds = visible.map((asset) => asset.id)
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.assets.title}
        action={
          <Button asChild>
            <Link to="/assets/new">{t.common.add}</Link>
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2" data-testid="asset-filters">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium',
              filter === item.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
            aria-pressed={filter === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      {loaded && assets.length > 0 && (
        <div className="flex gap-2">
          <select
            aria-label={t.assets.sortLabel}
            className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-background px-2.5 text-base"
            value={assetListSort}
            onChange={(event) => {
              const next = event.target.value as AssetListSort
              if (next !== 'custom') reorder.cancel()
              void setAssetListSort(next)
            }}
          >
            {ASSET_LIST_SORTS.map((id) => (
              <option key={id} value={id}>
                {sortLabels[id]}
              </option>
            ))}
          </select>
          {visible.length > 1 && !reorder.reordering ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 shrink-0"
              onClick={() =>
                reorder.enter(
                  visible.map((asset) => asset.id),
                  assets.map((asset) => asset.id),
                )
              }
            >
              {t.assets.enterReorderMode}
            </Button>
          ) : null}
          {reorder.reordering ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-12 shrink-0"
                onClick={() => reorder.cancel()}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="button"
                className="h-12 shrink-0"
                onClick={() =>
                  void reorder.save(
                    persistCustomAssetOrder,
                    assets.map((asset) => asset.id),
                  )
                }
              >
                {t.common.save}
              </Button>
            </>
          ) : null}
        </div>
      )}
      {!loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : visible.length === 0 ? (
        <EmptyState
          title={
            filter === 'archived'
              ? t.assets.emptyArchivedTitle
              : t.assets.emptyTitle
          }
          description={t.assets.emptyDescription}
          action={
            <Button asChild>
              <Link to="/assets/new">{t.common.addAsset}</Link>
            </Button>
          }
        />
      ) : (
        (() => {
          const list = (
            <ul className="flex flex-col gap-2">
              {visible.map((asset) => {
                const snapshot = latestSnapshot(snapshots, asset.id)
                const estimated = asset.valuationMethod !== 'account_balance'
                const share = listOwnershipShare(asset)
                const sameCurrency = snapshot?.currency === baseCurrency
                const rate =
                  snapshot &&
                  lookupRate(
                    quotes,
                    snapshot.currency,
                    baseCurrency,
                    snapshot.date,
                  )
                const converted =
                  snapshot && rate !== undefined && !sameCurrency
                    ? convertAmount(snapshot.amount, rate)
                    : undefined
                const showConverted = displayMode === 'base'
                const primaryAmount =
                  snapshot && showConverted && converted !== undefined
                    ? formatAmount(converted, baseCurrency, locale)
                    : snapshot
                      ? formatAmount(snapshot.amount, snapshot.currency, locale)
                      : null
                const secondaryLabel = sameCurrency
                  ? (snapshot?.currency ?? asset.currency)
                  : t.common.native(snapshot?.currency ?? asset.currency)
                const excluded = asset.trackingStatus === 'excluded'
                const showRowAction =
                  !reorder.reordering && filter !== 'archived'
                const inner = (
                  <Link
                    to={`/assets/${asset.id}`}
                    data-excluded={excluded ? 'true' : 'false'}
                    className={cn(
                      'flex min-w-0 items-center justify-between gap-3',
                      reorder.reordering
                        ? 'flex-1 py-3 pr-4'
                        : showRowAction
                          ? 'min-w-0 flex-1 px-4 py-3'
                          : 'rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10',
                      excluded && 'opacity-60 text-muted-foreground',
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{asset.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {[
                          t.asset.types[asset.type],
                          asset.institution?.trim(),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                        {excluded
                          ? ` · ${t.asset.notCountedInNetWorth}`
                          : ''}
                        {estimated
                          ? ` · ${t.asset.valuation[asset.valuationMethod]}`
                          : ''}
                        {share ? ` · ${t.asset.yourShare(share)}` : ''}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      {snapshot ? (
                        <>
                          <span className="block tabular-nums">
                            {primaryAmount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {secondaryLabel}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t.assets.noValue}
                        </span>
                      )}
                    </span>
                  </Link>
                )
                if (reorder.reordering) {
                  return (
                    <SortableAssetRow
                      key={asset.id}
                      id={asset.id}
                      reorderLabel={t.assets.reorderAria(asset.name)}
                    >
                      {inner}
                    </SortableAssetRow>
                  )
                }
                if (!showRowAction) {
                  return <li key={asset.id}>{inner}</li>
                }
                return (
                  <li
                    key={asset.id}
                    className="relative flex items-stretch rounded-xl bg-card ring-1 ring-foreground/10"
                  >
                    {inner}
                    <AssetRowMenu
                      name={asset.name}
                      excluded={excluded}
                      onToggle={() =>
                        void setTrackingStatus(
                          asset.id,
                          excluded ? 'included' : 'excluded',
                        )
                      }
                    />
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
                items={visible.map((asset) => asset.id)}
                strategy={verticalListSortingStrategy}
              >
                {list}
              </SortableContext>
            </DndContext>
          )
        })()
      )}
    </div>
  )
}
