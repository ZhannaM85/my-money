import { useEffect, useMemo, useState } from 'react'
import {
  breakdownBy,
  nativeBreakdownBy,
  nativeTotalsByCurrency,
  attachConvertedSharePercents,
  allocationSliceHoldings,
} from '@/domain/netWorth'
import { ALLOCATION_ALL_SHARE_BASE } from '@/domain/settings'
import { useTranslation } from '@/i18n'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'
import { AllocationChart } from './AllocationChart'

type View = 'class' | 'currency' | 'type'

/** `money::USD` → base key for i18n labels (#108). */
function nativeRowLabelKey(id: string): string {
  const sep = id.indexOf('::')
  return sep === -1 ? id : id.slice(0, sep)
}

export function AllocationScreen() {
  const t = useTranslation()
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const isOriginal =
    useSettingsStore((state) => state.settings.currencyDisplayMode) === 'native'
  const quotes = useFxStore((state) => state.quotes)
  const loadCachedFx = useFxStore((state) => state.loadCached)
  const ensureRange = useFxStore((state) => state.ensureRange)
  const [view, setView] = useState<View>('class')

  const views: { id: View; label: string }[] = [
    { id: 'class', label: t.allocation.byClass },
    { id: 'currency', label: t.allocation.byCurrency },
    { id: 'type', label: t.allocation.byType },
  ]

  function labelFor(id: string): string {
    const key = isOriginal && (view === 'class' || view === 'type')
      ? nativeRowLabelKey(id)
      : id
    if (view === 'class')
      return t.asset.classes[key as keyof typeof t.asset.classes] ?? key
    if (view === 'type')
      return t.asset.types[key as keyof typeof t.asset.types] ?? key
    return id
  }

  useEffect(() => {
    void loadAssets()
    void loadSettings()
    void loadCachedFx()
  }, [loadAssets, loadCachedFx, loadSettings])

  useEffect(() => {
    if (!isOriginal || snapshots.length === 0) return
    const symbols = [
      ...new Set(snapshots.map((snapshot) => snapshot.currency)),
    ]
    const dates = snapshots.map((snapshot) => snapshot.date).sort()
    const start = dates[0]
    const end = dates[dates.length - 1]
    if (!start || !end) return
    void ensureRange(start, end, ALLOCATION_ALL_SHARE_BASE, symbols)
  }, [ensureRange, isOriginal, snapshots])

  const rows = useMemo(() => {
    if (isOriginal && view === 'currency') {
      const asOf =
        snapshots.reduce(
          (latest, snapshot) =>
            snapshot.date > latest ? snapshot.date : latest,
          '',
        ) || '1970-01-01'
      return attachConvertedSharePercents(
        nativeTotalsByCurrency(assets, snapshots).map((row) => ({
          id: row.currency,
          amount: row.amount,
          currency: row.currency,
        })),
        quotes,
        ALLOCATION_ALL_SHARE_BASE,
        asOf,
      )
    }
    const keyOf =
      view === 'class'
        ? (asset: (typeof assets)[number]) => asset.assetClass
        : view === 'currency'
          ? (asset: (typeof assets)[number]) => asset.currency
          : (asset: (typeof assets)[number]) => asset.type
    if (isOriginal && (view === 'class' || view === 'type')) {
      return nativeBreakdownBy(
        assets,
        snapshots,
        keyOf,
        quotes,
        ALLOCATION_ALL_SHARE_BASE,
      )
    }
    return breakdownBy(assets, snapshots, quotes, baseCurrency, keyOf)
  }, [assets, baseCurrency, isOriginal, quotes, snapshots, view])

  const pieData = rows.map((row) => {
    const baseLabel = labelFor(row.id)
    const currency =
      'currency' in row && typeof row.currency === 'string'
        ? row.currency
        : undefined
    const name =
      isOriginal &&
      (view === 'class' || view === 'type') &&
      currency &&
      !baseLabel.includes(currency)
        ? `${baseLabel} · ${currency}`
        : baseLabel
    const holdings =
      view === 'type'
        ? []
        : allocationSliceHoldings(assets, snapshots, (asset, snapshot) => {
            if (view === 'currency') return snapshot.currency === row.id
            if (isOriginal && currency) {
              return (
                asset.assetClass === nativeRowLabelKey(row.id) &&
                snapshot.currency === currency
              )
            }
            return asset.assetClass === row.id
          })
    return {
      ...row,
      name,
      currency,
      holdings,
    }
  })

  const chartCurrency = baseCurrency

  const description =
    isOriginal && view === 'currency'
      ? t.allocation.descriptionOriginalCurrency
      : isOriginal && (view === 'class' || view === 'type')
        ? t.allocation.descriptionOriginalClassType
        : t.allocation.description

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.allocation.title} description={description} />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium',
              view === item.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
            aria-pressed={view === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      {!loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : pieData.length === 0 ? (
        <EmptyState
          title={t.allocation.emptyTitle}
          description={t.allocation.emptyDescription}
        />
      ) : (
        <AllocationChart
          rows={pieData}
          currency={chartCurrency}
          oweLabel={t.common.owe}
          conversionUnavailableLabel={t.dashboard.conversionUnavailable}
          holdingsLabel={t.dashboard.holdings}
        />
      )}
    </div>
  )
}
