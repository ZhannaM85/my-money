import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { AllocationHolding } from '@/domain/netWorth'
import { useLocale } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'

const SLICE_COLORS = [
  'var(--chart-money)',
  'var(--chart-investments)',
  'var(--chart-property)',
  'var(--chart-valuables)',
  'var(--chart-liabilities)',
]

export interface AllocationChartRow {
  id: string
  name: string
  amount: number
  percent: number
  /** When set (Original + Currency view), format this row in its native code (#108). */
  currency?: string
  /** Converted abs size for the donut when Original + All (#121). */
  shareWeight?: number
  conversionAvailable?: boolean
  /** Class / Currency / Type rows expand to these assets (#122, #123). */
  holdings?: readonly AllocationHolding[]
}

export function AllocationChart({
  rows,
  currency,
  oweLabel,
  conversionUnavailableLabel,
  holdingsLabel,
}: {
  rows: readonly AllocationChartRow[]
  currency: string
  oweLabel: string
  conversionUnavailableLabel: string
  holdingsLabel: string
}) {
  const locale = useLocale()
  const [openId, setOpenId] = useState<string | null>(null)
  const pieData = rows.map((row) => ({
    ...row,
    slice: row.shareWeight ?? Math.abs(row.amount),
  }))
  if (pieData.length === 0) return null

  function amountCurrency(row: { currency?: string }): string {
    return row.currency ?? currency
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-56 w-full" data-testid="allocation-chart">
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
                const code =
                  typeof item?.payload?.currency === 'string'
                    ? item.payload.currency
                    : currency
                return formatAmount(amount, code, locale)
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col gap-2">
        {pieData.map((row, index) => {
          const holdings = row.holdings ?? []
          const expandable = holdings.length > 0
          const open = openId === row.id
          return (
            <li
              key={row.id}
              className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
            >
              {expandable ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={open}
                  aria-label={`${row.name} · ${holdingsLabel}`}
                  onClick={() =>
                    setOpenId((current) => (current === row.id ? null : row.id))
                  }
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        background: SLICE_COLORS[index % SLICE_COLORS.length],
                      }}
                    />
                    {row.name}
                    {row.amount < 0 ? oweLabel : ''}
                  </span>
                  <span className="flex items-center gap-1 text-right text-sm">
                    <span>
                      <span className="block tabular-nums">
                        {formatAmount(row.amount, amountCurrency(row), locale)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {row.conversionAvailable === false
                          ? conversionUnavailableLabel
                          : `${row.percent.toFixed(0)}%`}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform',
                        open && 'rotate-180',
                      )}
                      aria-hidden
                    />
                  </span>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm">
                    <span
                      className="size-2.5 rounded-full"
                      style={{
                        background: SLICE_COLORS[index % SLICE_COLORS.length],
                      }}
                    />
                    {row.name}
                    {row.amount < 0 ? oweLabel : ''}
                  </span>
                  <span className="text-right text-sm">
                    <span className="block tabular-nums">
                      {formatAmount(row.amount, amountCurrency(row), locale)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {row.conversionAvailable === false
                        ? conversionUnavailableLabel
                        : `${row.percent.toFixed(0)}%`}
                    </span>
                  </span>
                </div>
              )}
              {open &&
                holdings.map((holding) => (
                  <div
                    key={holding.assetId}
                    className="flex items-center justify-between gap-3 border-t border-border pt-2"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm">{holding.name}</span>
                      {holding.institution ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {holding.institution}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-sm">
                      {formatAmount(
                        holding.amount,
                        holding.currency,
                        locale,
                      )}
                    </span>
                  </div>
                ))}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
