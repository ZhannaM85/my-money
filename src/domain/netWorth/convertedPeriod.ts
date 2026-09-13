import type { Asset } from '@/domain/asset'
import type { RateTable } from '@/domain/fx'
import type { AssetSnapshot } from '@/domain/snapshot'
import { historicalNetWorth } from './history'
import { decomposeConvertedPeriodChange, periodChange } from './periodChange'
import type { HistoricalPoint, MissingRate } from './types'

export type ConvertedPeriodBreakdown = ReturnType<
  typeof decomposeConvertedPeriodChange
>

export type ConvertedPeriodReadModel = {
  series: HistoricalPoint[]
  startPoint: HistoricalPoint | undefined
  endPoint: HistoricalPoint | undefined
  breakdown: ConvertedPeriodBreakdown | null
  changeFrom: number
  headlineTo: number
  change: { absolute: number; percent: number | null }
  missingRates: MissingRate[]
}

export const EMPTY_CONVERTED_PERIOD: ConvertedPeriodReadModel = {
  series: [],
  startPoint: undefined,
  endPoint: undefined,
  breakdown: null,
  changeFrom: 0,
  headlineTo: 0,
  change: { absolute: 0, percent: null },
  missingRates: [],
}

/**
 * Shared Converted series + period change + missing rates (#246).
 * Dashboard (today + positions) and History (day list / calendar) both
 * read this so headlines cannot drift from two copies of the same math.
 */
export function convertedPeriodReadModel(
  assets: readonly Asset[],
  snapshots: readonly AssetSnapshot[],
  quotes: RateTable,
  dates: readonly string[],
  baseCurrency: string,
): ConvertedPeriodReadModel {
  if (dates.length === 0) return EMPTY_CONVERTED_PERIOD
  const series = historicalNetWorth(
    assets,
    snapshots,
    quotes,
    dates,
    baseCurrency,
  )
  const startPoint = series[0]
  const endPoint = series[series.length - 1]
  const breakdown =
    startPoint?.holdings && endPoint?.holdings
      ? decomposeConvertedPeriodChange(startPoint.holdings, endPoint.holdings)
      : null
  const changeFrom = startPoint?.total ?? 0
  const headlineTo = breakdown
    ? changeFrom + breakdown.amountChange
    : (endPoint?.total ?? 0)
  return {
    series,
    startPoint,
    endPoint,
    breakdown,
    changeFrom,
    headlineTo,
    change: periodChange(changeFrom, headlineTo),
    missingRates: endPoint?.missingRates ?? [],
  }
}
