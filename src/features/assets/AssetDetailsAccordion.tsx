import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Asset, TrackingStatus } from '@/domain/asset'
import { useTranslation } from '@/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { AssetDetailsTrackingActions } from './AssetDetailsTrackingActions'
import { AssetForm, type AssetFormValues } from './AssetForm'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  )
}

export function AssetDetailsAccordion({
  asset,
  shareLabel,
  onSave,
  onSetTracking,
  onDelete,
}: {
  asset: Asset
  shareLabel: string
  onSave: (values: AssetFormValues) => Promise<void>
  onSetTracking: (status: TrackingStatus) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const t = useTranslation()
  const [editingDetails, setEditingDetails] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-1">
        <h2 className="min-w-0 flex-1 text-lg font-semibold">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left"
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
          >
            {t.asset.details}
            <ChevronDown
              className={cn(
                'size-5 shrink-0 text-muted-foreground transition-transform',
                detailsOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </button>
        </h2>
        <AssetDetailsTrackingActions
          name={asset.name}
          trackingStatus={asset.trackingStatus}
          onSetTracking={onSetTracking}
          onDelete={onDelete}
        />
      </div>
      {detailsOpen ? (
        editingDetails ? (
          <>
            <AssetForm
              initial={asset}
              requireAmount={false}
              submitLabel={t.asset.saveDetails}
              onSubmit={async (values) => {
                await onSave(values)
                setEditingDetails(false)
              }}
            />
            <Button
              type="button"
              variant="outline"
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
              className="w-full"
              onClick={() => setEditingDetails(true)}
            >
              {t.asset.editDetails}
            </Button>
          </>
        )
      ) : null}
    </section>
  )
}
