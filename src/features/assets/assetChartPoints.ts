import { convertAmount, lookupRateOnOrBefore, type RateTable } from '@/domain/fx'
import { snapshotsOnOrBefore } from '@/domain/snapshot'
import type { AssetSnapshot } from '@/domain/snapshot'
import type { NetWorthChartPoint } from '@/features/dashboard/NetWorthChart'

/** Daily series so the asset chart X-axis matches calendar time (#144). */
export function assetChartPoints(
  assetId: string,
  snapshots: readonly AssetSnapshot[],
  dates: readonly string[],
  mode: 'native' | 'base',
  quotes: RateTable,
  baseCurrency: string,
): NetWorthChartPoint[] {
  return dates.flatMap((date) => {
    const snapshot = snapshotsOnOrBefore(snapshots, assetId, date)
    if (!snapshot) return []
    if (mode === 'native') {
      return [{ date, total: snapshot.amount }]
    }
    const rate = lookupRateOnOrBefore(
      quotes,
      snapshot.currency,
      baseCurrency,
      date,
    )
    if (rate === undefined) return []
    const total = convertAmount(snapshot.amount, rate)
    if (snapshot.currency !== baseCurrency) {
      return [
        {
          date,
          total,
          nativeAmount: snapshot.amount,
          nativeCurrency: snapshot.currency,
        },
      ]
    }
    return [{ date, total }]
  })
}
