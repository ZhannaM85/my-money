import { useEffect, useMemo, useState } from 'react'
import { contributesToNetWorth } from '@/domain/asset'
import {
  breakdownBy,
  nativeBreakdownBy,
  nativeTotalsByCurrency,
} from '@/domain/netWorth'
import { useTranslation } from '@/i18n'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'
import { AllocationChart } from './AllocationChart'

type View = 'class' | 'currency' | 'type'

function withPercents(
  rows: readonly { id: string; amount: number; currency?: string }[],
): { id: string; amount: number; percent: number; currency?: string }[] {
  const absSum = rows.reduce((sum, row) => sum + Math.abs(row.amount), 0)
  return rows
    .map((row) => ({
      ...row,
      percent: absSum === 0 ? 0 : (Math.abs(row.amount) / absSum) * 100,
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
}

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
  }, [loadAssets, loadSettings])

  const rows = useMemo(() => {
    if (isOriginal && view === 'currency') {
      return withPercents(
        nativeTotalsByCurrency(assets, snapshots).map((row) => ({
          id: row.currency,
          amount: row.amount,
          currency: row.currency,
        })),
      )
    }
    const keyOf =
      view === 'class'
        ? (asset: (typeof assets)[number]) => asset.assetClass
        : view === 'currency'
          ? (asset: (typeof assets)[number]) => asset.currency
          : (asset: (typeof assets)[number]) => asset.type
    if (isOriginal && (view === 'class' || view === 'type')) {
      return nativeBreakdownBy(assets, snapshots, keyOf)
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
    return {
      ...row,
      name,
      currency,
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
        />
      )}
    </div>
  )
}
