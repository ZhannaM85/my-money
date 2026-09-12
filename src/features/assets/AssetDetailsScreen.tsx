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
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import { ChartRangePicker } from '@/features/dashboard/ChartRangePicker'
import { ChartRangeToolbar } from '@/features/dashboard/ChartRangeToolbar'
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
        <Chip pressed={d.mode === 'native'} onClick={() => d.setMode('native')}>
          {t.asset.native}
        </Chip>
        <Chip pressed={d.mode === 'base'} onClick={() => d.setMode('base')}>
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
      />
      <ChartRangePicker
        range={d.range}
        onRangeChange={d.selectRange}
        customStart={d.customStart}
        customEnd={d.customEnd}
        onCustomStartChange={(value) =>
          d.setCustomStart(value > d.customEnd ? d.customEnd : value)
        }
        onCustomEndChange={(value) =>
          d.setCustomEnd(value < d.customStart ? d.customStart : value)
        }
        earliest={d.earliest}
        latest={d.today}
      />
      <NetWorthChart
        points={d.points}
        currency={d.displayCurrency ?? asset.currency}
        seriesName={asset.name}
        onZoomIn={d.zoomIn}
        onZoomOut={d.zoomOut}
      />
      <ChartRangeToolbar rangeLabel={d.rangeLabel}>
        <Chip
          disabled={!d.canZoomIn}
          onClick={() => {
            if (d.canZoomIn) d.zoomIn()
          }}
        >
          {t.dashboard.zoomIn}
        </Chip>
        <Chip
          disabled={!d.canZoomOut}
          onClick={() => {
            if (d.canZoomOut) d.zoomOut()
          }}
        >
          {t.dashboard.zoomOut}
        </Chip>
      </ChartRangeToolbar>
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
      {asset.trackingStatus === 'included' && (
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => void d.setTrackingStatus(asset.id, 'excluded')}
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
          onClick={() => void d.setTrackingStatus(asset.id, 'included')}
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
            void d
              .setTrackingStatus(asset.id, 'archived')
              .then(() => d.navigate('/assets'))
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
          onClick={() => void d.setTrackingStatus(asset.id, 'included')}
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
          void d.deleteAsset(asset.id).then(() => d.navigate('/assets'))
        }}
      >
        {t.asset.deleteAsset}
      </Button>
    </div>
  )
}
