import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CLASS_LABELS, TYPE_LABELS } from '@/domain/asset'
import { breakdownBy } from '@/domain/netWorth'
import { formatAmount } from '@/shared/lib/money'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'

type View = 'class' | 'currency' | 'type'

const VIEWS: { id: View; label: string }[] = [
  { id: 'class', label: 'Class' },
  { id: 'currency', label: 'Currency' },
  { id: 'type', label: 'Type' },
]

const SLICE_COLORS = [
  'var(--primary)',
  '#4ade80',
  '#86efac',
  '#166534',
  '#bbf7d0',
  '#22c55e',
]

function labelFor(view: View, id: string): string {
  if (view === 'class')
    return CLASS_LABELS[id as keyof typeof CLASS_LABELS] ?? id
  if (view === 'type') return TYPE_LABELS[id as keyof typeof TYPE_LABELS] ?? id
  return id
}

export function AllocationScreen() {
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const [view, setView] = useState<View>('class')

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
    name: labelFor(view, row.id),
  }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Allocation"
        description="Share of the picture in your base currency. Liabilities are a negative slice — the chart uses size, the list shows the sign."
      />
      <div className="flex gap-2">
        {VIEWS.map((item) => (
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
          >
            {item.label}
          </button>
        ))}
      </div>
      {!loaded ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : pieData.length === 0 ? (
        <EmptyState
          title="Nothing to split yet"
          description="Add included assets to see allocation."
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
                    return formatAmount(amount, baseCurrency)
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
                  {row.amount < 0 ? ' (owe)' : ''}
                </span>
                <span className="text-right text-sm">
                  <span className="block tabular-nums">
                    {formatAmount(row.amount, baseCurrency)}
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
