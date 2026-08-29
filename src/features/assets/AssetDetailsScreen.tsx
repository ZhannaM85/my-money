import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { convertAmount, lookupRate } from '@/domain/fx'
import { assetPerformance } from '@/domain/netWorth'
import { BASE_CURRENCIES } from '@/domain/settings'
import { latestSnapshot, optionalSnapshotNote, hasDuplicateSnapshot } from '@/domain/snapshot'
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import { ChartRangePicker } from '@/features/dashboard/ChartRangePicker'
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
import {
  canZoomHistoryIn,
  canZoomHistoryOut,
  type HistoryRange,
  isIsoDateOnOrBefore,
  rangeStartIso,
  stepHistoryRange,
} from '@/shared/lib/dates'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { InfoHint } from '@/shared/ui/info-hint'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { TextField } from '@/shared/ui/text-field'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AssetForm } from './AssetForm'

type DisplayMode = 'native' | 'base'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  )
}

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
  const deleteSnapshot = useAssetStore((state) => state.deleteSnapshot)
  const updateSnapshot = useAssetStore((state) => state.updateSnapshot)
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
  const [amountDate, setAmountDate] = useState(todayIsoDate())
  const [amountNote, setAmountNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCurrency, setEditCurrency] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editError, setEditError] = useState<string | undefined>()
  const [editingDetails, setEditingDetails] = useState(false)
  const [range, setRange] = useState<HistoryRange>('All')
  const [customStart, setCustomStart] = useState(todayIsoDate)
  const [customEnd, setCustomEnd] = useState(todayIsoDate)
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
  const earliest = ordered[0]?.date ?? today
  const chartEnd = range === 'Custom' ? customEnd : today
  const chartStart = rangeStartIso(range, chartEnd, earliest, customStart)
  const canZoomIn = canZoomHistoryIn(range)
  const canZoomOut = canZoomHistoryOut(range)

  const selectRange = (next: HistoryRange) => {
    if (next === 'Custom' && range !== 'Custom') {
      setCustomStart(chartStart)
      setCustomEnd(chartEnd)
    }
    setRange(next)
  }

  const points = ordered.flatMap((row) => {
    if (!asset || !displayCurrency) return []
    if (row.date < chartStart || row.date > chartEnd) return []
    if (mode === 'native') {
      return [{ date: row.date, total: row.amount }]
    }
    const rate = lookupRate(quotes, row.currency, baseCurrency, row.date)
    if (rate === undefined) return []
    const total = convertAmount(row.amount, rate)
    if (row.currency !== baseCurrency) {
      return [
        {
          date: row.date,
          total,
          nativeAmount: row.amount,
          nativeCurrency: row.currency,
        },
      ]
    }
    return [{ date: row.date, total }]
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
  const parsedAmountDraft = parseAmount(amountDraft)
  const duplicateAmountHint =
    parsedAmountDraft !== undefined &&
    hasDuplicateSnapshot(snapshots, {
      assetId: currentAsset.id,
      date: amountDate,
      amount: parsedAmountDraft,
      currency: currentAsset.currency,
    })
  const parsedEditAmount = parseAmount(editAmount)
  const duplicateEditHint =
    editingId !== null &&
    parsedEditAmount !== undefined &&
    hasDuplicateSnapshot(snapshots, {
      assetId: currentAsset.id,
      date: editDate,
      amount: parsedEditAmount,
      currency: editCurrency,
      excludeId: editingId,
    })
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
    if (!isIsoDateOnOrBefore(amountDate, today)) {
      setAmountError(t.asset.snapshotDateInvalid)
      return
    }
    setAmountError(undefined)
    const note = optionalSnapshotNote(amountNote)
    await saveSnapshots([
      {
        assetId: currentAsset.id,
        date: amountDate,
        amount,
        currency: currentAsset.currency,
        ...(note ? { note } : {}),
      },
    ])
    setAmountDraft('')
    setAmountDate(today)
    setAmountNote('')
  }

  async function saveEditedSnapshot() {
    if (!editingId) return
    const row = snapshots.find((snapshot) => snapshot.id === editingId)
    if (!row) return
    const amount = parseAmount(editAmount)
    if (amount === undefined) {
      setEditError(t.asset.amountMustBeNumber)
      return
    }
    if (!isIsoDateOnOrBefore(editDate, today)) {
      setEditError(t.asset.snapshotDateInvalid)
      return
    }
    setEditError(undefined)
    const note = optionalSnapshotNote(editNote)
    const next = {
      ...row,
      amount,
      date: editDate,
      currency: editCurrency,
    }
    if (note) {
      next.note = note
    } else {
      delete next.note
    }
    await updateSnapshot(next)
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={asset.name}
        description={
          asset.institution?.trim()
            ? `${t.asset.types[asset.type]} · ${asset.institution.trim()} · ${asset.currency}`
            : `${t.asset.types[asset.type]} · ${asset.currency}`
        }
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
                snapshot.note ? ` · ${snapshot.note}` : ''
              }${hasPartialShare ? ` · ${t.asset.yourShare(shareLabel)}` : ''}`
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
      <ChartRangePicker
        range={range}
        onRangeChange={selectRange}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={(value) =>
          setCustomStart(value > customEnd ? customEnd : value)
        }
        onCustomEndChange={(value) =>
          setCustomEnd(value < customStart ? customStart : value)
        }
        earliest={earliest}
        latest={today}
      />
      <NetWorthChart
        points={points}
        currency={displayCurrency ?? asset.currency}
        seriesName={asset.name}
        onZoomIn={() =>
          setRange((current) => stepHistoryRange(current, 'in'))
        }
        onZoomOut={() =>
          setRange((current) => stepHistoryRange(current, 'out'))
        }
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {t.dashboard.zoomRange}:{' '}
          {range === '1W'
            ? t.history.rangeWeek
            : range === '1M'
              ? t.history.rangeMonth
              : range === '1Y'
                ? t.history.rangeYear
                : range === 'All'
                  ? t.history.rangeAll
                  : t.history.rangeCustom}
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
              if (canZoomIn) setRange((current) => stepHistoryRange(current, 'in'))
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
              if (canZoomOut)
                setRange((current) => stepHistoryRange(current, 'out'))
            }}
          >
            {t.dashboard.zoomOut}
          </button>
        </div>
      </div>
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
            const showNativeUnder =
              mode === 'base' &&
              rate !== undefined &&
              row.currency !== baseCurrency
            return editingId === row.id ? (
              <li
                key={row.id}
                className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
              >
                <DateField
                  label={t.asset.snapshotDate}
                  value={editDate}
                  max={today}
                  onChange={(event) => setEditDate(event.target.value)}
                  error={
                    editError === t.asset.snapshotDateInvalid
                      ? editError
                      : undefined
                  }
                />
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-sm font-medium">{t.asset.currency}</span>
                  <select
                    className="h-12 min-w-0 rounded-lg border border-input bg-background px-2.5 text-base"
                    value={editCurrency}
                    aria-label={t.asset.currency}
                    onChange={(event) => {
                      const next = event.target.value
                      setEditCurrency(next)
                      setEditAmount((current) =>
                        reformatAmountInput(current, locale, next),
                      )
                    }}
                  >
                    {(
                      (BASE_CURRENCIES as readonly string[]).includes(
                        editCurrency,
                      )
                        ? BASE_CURRENCIES
                        : [editCurrency, ...BASE_CURRENCIES]
                    ).map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </label>
                <Input
                  aria-label={t.asset.editSnapshotAmount}
                  inputMode="decimal"
                  value={editAmount}
                  className="h-12"
                  onChange={(event) => setEditAmount(event.target.value)}
                  onBlur={() =>
                    setEditAmount((current) =>
                      reformatAmountInput(current, locale, editCurrency),
                    )
                  }
                />
                <TextField
                  label={t.asset.snapshotNote}
                  value={editNote}
                  onChange={(event) => setEditNote(event.target.value)}
                />
                {duplicateEditHint && (
                  <p className="text-sm text-warning" role="status">
                    {t.asset.duplicateSnapshotHint}
                  </p>
                )}
                {editError && editError !== t.asset.snapshotDateInvalid && (
                  <p className="text-sm text-destructive">{editError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="h-12 flex-1"
                    onClick={() => void saveEditedSnapshot()}
                  >
                    {t.common.save}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1"
                    onClick={() => {
                      setEditingId(null)
                      setEditError(undefined)
                    }}
                  >
                    {t.common.cancel}
                  </Button>
                </div>
              </li>
            ) : (
              <li
                key={row.id}
                className="flex flex-col gap-1 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm text-muted-foreground">
                    {row.date}
                  </span>
                  <span className="flex items-start gap-1">
                    <span className="flex flex-col items-end">
                      <span className="tabular-nums text-sm">{shown}</span>
                      {showNativeUnder ? (
                        <span className="tabular-nums text-xs text-muted-foreground">
                          {formatAmount(row.amount, row.currency, locale)}
                        </span>
                      ) : null}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.asset.editSnapshotAria(row.date)}
                      onClick={() => {
                        setEditingId(row.id)
                        setEditDate(row.date)
                        setEditCurrency(row.currency)
                        setEditAmount(
                          formatEditableAmount(
                            row.amount,
                            locale,
                            row.currency,
                          ),
                        )
                        setEditNote(row.note ?? '')
                        setEditError(undefined)
                      }}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.asset.deleteSnapshotAria(row.date)}
                      onClick={() => {
                        if (!window.confirm(t.asset.deleteSnapshotConfirm)) return
                        void deleteSnapshot(row.id)
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </span>
                </span>
                {row.note ? (
                  <span className="text-sm text-muted-foreground">
                    {row.note}
                  </span>
                ) : null}
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
        <DateField
          label={t.asset.snapshotDate}
          value={amountDate}
          max={today}
          onChange={(event) => setAmountDate(event.target.value)}
          error={
            amountError === t.asset.snapshotDateInvalid
              ? amountError
              : undefined
          }
        />
        <TextField
          label={t.asset.snapshotNote}
          value={amountNote}
          onChange={(event) => setAmountNote(event.target.value)}
        />
        <div className="flex min-w-0 flex-col gap-2">
          <div className="relative min-w-0">
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
              className="h-12 min-w-0 pr-12"
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
            className="h-12 w-full"
            onClick={() => void saveAmount()}
          >
            {t.common.save}
          </Button>
        </div>
        {duplicateAmountHint && (
          <p className="text-sm text-warning" role="status">
            {t.asset.duplicateSnapshotHint}
          </p>
        )}
        {amountError && amountError !== t.asset.snapshotDateInvalid && (
          <p className="text-sm text-destructive">{amountError}</p>
        )}
      </section>
      <h2 className="text-lg font-semibold">{t.asset.details}</h2>
      {editingDetails ? (
        <>
          <AssetForm
            initial={asset}
            requireAmount={false}
            submitLabel={t.asset.saveDetails}
            onSubmit={async ({ asset: next, amount, snapshotDate, note }) => {
              await saveAsset(
                next,
                amount === undefined
                  ? undefined
                  : {
                      assetId: next.id,
                      date: snapshotDate ?? todayIsoDate(),
                      amount,
                      currency: next.currency,
                      ...(note ? { note } : {}),
                    },
              )
              setEditingDetails(false)
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="w-full"
            onClick={() => setEditingDetails(false)}
          >
            {t.common.cancel}
          </Button>
        </>
      ) : (
        <>
          <dl className="divide-y divide-border rounded-xl bg-card px-4 ring-1 ring-foreground/10">
            <DetailRow label={t.asset.name} value={asset.name} />
            <DetailRow
              label={t.asset.class}
              value={t.asset.classes[asset.assetClass]}
            />
            <DetailRow
              label={t.asset.type}
              value={t.asset.types[asset.type]}
            />
            <DetailRow label={t.asset.currency} value={asset.currency} />
            {asset.institution ? (
              <DetailRow
                label={t.asset.institutionOptional}
                value={asset.institution}
              />
            ) : null}
            <DetailRow
              label={t.asset.valuationLabel}
              value={t.asset.valuation[asset.valuationMethod]}
            />
            <DetailRow
              label={t.asset.updateFrequency}
              value={t.asset.frequency[asset.updateFrequency]}
            />
            <DetailRow label={t.asset.ownershipShare} value={shareLabel} />
            <DetailRow
              label={t.asset.trackingLabel}
              value={t.asset.tracking[asset.trackingStatus]}
            />
          </dl>
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="w-full"
            onClick={() => setEditingDetails(true)}
          >
            {t.asset.editDetails}
          </Button>
        </>
      )}
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
