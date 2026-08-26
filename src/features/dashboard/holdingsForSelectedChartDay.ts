import type { HoldingConversion } from '@/domain/netWorth'

/** Holdings list for Dashboard Positions: selected chart day, else latest (#112). */
export function holdingsForSelectedChartDay<
  T extends { date: string; holdings?: readonly HoldingConversion[] },
>(
  series: readonly T[],
  selectedDate: string | null,
  fallback: readonly HoldingConversion[],
): {
  point: T | undefined
  holdings: readonly HoldingConversion[]
} {
  const point =
    selectedDate === null
      ? undefined
      : series.find((row) => row.date === selectedDate)
  const fromPoint = point?.holdings
  if (fromPoint && fromPoint.length > 0) {
    return { point, holdings: fromPoint }
  }
  const latest = series[series.length - 1]
  return {
    point,
    holdings: latest?.holdings ?? fallback,
  }
}
