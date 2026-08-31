import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  isSuggestedUpdate,
} from '@/domain/asset'
import { latestSnapshot } from '@/domain/snapshot'
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
  const assets = useAssetStore((state) => state.assets)
  const snapshots = useAssetStore((state) => state.snapshots)
  const loaded = useAssetStore((state) => state.loaded)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [unchanged, setUnchanged] = useState<Record<string, boolean>>({})
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
        const snapshot = latestSnapshot(snapshots, asset.id)
        return {
          asset,
          snapshot,
          suggested: isSuggestedUpdate(
            asset.updateFrequency,
            snapshot?.date,
            today,
          ),
        }
      })
      .sort((a, b) => Number(b.suggested) - Number(a.suggested))
  }, [assets, snapshots, today])

  function markUnchanged(assetId: string, previous?: number, currency?: string) {
    setUnchanged((current) => ({ ...current, [assetId]: true }))
    if (previous !== undefined) {
      setDrafts((current) => ({
        ...current,
        [assetId]: formatEditableAmount(previous, locale, currency),
      }))
    }
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
    for (const { asset, snapshot } of rows) {
      const raw = drafts[asset.id]?.trim() ?? ''
      if (raw !== '') {
        const amount = parseAmount(raw)
        if (amount === undefined) {
          setError(t.update.enterNumberFor(asset.name))
          return
        }
        toWrite.push({
          assetId: asset.id,
          date: asOf,
          amount,
          currency: asset.currency,
        })
        continue
      }
      if (unchanged[asset.id] && snapshot) {
        toWrite.push({
          assetId: asset.id,
          date: asOf,
          amount: snapshot.amount,
          currency: snapshot.currency,
        })
      }
    }
    if (toWrite.length === 0) {
      setError(t.update.needOneRow)
      return
    }
    setError(undefined)
    setSaving(true)
    try {
      await saveSnapshots(toWrite)
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
            {rows.map(({ asset, snapshot, suggested }) => (
              <li
                key={asset.id}
                className="flex flex-col gap-2 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {snapshot
                      ? formatAmount(snapshot.amount, snapshot.currency, locale)
                      : t.asset.noValueYet}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatLastUpdated(snapshot?.date, today, t)}
                  {' · '}
                  {suggested
                    ? t.asset.suggestedNow
                    : t.asset.frequency[asset.updateFrequency]}
                </p>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Input
                      aria-label={t.update.newAmountAria(asset.name)}
                      inputMode="decimal"
                      value={drafts[asset.id] ?? ''}
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
                  <Button
                    type="button"
                    variant={unchanged[asset.id] ? 'default' : 'outline'}
                    className={cn('h-12 shrink-0')}
                    disabled={!snapshot}
                    onClick={() =>
                      markUnchanged(
                        asset.id,
                        snapshot?.amount,
                        snapshot?.currency ?? asset.currency,
                      )
                    }
                  >
                    {t.update.noChange}
                  </Button>
                </div>
              </li>
            ))}
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
