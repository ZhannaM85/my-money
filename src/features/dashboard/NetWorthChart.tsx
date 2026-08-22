import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HoldingConversion } from '@/domain/netWorth'
import {
  formatAmount,
  formatChartAxisDate,
  formatCompactNumber,
  chartAxisScale,
  uniqueChartAxisDates,
} from '@/shared/lib/money'
import { useDismissOnScroll } from '@/shared/hooks/useDismissOnScroll'
import { usePinchZoom } from '@/shared/hooks/usePinchZoom'
import { useLocale, useTranslation } from '@/i18n'
import { HoldingBreakdownList } from './HoldingBreakdownList'

export interface NetWorthChartPoint {
  date: string
  total: number
  holdings?: readonly HoldingConversion[]
}

export function NetWorthChartTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: NetWorthChartPoint }>
  currency: string
}) {
  const t = useTranslation()
  const locale = useLocale()
  if (!active || payload?.[0]?.payload === undefined) return null
  const point = payload[0].payload
  return (
    <div className="max-h-60 max-w-64 overflow-y-auto rounded-lg border border-border bg-card p-3 text-foreground shadow-md">
      <p className="text-xs font-medium">{point.date}</p>
      {point.holdings && point.holdings.length > 0 && (
        <div className="mt-2">
          <HoldingBreakdownList
            holdings={point.holdings}
            baseCurrency={currency}
            compact
          />
        </div>
      )}
      <p className="mt-2 text-xs font-medium">
        {t.dashboard.netWorth}:{' '}
        {formatAmount(point.total, currency, locale)}
      </p>
    </div>
  )
}

export function NetWorthChart({
  points,
  currency,
  seriesName,
  onZoomIn,
  onZoomOut,
}: {
  points: readonly NetWorthChartPoint[]
  currency: string
  seriesName?: string
  onZoomIn?: () => void
  onZoomOut?: () => void
}) {
  const t = useTranslation()
  const locale = useLocale()
  const pinchRef = usePinchZoom(onZoomIn, onZoomOut)
  const { tooltipActive, allowTooltip } = useDismissOnScroll()
  const name = seriesName ?? t.dashboard.netWorth
  if (points.length === 0) return null
  const totals = points.map((point) => point.total)
  const { domain, ticks, digits: axisDigits } = chartAxisScale(
    Math.min(...totals),
    Math.max(...totals),
    locale,
  )
  const xTicks = uniqueChartAxisDates(points.map((point) => point.date))

  return (
    <div
      ref={pinchRef}
      className="h-48 w-full touch-pan-y"
      data-testid="net-worth-chart"
      onPointerDown={allowTooltip}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...points]}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            ticks={xTicks}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(date: string) => formatChartAxisDate(date, locale)}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            width={68}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickFormatter={(value: number) =>
              formatCompactNumber(value, locale, axisDigits)
            }
            ticks={ticks}
            domain={domain}
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            active={tooltipActive}
            content={<NetWorthChartTooltip currency={currency} />}
            wrapperStyle={{ zIndex: 20, pointerEvents: 'auto' }}
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
