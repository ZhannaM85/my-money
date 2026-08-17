import { useEffect, useMemo, useState } from 'react'
import { historicalNetWorth, netWorth, periodChange } from '@/domain/netWorth'
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import { useLocale, useTranslation } from '@/i18n'
import {
  isoDatesInclusive,
  rangeStartIso,
  type HistoryRange,
} from '@/shared/lib/dates'
import {
  formatAmount,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'

const RANGES: HistoryRange[] = ['1M', '3M', '6M', '1Y', 'All']

export function HistoryScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const ensureRange = useFxStore((state) => state.ensureRange)
  const [range, setRange] = useState<HistoryRange>('3M')
  const today = todayIsoDate()

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  const earliest = useMemo(() => {
    if (snapshots.length === 0) return today
    return snapshots.reduce(
      (min, snapshot) => (snapshot.date < min ? snapshot.date : min),
      snapshots[0].date,
    )
  }, [snapshots, today])

  const start = rangeStartIso(range, today, earliest)
  const dates = useMemo(() => isoDatesInclusive(start, today), [start, today])

  useEffect(() => {
    const symbols = [...new Set(snapshots.map((snapshot) => snapshot.currency))]
    void ensureRange(start, today, baseCurrency, symbols)
  }, [baseCurrency, ensureRange, snapshots, start, today])

  const current = useMemo(
    () => netWorth(assets, snapshots, quotes, baseCurrency),
    [assets, baseCurrency, quotes, snapshots],
  )
  const series = useMemo(
    () => historicalNetWorth(assets, snapshots, quotes, dates, baseCurrency),
    [assets, baseCurrency, dates, quotes, snapshots],
  )
  const change = periodChange(series[0]?.total ?? 0, current.total)
  const list = useMemo(() => {
    return [...series].reverse().map((point, index, rows) => {
      const older = rows[index + 1]
      return {
        ...point,
        delta: older ? point.total - older.total : null,
      }
    })
  }, [series])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.history.title}
        description={t.history.description}
      />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {RANGES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium',
              range === item
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
            aria-pressed={range === item}
          >
            {item}
          </button>
        ))}
      </div>
      {!loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : assets.length === 0 ? (
        <EmptyState
          title={t.history.emptyTitle}
          description={t.history.emptyDescription}
        />
      ) : (
        <>
          <StatCard
            label={t.dashboard.netWorth}
            value={formatAmount(current.total, baseCurrency, locale)}
            description={`${formatSignedAmount(change.absolute, baseCurrency, locale)} ${t.history.overRange(range)}`}
          />
          <NetWorthChart points={series} currency={baseCurrency} />
          <ul className="flex flex-col gap-2">
            {list.map((row) => (
              <li
                key={row.date}
                className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
              >
                <span className="text-sm text-muted-foreground">
                  {row.date}
                </span>
                <span className="text-right">
                  <span className="block tabular-nums text-sm">
                    {formatAmount(row.total, baseCurrency, locale)}
                  </span>
                  {row.delta !== null && (
                    <span className="text-xs text-muted-foreground">
                      {formatSignedAmount(row.delta, baseCurrency, locale)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
