import {
  useCallback,
  useEffect,
  useRef,
  type TouchEvent as ReactTouchEvent,
} from 'react'
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
import { useChartPan } from '@/shared/hooks/useChartPan'
import { usePinchZoom } from '@/shared/hooks/usePinchZoom'
import { useLocale, useTranslation } from '@/i18n'
import { HoldingBreakdownList } from './HoldingBreakdownList'

export const NET_WORTH_CHART_TESTID = 'net-worth-chart'
export const CHART_TOOLTIP_SCROLL_CLASS = 'chart-tooltip-scroll'

export interface NetWorthChartPoint {
  date: string
  total: number
  holdings?: readonly HoldingConversion[]
  /** Native amount for asset-details Converted tooltip (#136). */
  nativeAmount?: number
  nativeCurrency?: string
}

/** Sync Positions / As of when Recharts has an active point (incl. iOS tap). #112 */
function ChartDaySelect({
  active,
  payload,
  onSelectDate,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: NetWorthChartPoint }>
  onSelectDate?: (date: string | null) => void
}) {
  const onSelectDateRef = useRef(onSelectDate)
  useEffect(() => {
    onSelectDateRef.current = onSelectDate
  }, [onSelectDate])

  const date =
    active && typeof payload?.[0]?.payload?.date === 'string'
      ? payload[0].payload.date
      : null

  useEffect(() => {
    if (date) onSelectDateRef.current?.(date)
  }, [date])

  return null
}

export function NetWorthChartTooltip({
  active,
  payload,
  currency,
  onSelectDate,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: NetWorthChartPoint }>
  currency: string
  onSelectDate?: (date: string | null) => void
}) {
  const t = useTranslation()
  const locale = useLocale()

  /** Single-finger scroll stays in the tooltip; two-finger pinch must reach the chart (#116). */
  const stopSingleFinger = useCallback((event: ReactTouchEvent) => {
    if (event.touches.length < 2) event.stopPropagation()
  }, [])

  const point =
    active && payload?.[0]?.payload !== undefined
      ? payload[0].payload
      : undefined

  return (
    <>
      <ChartDaySelect
        active={active}
        payload={payload}
        onSelectDate={onSelectDate}
      />
      {point ? (
        <div
          data-testid="chart-holdings-tooltip"
          className={`${CHART_TOOLTIP_SCROLL_CLASS} max-h-[min(20rem,calc(100dvh-8rem-env(safe-area-inset-bottom)))] max-w-64 overflow-y-scroll overscroll-contain rounded-lg border border-border bg-card p-3 text-foreground shadow-md touch-pan-y`}
          onPointerDown={(event) => event.stopPropagation()}
          onTouchStart={stopSingleFinger}
          onTouchMove={stopSingleFinger}
          onWheel={(event) => event.stopPropagation()}
        >
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
          {point.nativeAmount !== undefined &&
          point.nativeCurrency &&
          point.nativeCurrency !== currency ? (
            <p
              className="text-xs text-muted-foreground"
              data-testid="chart-tooltip-native"
            >
              {formatAmount(point.nativeAmount, point.nativeCurrency, locale)}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

function selectDateFromChartState(
  state: unknown,
  onSelectDate: ((date: string | null) => void) | undefined,
) {
  const payload = (
    state as {
      activePayload?: ReadonlyArray<{ payload?: { date?: string } }>
    }
  )?.activePayload?.[0]?.payload
  const date = payload?.date
  if (typeof date === 'string') onSelectDate?.(date)
}

export function NetWorthChart({
  points,
  currency,
  seriesName,
  onZoomIn,
  onZoomOut,
  onSelectDate,
  onPanEarlier,
  onPanLater,
}: {
  points: readonly NetWorthChartPoint[]
  currency: string
  seriesName?: string
  onZoomIn: () => void
  onZoomOut: () => void
  /** Called with the tapped chart day (#112). */
  onSelectDate?: (date: string | null) => void
  /** Horizontal drag right → earlier history (#111). */
  onPanEarlier?: () => void
  /** Horizontal drag left → later history (#111). */
  onPanLater?: () => void
}) {
  const t = useTranslation()
  const locale = useLocale()
  const pinchRef = usePinchZoom(onZoomIn, onZoomOut)
  const panRef = useChartPan(onPanEarlier, onPanLater)
  const onSelectDateRef = useRef(onSelectDate)

  useEffect(() => {
    onSelectDateRef.current = onSelectDate
  }, [onSelectDate])

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
      ref={(node) => {
        pinchRef.current = node
        panRef.current = node
      }}
      className="h-48 w-full touch-pan-y"
      data-testid={NET_WORTH_CHART_TESTID}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...points]}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          onMouseMove={(state) =>
            selectDateFromChartState(state, onSelectDateRef.current)
          }
          onClick={(state) =>
            selectDateFromChartState(state, onSelectDateRef.current)
          }
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
            content={
              <NetWorthChartTooltip
                currency={currency}
                onSelectDate={onSelectDate}
              />
            }
            wrapperStyle={{ zIndex: 50, pointerEvents: 'auto' }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
            name={name}
            activeDot={{
              r: 4,
              onClick: (_event, payload) => {
                const date =
                  payload &&
                  typeof payload === 'object' &&
                  'payload' in payload &&
                  payload.payload &&
                  typeof payload.payload === 'object' &&
                  'date' in payload.payload
                    ? (payload.payload as { date?: string }).date
                    : undefined
                if (typeof date === 'string') onSelectDateRef.current?.(date)
              },
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
