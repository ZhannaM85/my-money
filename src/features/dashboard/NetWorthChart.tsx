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
import {
  CHART_TOOLTIP_SCROLL_CLASS,
  NET_WORTH_CHART_TESTID,
  useDismissOnScroll,
} from '@/shared/hooks/useDismissOnScroll'
import { useChartPan } from '@/shared/hooks/useChartPan'
import { usePinchZoom } from '@/shared/hooks/usePinchZoom'
import { useLocale, useTranslation } from '@/i18n'
import { HoldingBreakdownList } from './HoldingBreakdownList'

export interface NetWorthChartPoint {
  date: string
  total: number
  holdings?: readonly HoldingConversion[]
}

/** Sync Positions / As of when the tooltip becomes active (incl. iOS tap). #112 */
function TooltipDateBridge({
  active,
  payload,
  onSelectDate,
  pinTooltip,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: NetWorthChartPoint }>
  onSelectDate?: (date: string | null) => void
  pinTooltip?: () => void
}) {
  const onSelectDateRef = useRef(onSelectDate)
  const pinTooltipRef = useRef(pinTooltip)
  useEffect(() => {
    onSelectDateRef.current = onSelectDate
    pinTooltipRef.current = pinTooltip
  }, [onSelectDate, pinTooltip])

  const date =
    active && typeof payload?.[0]?.payload?.date === 'string'
      ? payload[0].payload.date
      : null

  useEffect(() => {
    if (date) {
      onSelectDateRef.current?.(date)
      pinTooltipRef.current?.()
    }
  }, [date])

  return null
}

export function NetWorthChartTooltip({
  active,
  payload,
  currency,
  onSelectDate,
  pinTooltip,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: NetWorthChartPoint }>
  currency: string
  onSelectDate?: (date: string | null) => void
  pinTooltip?: () => void
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
      <TooltipDateBridge
        active={active}
        payload={payload}
        onSelectDate={onSelectDate}
        pinTooltip={pinTooltip}
      />
      {point ? (
        <div
          data-testid="chart-holdings-tooltip"
          className={`${CHART_TOOLTIP_SCROLL_CLASS} max-h-[min(32rem,70svh)] max-w-64 overflow-y-scroll overscroll-contain rounded-lg border border-border bg-card p-3 text-foreground shadow-md touch-pan-y`}
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
        </div>
      ) : null}
    </>
  )
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
  /** Called with the tapped chart day, or null when the tooltip is dismissed (#112). */
  onSelectDate?: (date: string | null) => void
  /** Horizontal drag right → earlier history (#111). */
  onPanEarlier?: () => void
  /** Horizontal drag left → later history (#111). */
  onPanLater?: () => void
}) {
  const t = useTranslation()
  const locale = useLocale()
  const { tooltipActive, allowTooltip, pinTooltip, dismissTooltip } =
    useDismissOnScroll()
  const pinchRef = usePinchZoom(onZoomIn, onZoomOut, dismissTooltip)
  const panRef = useChartPan(onPanEarlier, onPanLater)
  const onSelectDateRef = useRef(onSelectDate)

  useEffect(() => {
    onSelectDateRef.current = onSelectDate
  }, [onSelectDate])

  // Do not clear onSelectDate when the tooltip dismisses on scroll (#112).
  // Positions must keep the tapped day; only pan/zoom (parent) clears selection.

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
      onPointerDown={allowTooltip}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...points]}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          onMouseMove={(state) => {
            const payload = (
              state as {
                activePayload?: ReadonlyArray<{ payload?: { date?: string } }>
              }
            )?.activePayload?.[0]?.payload
            const date = payload?.date
            if (typeof date === 'string') {
              onSelectDateRef.current?.(date)
              pinTooltip()
            }
          }}
          onClick={(state) => {
            const payload = (
              state as { activePayload?: ReadonlyArray<{ payload?: { date?: string } }> }
            )?.activePayload?.[0]?.payload
            const date = payload?.date
            if (typeof date === 'string') {
              onSelectDateRef.current?.(date)
              pinTooltip()
            }
          }}
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
            content={
              <NetWorthChartTooltip
                currency={currency}
                onSelectDate={onSelectDate}
                pinTooltip={pinTooltip}
              />
            }
            wrapperStyle={{ zIndex: 20, pointerEvents: 'auto' }}
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
                if (typeof date === 'string') {
                  onSelectDateRef.current?.(date)
                  pinTooltip()
                }
              },
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
