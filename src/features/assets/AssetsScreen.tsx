import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ASSET_CLASSES,
  CLASS_LABELS,
  TYPE_LABELS,
  VALUATION_LABELS,
  type AssetClass,
} from '@/domain/asset'
import { latestSnapshot } from '@/domain/snapshot'
import { convertAmount, lookupRate } from '@/domain/fx'
import { formatAmount } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'

type Filter = 'all' | AssetClass | 'archived'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  ...ASSET_CLASSES.map((id) => ({ id, label: CLASS_LABELS[id] })),
  { id: 'archived', label: 'Archived' },
]

export function AssetsScreen() {
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  const visible = useMemo(() => {
    return assets.filter((asset) => {
      if (filter === 'archived') return asset.trackingStatus === 'archived'
      if (asset.trackingStatus === 'archived') return false
      if (filter === 'all') return true
      return asset.assetClass === filter
    })
  }, [assets, filter])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assets"
        action={
          <Button asChild>
            <Link to="/assets/new">Add</Link>
          </Button>
        }
      />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium',
              filter === item.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {!loaded ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          title={filter === 'archived' ? 'No archived assets' : 'No assets yet'}
          description="Add what you own or owe. Updates stay on this device."
          action={
            <Button asChild>
              <Link to="/assets/new">Add asset</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((asset) => {
            const snapshot = latestSnapshot(snapshots, asset.id)
            const estimated = asset.valuationMethod !== 'account_balance'
            const sameCurrency = snapshot?.currency === baseCurrency
            const rate =
              snapshot &&
              lookupRate(quotes, snapshot.currency, baseCurrency, snapshot.date)
            const converted =
              snapshot && rate !== undefined && !sameCurrency
                ? convertAmount(snapshot.amount, rate)
                : undefined
            return (
              <li key={asset.id}>
                <Link
                  to={`/assets/${asset.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{asset.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {TYPE_LABELS[asset.type]}
                      {estimated
                        ? ` · ${VALUATION_LABELS[asset.valuationMethod]}`
                        : ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {snapshot ? (
                      <>
                        <span className="block tabular-nums">
                          {formatAmount(snapshot.amount, snapshot.currency)}
                        </span>
                        {sameCurrency ? (
                          <span className="text-xs text-muted-foreground">
                            {baseCurrency}
                          </span>
                        ) : converted !== undefined ? (
                          <span className="text-xs text-muted-foreground">
                            est. {formatAmount(converted, baseCurrency)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            native {snapshot.currency}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No value
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
