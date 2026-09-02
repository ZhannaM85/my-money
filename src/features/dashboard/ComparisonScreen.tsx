import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { historicalNetWorth } from '@/domain/netWorth'
import type { HoldingConversion } from '@/domain/netWorth'
import {
  comparisonDelta,
  comparisonRows,
  comparisonTotalDelta,
} from '@/features/dashboard/comparisonRows'
import { ComparisonDelta } from '@/features/dashboard/ComparisonDelta'
import { useLocale, useTranslation } from '@/i18n'
import { snapshotOnDate, snapshotsOnOrBefore } from '@/domain/snapshot'
import {
  formatAmount,
  formatChartAxisDate,
  formatEditableAmount,
  parseAmount,
  reformatAmountInput,
} from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'

/** Narrow wrapping name column so two date columns fit a phone (#138). */
export const COMPARISON_NAME_COL_CLASS =
  'w-24 max-w-24 min-w-24 whitespace-normal break-words [overflow-wrap:anywhere]'
/** Date columns grow with the longest amount; extra width scrolls (#182). */
export const COMPARISON_DATE_COL_CLASS = 'whitespace-nowrap min-w-[8.25rem]'

/** Match name-column row heights to date-column rows (#139). */
function syncComparisonRowHeights(
  nameTable: HTMLTableElement | null,
  dateTable: HTMLTableElement | null,
) {
  if (!nameTable || !dateTable) return
  const nameRows = nameTable.querySelectorAll('tr')
  const dateRows = dateTable.querySelectorAll('tr')
  const count = Math.min(nameRows.length, dateRows.length)
  for (let i = 0; i < count; i += 1) {
    const nameRow = nameRows[i]
    const dateRow = dateRows[i]
    if (!nameRow || !dateRow) continue
    nameRow.style.height = ''
    dateRow.style.height = ''
    const height = Math.max(
      nameRow.getBoundingClientRect().height,
      dateRow.getBoundingClientRect().height,
    )
    nameRow.style.height = `${height}px`
    dateRow.style.height = `${height}px`
  }
}

function ComparisonAmountDisplay({
  holding,
  baseline,
  baseCurrency,
}: {
  holding: HoldingConversion | undefined
  baseline: HoldingConversion | undefined
  baseCurrency: string
}) {
  const t = useTranslation()
  const locale = useLocale()
  if (!holding) {
    return <span className="text-muted-foreground">—</span>
  }
  const showNative =
    holding.conversionAvailable &&
    holding.convertedAmount !== null &&
    holding.currency !== baseCurrency
  const delta = comparisonDelta(holding, baseline)
  if (
    !holding.conversionAvailable ||
    holding.convertedAmount === null
  ) {
    return (
      <span className="flex flex-col items-end gap-0.5 whitespace-nowrap">
        <span className="tabular-nums">
          {formatAmount(holding.nativeAmount, holding.currency, locale)}
        </span>
        <span className="text-xs text-muted-foreground">
          {t.dashboard.conversionUnavailable}
        </span>
      </span>
    )
  }
  return (
    <span className="flex flex-col items-end gap-0.5 whitespace-nowrap">
      <span className="tabular-nums font-medium">
        {formatAmount(holding.convertedAmount, baseCurrency, locale)}
      </span>
      <ComparisonDelta delta={delta} currency={baseCurrency} />
      {showNative ? (
        <span className="tabular-nums text-xs text-muted-foreground">
          {formatAmount(holding.nativeAmount, holding.currency, locale)}
        </span>
      ) : null}
    </span>
  )
}

function ComparisonCell({
  assetId,
  name,
  date,
  holding,
  baseline,
  baseCurrency,
}: {
  assetId: string
  name: string
  date: string
  holding: HoldingConversion | undefined
  baseline: HoldingConversion | undefined
  baseCurrency: string
}) {
  const t = useTranslation()
  const locale = useLocale()
  const snapshots = useAssetStore((state) => state.snapshots)
  const assets = useAssetStore((state) => state.assets)
  const saveSnapshots = useAssetStore((state) => state.saveSnapshots)
  const updateSnapshot = useAssetStore((state) => state.updateSnapshot)
  const asset = assets.find((row) => row.id === assetId)
  const onDate = snapshotOnDate(snapshots, assetId, date)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  async function commit() {
    if (!asset) return
    const trimmed = draft.trim()
    if (trimmed === '') {
      setEditing(false)
      return
    }
    const amount = parseAmount(trimmed)
    if (amount === undefined) return
    if (onDate) {
      await updateSnapshot({ ...onDate, amount })
    } else {
      await saveSnapshots([
        {
          assetId,
          date,
          amount,
          currency: asset.currency,
        },
      ])
    }
    setEditing(false)
  }

  if (!asset) {
    return (
      <ComparisonAmountDisplay
        holding={holding}
        baseline={baseline}
        baseCurrency={baseCurrency}
      />
    )
  }

  if (editing) {
    return (
      <span className="flex flex-col items-end gap-1">
        <Input
          aria-label={t.dashboard.comparisonAmountAria(name, date)}
          inputMode="decimal"
          value={draft}
          className="h-10 w-full text-right"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            setDraft(reformatAmountInput(draft, locale, asset.currency))
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t.dashboard.saveComparisonAmount(name, date)}
          onClick={() => void commit()}
        >
          <Check className="size-4" aria-hidden />
        </Button>
      </span>
    )
  }

  return (
    <span className="flex items-start justify-end gap-1 whitespace-nowrap">
      <ComparisonAmountDisplay
        holding={holding}
        baseline={baseline}
        baseCurrency={baseCurrency}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        aria-label={t.dashboard.editComparisonAmount(name, date)}
        onClick={(event) => {
          event.stopPropagation()
          const prior = snapshotsOnOrBefore(snapshots, assetId, date)
          const source = onDate ?? prior
          setDraft(
            source
              ? formatEditableAmount(
                  source.amount,
                  locale,
                  source.currency,
                )
              : '',
          )
          setEditing(true)
        }}
      >
        <Pencil className="size-3.5" aria-hidden />
      </Button>
    </span>
  )
}

export function ComparisonScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const dates = useComparisonStore((state) => state.dates)
  const removeDate = useComparisonStore((state) => state.removeDate)
  const clearDates = useComparisonStore((state) => state.clearDates)

  const confirmRemoveDate = (date: string) => {
    if (!window.confirm(t.dashboard.removeFromComparisonConfirm(date))) return
    removeDate(date)
  }
  const confirmRemoveAll = () => {
    if (!window.confirm(t.dashboard.removeAllFromComparisonConfirm)) return
    clearDates()
  }
  const loadAssets = useAssetStore((state) => state.load)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const loadSettings = useSettingsStore((state) => state.load)
  const settingsLoaded = useSettingsStore((state) => state.loaded)
  const baseCurrency = useSettingsStore((state) => state.settings.baseCurrency)
  const quotes = useFxStore((state) => state.quotes)
  const ensureRates = useFxStore((state) => state.ensureRates)

  useEffect(() => {
    void loadAssets()
    void loadSettings()
  }, [loadAssets, loadSettings])

  useEffect(() => {
    if (!loaded || !settingsLoaded || dates.length === 0) return
    const symbols = [...new Set(snapshots.map((row) => row.currency))]
    void ensureRates(
      dates.flatMap((date) =>
        symbols.map((from) => ({ from, to: baseCurrency, date })),
      ),
    )
  }, [
    baseCurrency,
    dates,
    ensureRates,
    loaded,
    settingsLoaded,
    snapshots,
  ])

  const points = useMemo(
    () =>
      dates.length === 0
        ? []
        : historicalNetWorth(assets, snapshots, quotes, dates, baseCurrency),
    [assets, baseCurrency, dates, quotes, snapshots],
  )
  const rows = useMemo(() => comparisonRows(points), [points])
  const totals = useMemo(() => {
    const byDate: Record<string, number> = {}
    for (const point of points) {
      byDate[point.date] = point.total
    }
    return byDate
  }, [points])
  const nameTableRef = useRef<HTMLTableElement>(null)
  const dateTableRef = useRef<HTMLTableElement>(null)

  useLayoutEffect(() => {
    const sync = () =>
      syncComparisonRowHeights(nameTableRef.current, dateTableRef.current)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [dates, locale, rows, totals])

  if (!loaded || !settingsLoaded) {
    return <p className="text-sm text-muted-foreground">{t.common.loading}</p>
  }

  if (dates.length < 2) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title={t.dashboard.comparisonTitle}
          description={t.dashboard.comparisonDescription}
        />
        <EmptyState
          title={t.dashboard.comparisonNeedTwoDates}
          action={
            <Button asChild variant="outline">
              <Link to="/">{t.nav.dashboard}</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const baselineDate = dates[0] ?? ''

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 overflow-x-hidden">
      <PageHeader
        title={t.dashboard.comparisonTitle}
        description={`${t.dashboard.comparisonDescription} ${t.dashboard.comparisonChangeHint}`}
        action={
          <Button
            type="button"
            variant="outline"
            size="icon-xl"
            aria-label={t.dashboard.removeAllFromComparison}
            onClick={confirmRemoveAll}
          >
            <Trash2 className="size-5" aria-hidden />
          </Button>
        }
      />
      <div
        className="flex w-full min-w-0"
        data-testid="comparison-table"
      >
        <table
          ref={nameTableRef}
          className="w-24 max-w-24 shrink-0 table-fixed border-separate border-spacing-0 text-sm"
        >
          <thead>
            <tr>
              <th
                data-testid="comparison-name-col"
                className={`py-2 pr-2 text-left font-medium text-muted-foreground ${COMPARISON_NAME_COL_CLASS}`}
              >
                {t.dashboard.holdings}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.assetId}>
                <th
                  className={`py-3 pr-2 text-left font-medium ${COMPARISON_NAME_COL_CLASS}`}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="whitespace-normal">{row.name}</span>
                    {row.ownershipShare ? (
                      <span className="text-xs font-normal text-muted-foreground">
                        {t.asset.yourShare(row.ownershipShare)}
                      </span>
                    ) : null}
                  </span>
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th
                className={`py-3 pr-2 text-left font-semibold ${COMPARISON_NAME_COL_CLASS}`}
              >
                {t.dashboard.positionsTotal}
              </th>
            </tr>
          </tfoot>
        </table>
        <div
          data-testid="comparison-h-scroll"
          className="comparison-h-scroll min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain"
        >
          <table
            ref={dateTableRef}
            className="w-max border-separate border-spacing-0 text-sm"
          >
            <thead>
              <tr>
                {dates.map((date) => (
                  <th
                    key={date}
                    className={`px-2 py-2 text-right font-medium text-foreground ${COMPARISON_DATE_COL_CLASS}`}
                  >
                    <span className="inline-flex items-center justify-end gap-1">
                      {formatChartAxisDate(date, locale)}
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={t.dashboard.removeFromComparison(date)}
                        onClick={() => confirmRemoveDate(date)}
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.assetId}>
                  {dates.map((date) => (
                    <td
                      key={date}
                      className={`px-2 py-3 text-right align-top ${COMPARISON_DATE_COL_CLASS}`}
                    >
                      <ComparisonCell
                        assetId={row.assetId}
                        name={row.name}
                        date={date}
                        holding={row.byDate[date]}
                        baseline={
                          date === baselineDate
                            ? undefined
                            : row.byDate[baselineDate]
                        }
                        baseCurrency={baseCurrency}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {dates.map((date) => (
                  <td
                    key={date}
                    className={`px-2 py-3 text-right font-semibold tabular-nums ${COMPARISON_DATE_COL_CLASS}`}
                  >
                    <span className="flex flex-col items-end gap-0.5 whitespace-nowrap">
                      <span>
                        {formatAmount(
                          totals[date] ?? 0,
                          baseCurrency,
                          locale,
                        )}
                      </span>
                      <ComparisonDelta
                        delta={
                          date === baselineDate
                            ? null
                            : comparisonTotalDelta(
                                totals[date],
                                totals[baselineDate],
                              )
                        }
                        currency={baseCurrency}
                      />
                    </span>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
