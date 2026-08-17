import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CLASS_LABELS } from '@/domain/asset'
import { historicalNetWorth, netWorth, periodChange } from '@/domain/netWorth'
import {
  formatAmount,
  formatPercent,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { isoDatesInclusive, monthStartIso } from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { NetWorthChart } from './NetWorthChart'

export function DashboardScreen() {
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const assetsLoaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const fxError = useFxStore((state) => state.error)
  const ensureRange = useFxStore((state) => state.ensureRange)

  const today = todayIsoDate()
  const monthStart = monthStartIso(today)
  const monthDates = useMemo(
    () => isoDatesInclusive(monthStart, today),
    [monthStart, today],
  )

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  useEffect(() => {
    const symbols = [...new Set(snapshots.map((snapshot) => snapshot.currency))]
    void ensureRange(monthStart, today, baseCurrency, symbols)
  }, [baseCurrency, ensureRange, monthStart, snapshots, today])

  const result = useMemo(
    () => netWorth(assets, snapshots, quotes, baseCurrency),
    [assets, baseCurrency, quotes, snapshots],
  )
  const series = useMemo(
    () =>
      historicalNetWorth(assets, snapshots, quotes, monthDates, baseCurrency),
    [assets, baseCurrency, monthDates, quotes, snapshots],
  )
  const change = periodChange(series[0]?.total ?? 0, result.total)

  const classRows = result.byClass.filter((row) => row.amount !== 0)
  const loaded = assetsLoaded && settingsLoaded
  const converted = snapshots.some(
    (snapshot) => snapshot.currency !== baseCurrency,
  )
  const missingCodes = [...new Set(result.missingRates.map((row) => row.from))]
  const fxNote =
    missingCodes.length > 0
      ? `No reference rate for ${missingCodes.join(', ')} on the snapshot date. Where a rate exists it is an ECB estimate, not an executable quote.`
      : converted
        ? 'Converted with ECB reference rates. Estimates, not executable quotes.'
        : fxError
  const changeLabel =
    change.percent === null
      ? `${formatSignedAmount(change.absolute, baseCurrency)} this month`
      : `${formatSignedAmount(change.absolute, baseCurrency)} (${formatPercent(change.percent)}) this month`

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="What you own minus what you owe, in your base currency."
      />
      {!loaded ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : assets.length === 0 ? (
        <EmptyState
          title="No assets yet"
          description="Add what you own or owe to see your first net worth."
          action={
            <Button asChild>
              <Link to="/assets/new">Add asset</Link>
            </Button>
          }
        />
      ) : (
        <>
          <StatCard
            label="Net worth"
            value={formatAmount(result.total, baseCurrency)}
            description={changeLabel}
          />
          {fxNote && <p className="text-sm text-muted-foreground">{fxNote}</p>}
          <NetWorthChart points={series} currency={baseCurrency} />
          {classRows.length > 0 && (
            <ul className="flex flex-col gap-2">
              {classRows.map((row) => (
                <li
                  key={row.assetClass}
                  className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                >
                  <span className="text-sm">
                    {CLASS_LABELS[row.assetClass]}
                  </span>
                  <span className="tabular-nums text-sm">
                    {formatAmount(row.amount, baseCurrency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
