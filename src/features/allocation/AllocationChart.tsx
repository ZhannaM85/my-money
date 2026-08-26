import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useLocale } from '@/i18n'
import { formatAmount } from '@/shared/lib/money'

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
}

export function AllocationChart({
  rows,
  currency,
  oweLabel,
}: {
  rows: readonly AllocationChartRow[]
  currency: string
  oweLabel: string
}) {
  const locale = useLocale()
  const pieData = rows.map((row) => ({
    ...row,
    slice: Math.abs(row.amount),
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
              {row.amount < 0 ? oweLabel : ''}
            </span>
            <span className="text-right text-sm">
              <span className="block tabular-nums">
                {formatAmount(row.amount, amountCurrency(row), locale)}
              </span>
              <span className="text-xs text-muted-foreground">
                {row.percent.toFixed(0)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
