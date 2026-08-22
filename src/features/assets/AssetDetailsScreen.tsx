import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { convertAmount, lookupRate } from '@/domain/fx'
import { assetPerformance } from '@/domain/netWorth'
import { latestSnapshot } from '@/domain/snapshot'
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import { formatLastUpdated, useLocale, useTranslation } from '@/i18n'
import {
  formatOwnershipShare,
  ownershipMultiplier,
} from '@/domain/asset'
import {
  formatAmount,
  formatEditableAmount,
  formatPercent,
  formatSignedAmount,
  parseAmount,
  reformatAmountInput,
  todayIsoDate,
} from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { InfoHint } from '@/shared/ui/info-hint'
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
  const t = useTranslation()
  const locale = useLocale()
  const { id } = useParams()
  const navigate = useNavigate()
  const load = useAssetStore((state) => state.load)
  const saveAsset = useAssetStore((state) => state.saveAsset)
  const saveSnapshots = useAssetStore((state) => state.saveSnapshots)
  const setTrackingStatus = useAssetStore((state) => state.setTrackingStatus)
  const deleteAsset = useAssetStore((state) => state.deleteAsset)
  const asset = useAssetStore((state) =>
    state.assets.find((row) => row.id === id),
  )
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const displayMode = useSettingsStore(
    (state) => state.settings.currencyDisplayMode,
  )
  const quotes = useFxStore((state) => state.quotes)
  const [mode, setMode] = useState<DisplayMode>(displayMode)
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
    return <p className="text-sm text-muted-foreground">{t.common.loading}</p>
  }
  if (!asset) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title={t.asset.notFound} />
        <Button asChild variant="outline">
          <Link to="/assets">{t.asset.backToAssets}</Link>
        </Button>
      </div>
    )
  }

  const currentAsset = asset
  const shareLabel = formatOwnershipShare({
    numerator: asset.ownershipShareNumerator ?? 1,
    denominator: asset.ownershipShareDenominator ?? 1,
  })
  const hasPartialShare = ownershipMultiplier(asset) < 1
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
    const amount = parseAmount(amountDraft)
    if (amount === undefined) {
      setAmountError(t.asset.enterCurrentAmount)
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
        description={`${t.asset.types[asset.type]} · ${asset.currency}`}
      />
      {asset.trackingStatus === 'excluded' && (
        <p className="text-sm font-medium text-muted-foreground">
          {t.asset.notCountedInNetWorth}
        </p>
      )}
      {asset.trackingStatus === 'archived' && (
        <p className="text-sm font-medium text-muted-foreground">
          {t.asset.hiddenFromLists}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'native' ? 'default' : 'outline'}
          onClick={() => setMode('native')}
        >
          {t.asset.native}
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
        label={mode === 'native' ? t.asset.currentValue : t.asset.inBaseCurrency}
        value={
          snapshot
            ? formatAmount(
                mode === 'native'
                  ? snapshot.amount
                  : (convertedAmount ?? snapshot.amount),
                displayCurrency ?? asset.currency,
                locale,
              )
            : '—'
        }
        description={
          snapshot
            ? `${formatLastUpdated(snapshot.date, today, t)}${
                hasPartialShare ? ` · ${t.asset.yourShare(shareLabel)}` : ''
              }`
            : t.asset.noSnapshotsYet
        }
      />
      {change && (
        <p className="text-sm text-muted-foreground">
          {t.asset.sinceFirst}{' '}
          {formatSignedAmount(
            change.absolute,
            displayCurrency ?? asset.currency,
            locale,
          )}
          {change.percent !== null
            ? ` (${formatPercent(change.percent, locale)})`
            : ''}
        </p>
      )}
      {mode === 'base' && convertedAmount === undefined && snapshot && (
        <p className="text-sm text-muted-foreground">
          {t.asset.noRateOnDate(snapshot.currency, snapshot.date)}
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
                ? formatAmount(row.amount, row.currency, locale)
                : formatAmount(
                    convertAmount(row.amount, rate),
                    baseCurrency,
                    locale,
                  )
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
        <InfoHint
          hint={t.asset.updateThisAssetHint}
          label={t.common.aboutField(t.asset.updateThisAsset)}
        >
          <h2 className="text-lg font-semibold">{t.asset.updateThisAsset}</h2>
        </InfoHint>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Input
              aria-label={t.asset.newAmount}
              inputMode="decimal"
              value={amountDraft}
              placeholder={
                snapshot
                  ? formatEditableAmount(
                      snapshot.amount,
                      locale,
                      snapshot.currency,
                    )
                  : t.asset.amountPlaceholder
              }
              className="h-12 pr-12"
              onChange={(event) => setAmountDraft(event.target.value)}
              onBlur={() =>
                setAmountDraft((current) =>
                  reformatAmountInput(current, locale, asset.currency),
                )
              }
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
            {t.common.save}
          </Button>
        </div>
        {amountError && (
          <p className="text-sm text-destructive">{amountError}</p>
        )}
      </section>
      <h2 className="text-lg font-semibold">{t.asset.details}</h2>
      <AssetForm
        initial={asset}
        requireAmount={false}
        submitLabel={t.asset.saveDetails}
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
      {asset.trackingStatus === 'included' && (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void setTrackingStatus(asset.id, 'excluded')}
        >
          {t.asset.excludeFromNetWorth}
        </Button>
      )}
      {asset.trackingStatus === 'excluded' && (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void setTrackingStatus(asset.id, 'included')}
        >
          {t.asset.includeInNetWorth}
        </Button>
      )}
      {asset.trackingStatus !== 'archived' ? (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => {
            void setTrackingStatus(asset.id, 'archived').then(() =>
              navigate('/assets'),
            )
          }}
        >
          {t.asset.hide}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void setTrackingStatus(asset.id, 'included')}
        >
          {t.asset.restore}
        </Button>
      )}
        <Button
          type="button"
          variant="destructive"
          size="xl"
          className="w-full"
          onClick={() => {
            if (!window.confirm(t.asset.deleteConfirm)) return
            void deleteAsset(asset.id).then(() => navigate('/assets'))
          }}
        >
          {t.asset.deleteAsset}
        </Button>
    </div>
  )
}
