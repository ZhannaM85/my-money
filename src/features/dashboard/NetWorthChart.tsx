import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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
import { Chip } from '@/shared/ui/chip'
import { useSettingsStore } from '@/stores/settingsStore'
import { HoldingBreakdownList } from './HoldingBreakdownList'
import { shouldCommitChartDaySelection } from './chartDateTap'

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

/** Remember the hovered/active day; commit only on tap/click (#112, #225). */
function ChartDayHover({
  active,
  payload,
  onHoverDate,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: NetWorthChartPoint }>
  onHoverDate?: (date: string | null) => void
}) {
  const date =
    active && typeof payload?.[0]?.payload?.date === 'string'
      ? payload[0].payload.date
      : null

  // useLayoutEffect (not useEffect): run before paint so deferred touch
  // commits see the active day sooner (#274).
  useLayoutEffect(() => {
    onHoverDate?.(date)
  }, [date, onHoverDate])

  return null
}

export function NetWorthChartTooltip({
  active,
  payload,
  currency,
  onHoverDate,
  showHoldings = true,
}: {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: NetWorthChartPoint }>
  currency: string
  /** Hover/active day only — does not commit As of (#225). */
  onHoverDate?: (date: string | null) => void
  /** When false, still tracks the day (#112) without covering the plot (#141). */
  showHoldings?: boolean
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
      <ChartDayHover
        active={active}
        payload={payload}
        onHoverDate={onHoverDate}
      />
      {point && showHoldings ? (
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
                asOfDate={point.date}
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
  selectedDate,
  onZoomIn,
  onZoomOut,
  onSelectDate,
  onPanEarlier,
  onPanLater,
}: {
  points: readonly NetWorthChartPoint[]
  currency: string
  seriesName?: string
  /** Committed As of day — pin on the plot so it matches the date field (#274). */
  selectedDate?: string | null
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
  const { ref: panRef, pannedRef } = useChartPan(onPanEarlier, onPanLater)
  const onSelectDateRef = useRef(onSelectDate)
  const pendingDateRef = useRef<string | null>(null)
  const awaitingCommitRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const showChartTooltip = useSettingsStore(
    (state) => state.settings.showChartTooltip,
  )
  const setShowChartTooltip = useSettingsStore(
    (state) => state.setShowChartTooltip,
  )

  useEffect(() => {
    onSelectDateRef.current = onSelectDate
  }, [onSelectDate])

  const rememberHoverDate = useCallback((date: string | null) => {
    // Keep the last real day — Recharts may briefly report null between
    // pointerup and the synthetic mouse move on iOS (#274).
    if (date) pendingDateRef.current = date
  }, [])

  const flushAwaitingCommit = useCallback(() => {
    if (!awaitingCommitRef.current) return
    const date = pendingDateRef.current
    if (!date) return
    awaitingCommitRef.current = false
    onSelectDateRef.current?.(date)
  }, [])

  const requestCommitAfterTouch = useCallback(() => {
    // iOS: pointerup runs before synthetic mousemove updates the active day.
    // Wait for that mouse move (or a macrotask) before committing (#274 lag).
    awaitingCommitRef.current = true
    window.setTimeout(() => flushAwaitingCommit(), 0)
  }, [flushAwaitingCommit])

  const name = seriesName ?? t.dashboard.netWorth
  if (points.length === 0) return null
  const totals = points.map((point) => point.total)
  const {
    domain,
    ticks,
    digits: axisDigits,
  } = chartAxisScale(Math.min(...totals), Math.max(...totals), locale)
  const xTicks = uniqueChartAxisDates(points.map((point) => point.date))
  const pinDate =
    selectedDate && points.some((point) => point.date === selectedDate)
      ? selectedDate
      : null

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{t.dashboard.chartTooltip}</span>
        <div
          className="flex gap-2"
          role="group"
          aria-label={t.dashboard.chartTooltip}
          data-testid="chart-tooltip-toggle"
        >
          {(
            [
              { on: true, label: t.dashboard.chartTooltipShow },
              { on: false, label: t.dashboard.chartTooltipHide },
            ] as const
          ).map((item) => (
            <Chip
              key={item.label}
              pressed={showChartTooltip === item.on}
              onClick={() => void setShowChartTooltip(item.on)}
            >
              {item.label}
            </Chip>
          ))}
        </div>
      </div>
      <div
        ref={(node) => {
          pinchRef.current = node
          panRef.current = node
        }}
        className="h-48 w-full touch-pan-y"
        data-testid={NET_WORTH_CHART_TESTID}
        onPointerDown={(event) => {
          if (event.pointerType === 'mouse') return
          pointerStartRef.current = { x: event.clientX, y: event.clientY }
          pannedRef.current = false
          awaitingCommitRef.current = false
        }}
        onPointerUp={(event) => {
          const start = pointerStartRef.current
          pointerStartRef.current = null
          if (!start) return
          if (
            !shouldCommitChartDaySelection(
              event.clientX - start.x,
              event.clientY - start.y,
              pannedRef.current,
            )
          ) {
            return
          }
          requestCommitAfterTouch()
        }}
        onPointerCancel={() => {
          pointerStartRef.current = null
          awaitingCommitRef.current = false
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={[...points]}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              selectDateFromChartState(state, rememberHoverDate)
              flushAwaitingCommit()
            }}
            onClick={(state) => {
              awaitingCommitRef.current = false
              selectDateFromChartState(state, onSelectDateRef.current)
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              ticks={xTicks}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickFormatter={(date: string) =>
                formatChartAxisDate(date, locale)
              }
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
            {pinDate ? (
              <ReferenceLine
                x={pinDate}
                stroke="var(--positive)"
                strokeDasharray="4 4"
                strokeOpacity={0.85}
              />
            ) : null}
            <Tooltip
              content={
                <NetWorthChartTooltip
                  currency={currency}
                  onHoverDate={rememberHoverDate}
                  showHoldings={showChartTooltip}
                />
              }
              wrapperStyle={
                showChartTooltip
                  ? { zIndex: 50, pointerEvents: 'auto' }
                  : { display: 'none' }
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--positive)"
              strokeWidth={2}
              fill="var(--positive)"
              fillOpacity={0.12}
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
