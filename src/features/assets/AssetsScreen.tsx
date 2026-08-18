import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ASSET_CLASSES,
  type AssetClass,
} from '@/domain/asset'
import { latestSnapshot } from '@/domain/snapshot'
import { convertAmount, lookupRate } from '@/domain/fx'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'

type Filter = 'all' | AssetClass | 'archived'

export function AssetsScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const [filter, setFilter] = useState<Filter>('all')

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t.assets.filterAll },
    ...ASSET_CLASSES.map((id) => ({ id, label: t.asset.classes[id] })),
    { id: 'archived', label: t.assets.filterArchived },
  ]

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
        title={t.assets.title}
        action={
          <Button asChild>
            <Link to="/assets/new">{t.common.add}</Link>
          </Button>
        }
      />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {filters.map((item) => (
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
            aria-pressed={filter === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
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
                      {t.asset.types[asset.type]}
                      {asset.trackingStatus === 'excluded'
                        ? ` · ${t.asset.notCountedInNetWorth}`
                        : ''}
                      {estimated
                        ? ` · ${t.asset.valuation[asset.valuationMethod]}`
                        : ''}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {snapshot ? (
                      <>
                        <span className="block tabular-nums">
                          {formatAmount(snapshot.amount, snapshot.currency, locale)}
                        </span>
                        {sameCurrency ? (
                          <span className="text-xs text-muted-foreground">
                            {baseCurrency}
                          </span>
                        ) : converted !== undefined ? (
                          <span className="text-xs text-muted-foreground">
                            {t.common.estimated(
                              formatAmount(converted, baseCurrency, locale),
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t.common.native(snapshot.currency)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t.assets.noValue}
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
