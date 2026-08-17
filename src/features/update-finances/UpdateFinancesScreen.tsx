import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FREQUENCY_LABELS,
  isSuggestedUpdate,
  lastUpdatedCopy,
} from '@/domain/asset'
import { latestSnapshot } from '@/domain/snapshot'
import { formatAmount, todayIsoDate } from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'
import { useAssetStore } from '@/stores/assetStore'
import { cn } from '@/shared/lib/utils'

export function UpdateFinancesScreen() {
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

  function markUnchanged(assetId: string, previous?: number) {
    setUnchanged((current) => ({ ...current, [assetId]: true }))
    if (previous !== undefined) {
      setDrafts((current) => ({ ...current, [assetId]: String(previous) }))
    }
  }

  async function handleSave() {
    const toWrite: {
      assetId: string
      date: string
      amount: number
      currency: string
    }[] = []
    for (const { asset, snapshot } of rows) {
      const raw = drafts[asset.id]?.trim() ?? ''
      if (raw !== '') {
        const amount = Number(raw)
        if (Number.isNaN(amount)) {
          setError(`Enter a number for ${asset.name}`)
          return
        }
        toWrite.push({
          assetId: asset.id,
          date: today,
          amount,
          currency: asset.currency,
        })
        continue
      }
      if (unchanged[asset.id] && snapshot) {
        toWrite.push({
          assetId: asset.id,
          date: today,
          amount: snapshot.amount,
          currency: snapshot.currency,
        })
      }
    }
    if (toWrite.length === 0) {
      setError('Mark no change or enter an amount for at least one asset.')
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
        title="Update"
        description="Previous amounts, then a new number or No change. Yearly and manual assets stay optional."
      />
      {!loaded ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nothing to update"
          description="Add an included asset first."
          action={
            <Button asChild>
              <Link to="/assets/new">Add asset</Link>
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
                      ? formatAmount(snapshot.amount, snapshot.currency)
                      : 'No value yet'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {lastUpdatedCopy(snapshot?.date, today)}
                  {' · '}
                  {suggested
                    ? 'Suggested now'
                    : FREQUENCY_LABELS[asset.updateFrequency]}
                </p>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <Input
                      aria-label={`${asset.name} new amount`}
                      inputMode="decimal"
                      value={drafts[asset.id] ?? ''}
                      placeholder={
                        snapshot ? String(snapshot.amount) : 'Amount'
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
                    onClick={() => markUnchanged(asset.id, snapshot?.amount)}
                  >
                    No change
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
            Save updates
          </Button>
        </>
      )}
    </div>
  )
}
