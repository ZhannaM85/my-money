import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import {
  isSuggestedUpdate,
} from '@/domain/asset'
import { latestSnapshot, snapshotOnDate } from '@/domain/snapshot'
import { formatLastUpdated, useLocale, useTranslation } from '@/i18n'
import { isIsoDateOnOrBefore } from '@/shared/lib/dates'
import {
  formatAmount,
  formatEditableAmount,
  parseAmount,
  reformatAmountInput,
  todayIsoDate,
} from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { cn } from '@/shared/lib/utils'

export function UpdateFinancesScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()
  const load = useAssetStore((state) => state.load)
  const saveSnapshots = useAssetStore((state) => state.saveSnapshots)
  const updateSnapshot = useAssetStore((state) => state.updateSnapshot)
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [unchanged, setUnchanged] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)
  const today = todayIsoDate()
  const [asOf, setAsOf] = useState(today)
  const [asOfError, setAsOfError] = useState<string | undefined>()

  useEffect(() => {
    void load()
  }, [load])

  const rows = useMemo(() => {
    const tracked = assets.filter(
      (asset) => asset.trackingStatus === 'included',
    )
    return tracked
      .map((asset) => {
        const latest = latestSnapshot(snapshots, asset.id)
        const onDate = snapshotOnDate(snapshots, asset.id, asOf)
        return {
          asset,
          latest,
          onDate,
          suggested: isSuggestedUpdate(
            asset.updateFrequency,
            latest?.date,
            today,
          ),
        }
      })
      .sort((a, b) => Number(b.suggested) - Number(a.suggested))
  }, [assets, asOf, snapshots, today])

  function markUnchanged(assetId: string, previous?: number, currency?: string) {
    setUnchanged((current) => ({ ...current, [assetId]: true }))
    if (previous !== undefined) {
      setDrafts((current) => ({
        ...current,
        [assetId]: formatEditableAmount(previous, locale, currency),
      }))
    }
  }

  function startEdit(
    assetId: string,
    amount: number,
    currency: string,
  ) {
    setEditing((current) => ({ ...current, [assetId]: true }))
    setDrafts((current) => ({
      ...current,
      [assetId]: formatEditableAmount(amount, locale, currency),
    }))
  }

  async function handleSave() {
    if (!isIsoDateOnOrBefore(asOf, today)) {
      setAsOfError(t.asset.snapshotDateInvalid)
      return
    }
    const toWrite: {
      assetId: string
      date: string
      amount: number
      currency: string
    }[] = []
    const toUpdate: {
      id: string
      assetId: string
      date: string
      amount: number
      currency: string
      createdAt: string
      note?: string
    }[] = []
    for (const { asset, latest, onDate } of rows) {
      const raw = drafts[asset.id]?.trim() ?? ''
      if (onDate && !editing[asset.id]) continue
      if (raw !== '') {
        const amount = parseAmount(raw)
        if (amount === undefined) {
          setError(t.update.enterNumberFor(asset.name))
          return
        }
        if (onDate) {
          toUpdate.push({
            ...onDate,
            amount,
            date: asOf,
            currency: asset.currency,
          })
        } else {
          toWrite.push({
            assetId: asset.id,
            date: asOf,
            amount,
            currency: asset.currency,
          })
        }
        continue
      }
      if (!onDate && unchanged[asset.id] && latest) {
        toWrite.push({
          assetId: asset.id,
          date: asOf,
          amount: latest.amount,
          currency: latest.currency,
        })
      }
    }
    if (toWrite.length === 0 && toUpdate.length === 0) {
      setError(t.update.needOneRow)
      return
    }
    setError(undefined)
    setSaving(true)
    try {
      if (toWrite.length > 0) await saveSnapshots(toWrite)
      for (const snapshot of toUpdate) {
        await updateSnapshot(snapshot)
      }
      navigate('/', { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t.update.title}
        description={t.update.description}
        action={
          <DateField
            label={t.asset.snapshotDate}
            value={asOf}
            max={today}
            onChange={(event) => {
              const next = event.target.value
              setAsOf(next)
              setDrafts({})
              setUnchanged({})
              setEditing({})
              setError(undefined)
              if (!next || !isIsoDateOnOrBefore(next, today)) {
                setAsOfError(t.asset.snapshotDateInvalid)
                return
              }
              setAsOfError(undefined)
            }}
            error={asOfError}
          />
        }
      />
      {!loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title={t.update.emptyTitle}
          description={t.update.emptyDescription}
          action={
            <Button asChild>
              <Link to="/assets/new">{t.common.addAsset}</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {rows.map(({ asset, latest, onDate, suggested }) => {
              const locked = Boolean(onDate) && !editing[asset.id]
              return (
              <li
                key={asset.id}
                className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {latest
                      ? formatAmount(latest.amount, latest.currency, locale)
                      : t.asset.noValueYet}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatLastUpdated(latest?.date, today, t)}
                  {' · '}
                  {suggested
                    ? t.asset.suggestedNow
                    : t.asset.frequency[asset.updateFrequency]}
                </p>
                <div className="flex gap-2">
                  {locked && onDate ? (
                    <>
                      <span className="flex h-12 min-w-0 flex-1 items-center justify-end tabular-nums font-medium">
                        {formatAmount(
                          onDate.amount,
                          onDate.currency,
                          locale,
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-xl"
                        aria-label={t.update.editAmountAria(asset.name)}
                        onClick={() =>
                          startEdit(
                            asset.id,
                            onDate.amount,
                            onDate.currency,
                          )
                        }
                      >
                        <Pencil className="size-5" aria-hidden />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="relative min-w-0 flex-1">
                        <Input
                          aria-label={t.update.newAmountAria(asset.name)}
                          inputMode="decimal"
                          value={drafts[asset.id] ?? ''}
                          placeholder={
                            onDate
                              ? formatEditableAmount(
                                  onDate.amount,
                                  locale,
                                  onDate.currency,
                                )
                              : latest
                                ? formatEditableAmount(
                                    latest.amount,
                                    locale,
                                    latest.currency,
                                  )
                                : t.asset.amountPlaceholder
                          }
                          className="h-12 pr-12"
                          onChange={(event) => {
                            const value = event.target.value
                            setDrafts((current) => ({
                              ...current,
                              [asset.id]: value,
                            }))
                            if (unchanged[asset.id]) {
                              setUnchanged((current) => ({
                                ...current,
                                [asset.id]: false,
                              }))
                            }
                          }}
                          onBlur={() => {
                            setDrafts((current) => {
                              const raw = current[asset.id]
                              if (raw === undefined) return current
                              return {
                                ...current,
                                [asset.id]: reformatAmountInput(
                                  raw,
                                  locale,
                                  asset.currency,
                                ),
                              }
                            })
                          }}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground">
                          {asset.currency}
                        </span>
                      </div>
                      {!onDate ? (
                        <Button
                          type="button"
                          variant={unchanged[asset.id] ? 'default' : 'outline'}
                          className={cn('h-12 shrink-0')}
                          disabled={!latest}
                          onClick={() =>
                            markUnchanged(
                              asset.id,
                              latest?.amount,
                              latest?.currency ?? asset.currency,
                            )
                          }
                        >
                          {t.update.noChange}
                        </Button>
                      ) : null}
                    </>
                  )}
                </div>
              </li>
              )
            })}
          </ul>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            size="xl"
            className="w-full"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {t.update.saveUpdates}
          </Button>
        </>
      )}
    </div>
  )
}
