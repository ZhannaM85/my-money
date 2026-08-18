import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { historicalNetWorth, netWorth, periodChange } from '@/domain/netWorth'
import { useLocale, useTranslation } from '@/i18n'
import {
  formatAmount,
  formatPercent,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { isoDatesInclusive, rangeStartIso, type HistoryRange } from '@/shared/lib/dates'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { cn } from '@/shared/lib/utils'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { NetWorthChart } from './NetWorthChart'

const RANGES: HistoryRange[] = ['1M', '3M', '6M', '1Y', 'All']

export function DashboardScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const assetsLoaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const ensureRange = useFxStore((state) => state.ensureRange)
  const [range, setRange] = useState<HistoryRange>('1M')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')

  const today = todayIsoDate()

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  const earliest = useMemo(() => {
    if (snapshots.length === 0) return today
    return snapshots.reduce(
      (min, snapshot) => (snapshot.date < min ? snapshot.date : min),
      snapshots[0].date,
    )
  }, [snapshots, today])

  const start = rangeStartIso(range, today, earliest)
  const dates = useMemo(() => isoDatesInclusive(start, today), [start, today])

  const availableCurrencies = useMemo(
    () => [...new Set(snapshots.map((snapshot) => snapshot.currency))].sort(),
    [snapshots],
  )
  const filteredAssets = useMemo(() => {
    if (currencyFilter === 'all') return assets
    return assets.filter((asset) => asset.currency === currencyFilter)
  }, [assets, currencyFilter])
  const filteredAssetIds = useMemo(
    () => new Set(filteredAssets.map((asset) => asset.id)),
    [filteredAssets],
  )
  const filteredSnapshots = useMemo(() => {
    if (currencyFilter === 'all') return snapshots
    return snapshots.filter((snapshot) => filteredAssetIds.has(snapshot.assetId))
  }, [currencyFilter, filteredAssetIds, snapshots])

  useEffect(() => {
    const symbols = [
      ...new Set(filteredSnapshots.map((snapshot) => snapshot.currency)),
    ]
    void ensureRange(start, today, baseCurrency, symbols)
  }, [baseCurrency, ensureRange, filteredSnapshots, start, today])

  const result = useMemo(
    () => netWorth(filteredAssets, filteredSnapshots, quotes, baseCurrency),
    [baseCurrency, filteredAssets, filteredSnapshots, quotes],
  )
  const series = useMemo(
    () =>
      historicalNetWorth(filteredAssets, filteredSnapshots, quotes, dates, baseCurrency),
    [baseCurrency, dates, filteredAssets, filteredSnapshots, quotes],
  )
  const change = periodChange(series[0]?.total ?? 0, result.total)
  const rangeIndex = RANGES.indexOf(range)
  const canZoomIn = rangeIndex > 0
  const canZoomOut = rangeIndex < RANGES.length - 1

  const classRows = result.byClass.filter((row) => row.amount !== 0)
  const loaded = assetsLoaded && settingsLoaded
  const converted = filteredSnapshots.some(
    (snapshot) => snapshot.currency !== baseCurrency,
  )
  const missingCodes = [...new Set(result.missingRates.map((row) => row.from))]
  const fxNote =
    missingCodes.length > 0
      ? t.dashboard.fxMissing(missingCodes.join(', '))
      : converted
        ? t.dashboard.fxConverted
        : undefined
  const changeLabel =
    change.percent === null
      ? `${formatSignedAmount(change.absolute, baseCurrency, locale)} ${range === '1M' ? t.dashboard.thisMonth : t.history.overRange(range)}`
      : `${formatSignedAmount(change.absolute, baseCurrency, locale)} (${formatPercent(change.percent, locale)}) ${range === '1M' ? t.dashboard.thisMonth : t.history.overRange(range)}`

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.dashboard.title}
        description={t.dashboard.description}
      />
      {!loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : assets.length === 0 ? (
        <EmptyState
          title={t.dashboard.emptyTitle}
          description={t.dashboard.emptyDescription}
          action={
            <Button asChild>
              <Link to="/assets/new">{t.common.addAsset}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t.asset.currency}</span>
            <select
              className="h-12 rounded-lg border border-input bg-background px-2.5 text-base"
              value={currencyFilter}
              onChange={(event) => setCurrencyFilter(event.target.value)}
            >
              <option value="all">{t.assets.filterAll}</option>
              {availableCurrencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
          <StatCard
            label={t.dashboard.netWorth}
            value={formatAmount(result.total, baseCurrency, locale)}
            description={changeLabel}
          />
          {fxNote && <p className="text-sm text-muted-foreground">{fxNote}</p>}
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {t.dashboard.zoomRange}: {range}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium',
                  canZoomIn
                    ? 'bg-muted text-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
                disabled={!canZoomIn}
                onClick={() => {
                  if (canZoomIn) setRange(RANGES[rangeIndex - 1])
                }}
              >
                {t.dashboard.zoomIn}
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium',
                  canZoomOut
                    ? 'bg-muted text-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
                disabled={!canZoomOut}
                onClick={() => {
                  if (canZoomOut) setRange(RANGES[rangeIndex + 1])
                }}
              >
                {t.dashboard.zoomOut}
              </button>
            </div>
          </div>
          <NetWorthChart points={series} currency={baseCurrency} />
          {classRows.length > 0 && (
            <ul className="flex flex-col gap-2">
              {classRows.map((row) => (
                <li
                  key={row.assetClass}
                  className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                >
                  <span className="text-sm">
                    {t.asset.classes[row.assetClass]}
                  </span>
                  <span className="tabular-nums text-sm">
                    {formatAmount(row.amount, baseCurrency, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline">
            <Link to="/allocation">{t.dashboard.allocation}</Link>
          </Button>
        </>
      )}
    </div>
  )
}
