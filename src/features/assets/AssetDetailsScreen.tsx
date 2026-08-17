import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TYPE_LABELS, lastUpdatedCopy } from '@/domain/asset'
import { convertAmount, lookupRate } from '@/domain/fx'
import { assetPerformance } from '@/domain/netWorth'
import { latestSnapshot } from '@/domain/snapshot'
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import {
  formatAmount,
  formatPercent,
  formatSignedAmount,
  todayIsoDate,
} from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { cn } from '@/shared/lib/utils'
import { AssetForm } from './AssetForm'

type DisplayMode = 'native' | 'base'

export function AssetDetailsScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const load = useAssetStore((state) => state.load)
  const saveAsset = useAssetStore((state) => state.saveAsset)
  const saveSnapshots = useAssetStore((state) => state.saveSnapshots)
  const setTrackingStatus = useAssetStore((state) => state.setTrackingStatus)
  const asset = useAssetStore((state) =>
    state.assets.find((row) => row.id === id),
  )
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const [mode, setMode] = useState<DisplayMode>('native')
  const [amountDraft, setAmountDraft] = useState('')
  const [amountError, setAmountError] = useState<string | undefined>()
  const today = todayIsoDate()

  useEffect(() => {
    void load()
    void loadSettings()
  }, [load, loadSettings])

  const history = useMemo(() => {
    if (!asset) return []
    return snapshots
      .filter((snapshot) => snapshot.assetId === asset.id)
      .slice()
      .sort((a, b) =>
        a.date === b.date
          ? b.createdAt.localeCompare(a.createdAt)
          : b.date.localeCompare(a.date),
      )
  }, [asset, snapshots])

  const ordered = useMemo(() => [...history].reverse(), [history])
  const snapshot = asset ? latestSnapshot(snapshots, asset.id) : undefined
  const performance = asset
    ? assetPerformance(ordered, quotes, baseCurrency)
    : null
  const displayCurrency = mode === 'native' ? asset?.currency : baseCurrency

  const points = ordered.flatMap((row) => {
    if (!asset || !displayCurrency) return []
    if (mode === 'native') {
      return [{ date: row.date, total: row.amount }]
    }
    const rate = lookupRate(quotes, row.currency, baseCurrency, row.date)
    if (rate === undefined) return []
    return [{ date: row.date, total: convertAmount(row.amount, rate) }]
  })

  const convertedNow =
    snapshot && asset
      ? lookupRate(quotes, snapshot.currency, baseCurrency, snapshot.date)
      : undefined
  const convertedAmount =
    snapshot && convertedNow !== undefined
      ? convertAmount(snapshot.amount, convertedNow)
      : undefined

  if (!loaded) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (!asset) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Asset not found" />
        <Button asChild variant="outline">
          <Link to="/assets">Back to assets</Link>
        </Button>
      </div>
    )
  }

  const currentAsset = asset
  const change =
    mode === 'native'
      ? performance
        ? {
            absolute: performance.nativeAbsolute,
            percent: performance.nativePercent,
          }
        : null
      : performance?.baseAbsolute !== undefined &&
          performance.baseAbsolute !== null
        ? {
            absolute: performance.baseAbsolute,
            percent: performance.basePercent,
          }
        : null

  async function saveAmount() {
    const amount = Number(amountDraft)
    if (amountDraft.trim() === '' || Number.isNaN(amount)) {
      setAmountError('Enter a current amount')
      return
    }
    setAmountError(undefined)
    await saveSnapshots([
      {
        assetId: currentAsset.id,
        date: today,
        amount,
        currency: currentAsset.currency,
      },
    ])
    setAmountDraft('')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={asset.name}
        description={`${TYPE_LABELS[asset.type]} · ${asset.currency}`}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'native' ? 'default' : 'outline'}
          onClick={() => setMode('native')}
        >
          Native
        </Button>
        <Button
          type="button"
          variant={mode === 'base' ? 'default' : 'outline'}
          onClick={() => setMode('base')}
        >
          {baseCurrency}
        </Button>
      </div>
      <StatCard
        label={mode === 'native' ? 'Current value' : 'In base currency'}
        value={
          snapshot
            ? formatAmount(
                mode === 'native'
                  ? snapshot.amount
                  : (convertedAmount ?? snapshot.amount),
                displayCurrency ?? asset.currency,
              )
            : '—'
        }
        description={
          snapshot
            ? `${lastUpdatedCopy(snapshot.date, today)}${
                mode === 'native' && convertedAmount !== undefined
                  ? ` · est. ${formatAmount(convertedAmount, baseCurrency)}`
                  : ''
              }`
            : 'No snapshots yet'
        }
      />
      {change && (
        <p className="text-sm text-muted-foreground">
          Since first snapshot:{' '}
          {formatSignedAmount(
            change.absolute,
            displayCurrency ?? asset.currency,
          )}
          {change.percent !== null ? ` (${formatPercent(change.percent)})` : ''}
        </p>
      )}
      {mode === 'base' && convertedAmount === undefined && snapshot && (
        <p className="text-sm text-muted-foreground">
          No reference rate for {snapshot.currency} on {snapshot.date}.
        </p>
      )}
      <NetWorthChart
        points={points}
        currency={displayCurrency ?? asset.currency}
        seriesName={asset.name}
      />
      {history.length > 0 && (
        <ul className="flex flex-col gap-2">
          {history.map((row) => {
            const rate = lookupRate(
              quotes,
              row.currency,
              baseCurrency,
              row.date,
            )
            const shown =
              mode === 'native' || rate === undefined
                ? formatAmount(row.amount, row.currency)
                : formatAmount(convertAmount(row.amount, rate), baseCurrency)
            return (
              <li
                key={row.id}
                className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
              >
                <span className="text-sm text-muted-foreground">
                  {row.date}
                </span>
                <span className="tabular-nums text-sm">{shown}</span>
              </li>
            )
          })}
        </ul>
      )}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Update this asset</h2>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Input
              aria-label="New amount"
              inputMode="decimal"
              value={amountDraft}
              placeholder={snapshot ? String(snapshot.amount) : 'Amount'}
              className="h-12 pr-12"
              onChange={(event) => setAmountDraft(event.target.value)}
            />
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground">
              {asset.currency}
            </span>
          </div>
          <Button
            type="button"
            className={cn('h-12 shrink-0')}
            onClick={() => void saveAmount()}
          >
            Save
          </Button>
        </div>
        {amountError && (
          <p className="text-sm text-destructive">{amountError}</p>
        )}
      </section>
      <h2 className="text-lg font-semibold">Details</h2>
      <AssetForm
        initial={asset}
        requireAmount={false}
        submitLabel="Save details"
        onSubmit={async ({ asset: next, amount }) => {
          await saveAsset(
            next,
            amount === undefined
              ? undefined
              : {
                  assetId: next.id,
                  date: todayIsoDate(),
                  amount,
                  currency: next.currency,
                },
          )
        }}
      />
      {asset.trackingStatus !== 'archived' && (
        <Button
          type="button"
          variant="destructive"
          size="xl"
          className="w-full"
          onClick={() => {
            void setTrackingStatus(asset.id, 'archived').then(() =>
              navigate('/assets'),
            )
          }}
        >
          Archive asset
        </Button>
      )}
    </div>
  )
}
