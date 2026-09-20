import { Pencil } from 'lucide-react'
import {
  applyBalanceEntry,
  assetBalanceHeadline,
  cumulativeGivenSpent,
  headlineNativeAmount,
  type Asset,
  type BalanceEntryMode,
  type BalanceHeadline,
  updateBaselineAmount,
} from '@/domain/asset'
import type { AssetSnapshot } from '@/domain/snapshot'
import { ComparisonDelta } from '@/features/dashboard/ComparisonDelta'
import { formatLastUpdated, useLocale, useTranslation } from '@/i18n'
import {
  formatAmount,
  formatCalendarDate,
  formatEditableAmount,
  parseAmount,
} from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { SortableRow } from '@/shared/ui/sortable-row'
import {
  AssetBalanceUpdateControls,
  BalanceHeadlineToggles,
} from '@/features/assets/AssetBalanceUpdateControls'

export function UpdateHoldingRow({
  asset,
  latest,
  onDate,
  previous,
  suggested,
  today,
  locked,
  reordering,
  draft,
  noteValue,
  entryMode,
  snapshots,
  onDraftChange,
  onNoteChange,
  onEntryModeChange,
  onHeadlineChange,
  onStartEdit,
}: {
  asset: Asset
  latest: AssetSnapshot | undefined
  onDate: AssetSnapshot | undefined
  previous: AssetSnapshot | undefined
  suggested: boolean
  today: string
  locked: boolean
  reordering: boolean
  draft: string
  noteValue: string
  entryMode: BalanceEntryMode
  snapshots: readonly AssetSnapshot[]
  onDraftChange: (value: string) => void
  onNoteChange: (value: string) => void
  onEntryModeChange: (mode: BalanceEntryMode) => void
  onHeadlineChange: (headline: BalanceHeadline) => void
  onStartEdit: () => void
}) {
  const t = useTranslation()
  const locale = useLocale()
  const headline = assetBalanceHeadline(asset)
  const givenSpent = cumulativeGivenSpent(snapshots, asset.id)
  const displayed = headlineNativeAmount(headline, latest?.amount, givenSpent)
  const baseline = updateBaselineAmount(onDate, previous, asset.currency)
  const parsedDraft =
    !locked && draft.trim() !== '' ? parseAmount(draft) : undefined
  const resolvedAmount =
    parsedDraft === undefined
      ? undefined
      : applyBalanceEntry(entryMode, parsedDraft, baseline)
  const editDelta =
    !locked &&
    previous &&
    previous.currency === asset.currency &&
    resolvedAmount !== undefined &&
    resolvedAmount !== previous.amount
      ? resolvedAmount - previous.amount
      : null
  const placeholderSource = onDate ?? previous

  const meta = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col">
          <span className="font-medium">{asset.name}</span>
          {asset.institution?.trim() ? (
            <span className="text-xs text-muted-foreground">
              {asset.institution.trim()}
            </span>
          ) : null}
          {asset.trackingStatus === 'excluded' ? (
            <span className="text-xs text-muted-foreground">
              {t.asset.notCountedInNetWorth}
            </span>
          ) : null}
        </span>
        {!reordering ? (
          <span className="text-sm text-muted-foreground">
            {displayed !== undefined && latest
              ? formatAmount(displayed, latest.currency, locale)
              : displayed !== undefined
                ? formatAmount(displayed, asset.currency, locale)
                : t.asset.noValueYet}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {formatLastUpdated(latest?.date, today, t)}
        {' · '}
        {suggested
          ? t.asset.suggestedNow
          : t.asset.frequency[asset.updateFrequency]}
      </p>
    </>
  )

  if (reordering) {
    return (
      <SortableRow
        id={asset.id}
        reorderLabel={t.assets.reorderAria(asset.name)}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-3 pr-4">
          {meta}
        </div>
      </SortableRow>
    )
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
      {meta}
      {locked && onDate ? (
        <>
          <BalanceHeadlineToggles
            headline={headline}
            onHeadlineChange={onHeadlineChange}
          />
          <div className="flex gap-2">
            <span className="flex h-control min-w-0 flex-1 items-center justify-end tabular-nums font-medium">
              {formatAmount(onDate.amount, onDate.currency, locale)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon-xl"
              aria-label={t.update.editAmountAria(asset.name)}
              onClick={onStartEdit}
            >
              <Pencil className="size-5" aria-hidden />
            </Button>
          </div>
          {onDate.note ? (
            <span
              data-testid={`update-note-saved-${asset.id}`}
              className="text-sm text-muted-foreground"
            >
              {onDate.note}
            </span>
          ) : null}
        </>
      ) : (
        <>
          <Input
            data-testid={`update-note-${asset.id}`}
            aria-label={t.update.noteAria(asset.name)}
            placeholder={t.asset.snapshotNote}
            value={noteValue}
            onChange={(event) => onNoteChange(event.target.value)}
          />
          <AssetBalanceUpdateControls
            amountAriaLabel={t.update.newAmountAria(asset.name)}
            locale={locale}
            currency={asset.currency}
            headline={headline}
            onHeadlineChange={onHeadlineChange}
            entryMode={entryMode}
            onEntryModeChange={onEntryModeChange}
            draft={draft}
            onDraftChange={onDraftChange}
            placeholder={
              entryMode === 'new_balance' && placeholderSource
                ? formatEditableAmount(
                    placeholderSource.amount,
                    locale,
                    placeholderSource.currency,
                  )
                : t.asset.amountPlaceholder
            }
            resultingRemaining={
              entryMode === 'new_balance' ? undefined : resolvedAmount
            }
          />
        </>
      )}
      {!locked && previous && !onDate ? (
        <p
          className="text-xs text-muted-foreground"
          data-testid={`suggested-from-date-${asset.id}`}
        >
          {t.update.suggestedFromDate(
            formatCalendarDate(previous.date, locale),
          )}
        </p>
      ) : null}
      {editDelta !== null && previous ? (
        <p
          className="flex flex-wrap items-center justify-end gap-1.5"
          data-testid={`update-edit-delta-${asset.id}`}
        >
          <ComparisonDelta delta={editDelta} currency={previous.currency} />
          <span className="text-xs text-muted-foreground">
            {t.update.deltaVsDate(formatCalendarDate(previous.date, locale))}
          </span>
        </p>
      ) : null}
      {locked &&
      onDate &&
      previous &&
      onDate.currency === previous.currency &&
      onDate.amount !== previous.amount ? (
        <p
          className="flex flex-wrap items-center justify-end gap-1.5"
          data-testid={`update-delta-${asset.id}`}
        >
          <ComparisonDelta
            delta={onDate.amount - previous.amount}
            currency={onDate.currency}
          />
          <span className="text-xs text-muted-foreground">
            {t.update.deltaVsDate(formatCalendarDate(previous.date, locale))}
          </span>
        </p>
      ) : null}
    </li>
  )
}
