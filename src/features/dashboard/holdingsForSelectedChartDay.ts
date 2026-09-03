import type { HoldingConversion } from '@/domain/netWorth'

export interface ChartDayPoint {
  date: string
  total: number
  holdings?: readonly HoldingConversion[]
}

/** Holdings list for Dashboard Positions: selected chart day, else latest (#112). */
export function holdingsForSelectedChartDay(
  series: readonly ChartDayPoint[],
  selectedDate: string | null,
  fallback: readonly HoldingConversion[],
  /** When the date is outside the visible series (date field #117). */
  outsidePoint?: ChartDayPoint,
): {
  point: ChartDayPoint | undefined
  holdings: readonly HoldingConversion[]
} {
  if (selectedDate === null) {
    return { point: undefined, holdings: fallback }
  }
  const point =
    series.find((row) => row.date === selectedDate) ?? outsidePoint
  const fromPoint = point?.holdings
  if (point && fromPoint && fromPoint.length > 0) {
    return { point, holdings: fromPoint }
  }
  if (point) {
    return { point, holdings: fromPoint ?? fallback }
  }
  return { point: undefined, holdings: fallback }
}
