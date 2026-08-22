import { useEffect, useMemo, useState } from 'react'
import { breakdownBy } from '@/domain/netWorth'
import { useTranslation } from '@/i18n'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'
import { AllocationChart } from './AllocationChart'

type View = 'class' | 'currency' | 'type'

export function AllocationScreen() {
  const t = useTranslation()
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const [view, setView] = useState<View>('class')

  const views: { id: View; label: string }[] = [
    { id: 'class', label: t.allocation.byClass },
    { id: 'currency', label: t.allocation.byCurrency },
    { id: 'type', label: t.allocation.byType },
  ]

  function labelFor(id: string): string {
    if (view === 'class')
      return t.asset.classes[id as keyof typeof t.asset.classes] ?? id
    if (view === 'type')
      return t.asset.types[id as keyof typeof t.asset.types] ?? id
    return id
  }

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  const rows = useMemo(() => {
    const keyOf =
      view === 'class'
        ? (asset: (typeof assets)[number]) => asset.assetClass
        : view === 'currency'
          ? (asset: (typeof assets)[number]) => asset.currency
          : (asset: (typeof assets)[number]) => asset.type
    return breakdownBy(assets, snapshots, quotes, baseCurrency, keyOf)
  }, [assets, baseCurrency, quotes, snapshots, view])

  const pieData = rows.map((row) => ({
    ...row,
    name: labelFor(row.id),
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.allocation.title}
        description={t.allocation.description}
      />
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
          currency={baseCurrency}
          oweLabel={t.common.owe}
        />
      )}
    </div>
  )
}
