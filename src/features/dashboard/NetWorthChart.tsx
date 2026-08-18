import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatAmount, formatCompactNumber } from '@/shared/lib/money'
import { usePinchZoom } from '@/shared/hooks/usePinchZoom'
import { useLocale, useTranslation } from '@/i18n'

export function NetWorthChart({
  points,
  currency,
  seriesName,
  onZoomIn,
  onZoomOut,
}: {
  points: readonly { date: string; total: number }[]
  currency: string
  seriesName?: string
  onZoomIn?: () => void
  onZoomOut?: () => void
}) {
  const t = useTranslation()
  const locale = useLocale()
  const pinchRef = usePinchZoom(onZoomIn, onZoomOut)
  const name = seriesName ?? t.dashboard.netWorth
  if (points.length === 0) return null

  return (
    <div
      ref={pinchRef}
      className="h-48 w-full touch-pan-y"
      data-testid="net-worth-chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...points]}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(date: string) => date.slice(8)}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            width={52}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(value: number) =>
              formatCompactNumber(value, locale)
            }
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(value) =>
              formatAmount(
                typeof value === 'number' ? value : Number(value),
                currency,
                locale,
              )
            }
            labelFormatter={(label) => String(label)}
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            name={name}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
