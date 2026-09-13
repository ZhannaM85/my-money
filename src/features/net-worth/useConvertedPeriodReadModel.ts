import { useEffect, useMemo } from 'react'
import type { Asset } from '@/domain/asset'
import type { RateTable } from '@/domain/fx'
import {
  convertedPeriodReadModel,
  EMPTY_CONVERTED_PERIOD,
} from '@/domain/netWorth'
import type { AssetSnapshot } from '@/domain/snapshot'
import { isoDatesInclusive } from '@/shared/lib/dates'
import { useFxStore } from '@/stores/fxStore'

export function useConvertedPeriodReadModel({
  assets,
  snapshots,
  quotes,
  start,
  chartEnd,
  baseCurrency,
  isOriginal,
}: {
  assets: readonly Asset[]
  snapshots: readonly AssetSnapshot[]
  quotes: RateTable
  start: string
  chartEnd: string
  baseCurrency: string
  isOriginal: boolean
}) {
  const ensureRange = useFxStore((state) => state.ensureRange)
  const dates = useMemo(
    () => isoDatesInclusive(start, chartEnd),
    [start, chartEnd],
  )
  const fxSymbols = useMemo(
    () => [...new Set(snapshots.map((snapshot) => snapshot.currency))],
    [snapshots],
  )

  useEffect(() => {
    if (isOriginal) return
    void ensureRange(start, chartEnd, baseCurrency, fxSymbols)
  }, [baseCurrency, chartEnd, ensureRange, fxSymbols, isOriginal, start])

  const model = useMemo(
    () =>
      isOriginal
        ? EMPTY_CONVERTED_PERIOD
        : convertedPeriodReadModel(
            assets,
            snapshots,
            quotes,
            dates,
            baseCurrency,
          ),
    [assets, baseCurrency, dates, isOriginal, quotes, snapshots],
  )

  return { dates, fxSymbols, ...model }
}
