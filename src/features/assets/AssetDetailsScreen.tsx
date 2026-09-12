import { Link } from 'react-router-dom'
import { formatLastUpdated, useLocale, useTranslation } from '@/i18n'
import {
  formatAmount,
  formatPercent,
  formatSignedAmount,
} from '@/shared/lib/money'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'
import { ChartRangeControls } from '@/features/charts'
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import { AssetDetailsAccordion } from './AssetDetailsAccordion'
import { AssetDetailsUpdateForm } from './AssetDetailsUpdateForm'
import { AssetSnapshotList } from './AssetSnapshotList'
import { useAssetDetailsScreen } from './useAssetDetailsScreen'

export function AssetDetailsScreen() {
  const t = useTranslation()
  const locale = useLocale()
  const d = useAssetDetailsScreen()

  if (!d.loaded) {
    return <p className="text-sm text-muted-foreground">{t.common.loading}</p>
  }
  if (!d.asset) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title={t.asset.notFound} />
        <Button asChild variant="outline">
          <Link to="/assets">{t.asset.backToAssets}</Link>
        </Button>
      </div>
    )
  }

  const asset = d.asset

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
        <Chip
          pressed={d.mode === 'native'}
          onClick={() => void d.setMode('native')}
        >
          {t.asset.native}
        </Chip>
        <Chip
          pressed={d.mode === 'base'}
          onClick={() => void d.setMode('base')}
        >
          {d.baseCurrency}
        </Chip>
      </div>
      <StatCard
        label={
          d.mode === 'native' ? t.asset.currentValue : t.asset.inBaseCurrency
        }
        value={
          d.snapshot
            ? formatAmount(
                d.mode === 'native'
                  ? d.snapshot.amount
                  : (d.convertedAmount ?? d.snapshot.amount),
                d.displayCurrency ?? asset.currency,
                locale,
              )
            : '—'
        }
        description={
          d.snapshot
            ? `${formatLastUpdated(d.snapshot.date, d.today, t)}${
                d.snapshot.note ? ` · ${d.snapshot.note}` : ''
              }${d.hasPartialShare ? ` · ${t.asset.yourShare(d.shareLabel)}` : ''}`
            : t.asset.noSnapshotsYet
        }
      />
      {d.change && (
        <p className="text-sm text-muted-foreground">
          {t.asset.sinceFirst}{' '}
          {formatSignedAmount(
            d.change.absolute,
            d.displayCurrency ?? asset.currency,
            locale,
          )}
          {d.change.percent !== null
            ? ` (${formatPercent(d.change.percent, locale)})`
            : ''}
        </p>
      )}
      {d.mode === 'base' && d.convertedAmount === undefined && d.snapshot && (
        <p className="text-sm text-muted-foreground">
          {t.asset.noRateOnDate(d.snapshot.currency, d.snapshot.date)}
        </p>
      )}
      <AssetDetailsUpdateForm
        assetId={asset.id}
        currency={asset.currency}
        snapshotAmount={d.snapshot?.amount}
        snapshotCurrency={d.snapshot?.currency}
        snapshots={d.snapshots}
        today={d.today}
        onSave={d.saveUpdate}
      />
      <AssetDetailsAccordion
        asset={asset}
        shareLabel={d.shareLabel}
        onSave={d.saveDetails}
        onSetTracking={async (status) => {
          await d.setTrackingStatus(asset.id, status)
          if (status === 'archived') d.navigate('/assets')
        }}
        onDelete={async () => {
          if (!window.confirm(t.asset.deleteConfirm)) return
          await d.deleteAsset(asset.id)
          d.navigate('/assets')
        }}
      />
      <ChartRangeControls
        range={d.chartRange}
        earliest={d.earliest}
        latest={d.today}
        showPan
      >
        <NetWorthChart
          points={d.points}
          currency={d.displayCurrency ?? asset.currency}
          seriesName={asset.name}
          onZoomIn={d.chartRange.zoomIn}
          onZoomOut={d.chartRange.zoomOut}
          onPanEarlier={d.chartRange.panEarlier}
          onPanLater={d.chartRange.panLater}
        />
      </ChartRangeControls>
      <AssetSnapshotList
        history={d.history}
        snapshots={d.snapshots}
        assetId={asset.id}
        mode={d.mode}
        quotes={d.quotes}
        baseCurrency={d.baseCurrency}
        today={d.today}
        onSave={d.updateSnapshot}
        onDelete={d.deleteSnapshot}
      />
    </div>
  )
}
