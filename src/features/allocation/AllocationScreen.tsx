import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { breakdownBy } from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'

type View = 'class' | 'currency' | 'type'

const SLICE_COLORS = [
  'var(--chart-money)',
  'var(--chart-investments)',
  'var(--chart-property)',
  'var(--chart-valuables)',
  'var(--chart-liabilities)',
]

export function AllocationScreen() {
  const t = useTranslation()
  const locale = useLocale()
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
    slice: Math.abs(row.amount),
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
        <>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="slice"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {pieData.map((row, index) => (
                    <Cell
                      key={row.id}
                      fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => {
                    const amount =
                      typeof item?.payload?.amount === 'number'
                        ? item.payload.amount
                        : Number(value)
                    return formatAmount(amount, baseCurrency, locale)
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-col gap-2">
            {pieData.map((row, index) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      background: SLICE_COLORS[index % SLICE_COLORS.length],
                    }}
                  />
                  {row.name}
                  {row.amount < 0 ? t.common.owe : ''}
                </span>
                <span className="text-right text-sm">
                  <span className="block tabular-nums">
                    {formatAmount(row.amount, baseCurrency, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.percent.toFixed(0)}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
