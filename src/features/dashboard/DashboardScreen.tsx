import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { Chip } from '@/shared/ui/chip'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { NetWorthChart } from './NetWorthChart'
import { ChartRangePicker } from './ChartRangePicker'
import { ChartRangeToolbar } from './ChartRangeToolbar'
import { DashboardAsOfBar } from './DashboardAsOfBar'
import { DashboardHeadline } from './DashboardHeadline'
import { DashboardPeriodChange } from './DashboardPeriodChange'
import { DashboardPositions } from './DashboardPositions'
import { DashboardRates } from './DashboardRates'
import { useDashboardScreen } from './useDashboardScreen'

export function DashboardScreen() {
  const t = useTranslation()
  const d = useDashboardScreen()

  return (
    <div
      data-testid="dashboard-scroll"
      className="flex min-w-0 w-full flex-col gap-4"
    >
      <PageHeader title={t.dashboard.title} />
      {!d.loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : d.assets.length === 0 ? (
        <EmptyState
          title={t.dashboard.emptyTitle}
          description={t.dashboard.emptyDescription}
          action={
            <Button asChild>
              <Link to="/assets/new">{t.common.addAsset}</Link>
            </Button>
          }
        />
      ) : (
        <>
          {d.showAsOfBar ? (
            <DashboardAsOfBar
              selectedChartDate={d.selectedChartDate}
              today={d.today}
              earliest={d.earliest}
              asOfError={d.asOfError}
              comparisonDates={d.comparisonDates}
              onDateChange={d.onAsOfDateChange}
              onJumpToToday={d.onJumpToToday}
              onAddToComparison={d.onAddToComparison}
            />
          ) : null}
          <div
            data-testid="dashboard-scroll-body"
            className="relative z-0 flex min-w-0 w-full flex-col gap-6"
          >
            <DashboardHeadline
              isOriginal={d.isOriginal}
              activeCurrencyFilter={d.activeCurrencyFilter}
              baseCurrency={d.baseCurrency}
              availableCurrencies={d.availableCurrencies}
              nativeTotals={d.nativeTotals}
              convertedHoldings={d.convertedHoldings}
              openNativeCurrency={d.openNativeCurrency}
              displayHeadlineTotal={d.displayHeadlineTotal}
              selectedChartPoint={d.selectedChartPoint}
              changeLabel={d.changeLabel}
              fxNote={d.fxNote}
              onCurrencyFilterChange={d.onCurrencyFilterChange}
              onToggleNativeCurrency={d.toggleNativeCurrency}
            />
            {d.convertedBreakdown && (
              <div className="flex flex-col gap-2">
                <DashboardPeriodChange
                  breakdown={d.convertedBreakdown}
                  baseCurrency={d.baseCurrency}
                  periodOpen={d.periodOpen}
                  onTogglePeriod={d.togglePeriod}
                />
                <DashboardRates
                  fxLoading={d.fxLoading}
                  ratesStatus={d.ratesStatus}
                  lastFetchedAt={d.lastFetchedAt}
                  onUpdateRates={d.refreshRates}
                />
              </div>
            )}
            {!d.showNativeAll && (
              <>
                <ChartRangePicker
                  range={d.range}
                  onRangeChange={d.selectRange}
                  customStart={d.customStart}
                  customEnd={d.customEnd}
                  onCustomStartChange={d.onCustomStartChange}
                  onCustomEndChange={d.onCustomEndChange}
                  earliest={d.earliest}
                  latest={d.today}
                />
                {d.asOfHasData ? (
                  <>
                    <NetWorthChart
                      points={d.series}
                      currency={
                        d.isOriginal ? d.activeCurrencyFilter : d.baseCurrency
                      }
                      onZoomIn={() => d.applyZoom('in')}
                      onZoomOut={() => d.applyZoom('out')}
                      onPanEarlier={d.panEarlier}
                      onPanLater={d.panLater}
                      onSelectDate={d.onSelectChartDate}
                    />
                    <ChartRangeToolbar rangeLabel={d.rangeLabel}>
                      <Button
                        type="button"
                        variant="muted"
                        size="icon-compact"
                        disabled={!d.canPanEarlier}
                        aria-label={t.dashboard.panEarlier}
                        onClick={d.panEarlier}
                      >
                        <ChevronLeft className="size-5" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="muted"
                        size="icon-compact"
                        disabled={!d.canPanLater}
                        aria-label={t.dashboard.panLater}
                        onClick={d.panLater}
                      >
                        <ChevronRight className="size-5" aria-hidden />
                      </Button>
                      <Chip
                        disabled={!d.canZoomIn}
                        onClick={() => {
                          if (!d.canZoomIn) return
                          d.applyZoom('in')
                        }}
                      >
                        {t.dashboard.zoomIn}
                      </Chip>
                      <Chip
                        disabled={!d.canZoomOut}
                        onClick={() => {
                          if (!d.canZoomOut) return
                          d.applyZoom('out')
                        }}
                      >
                        {t.dashboard.zoomOut}
                      </Chip>
                    </ChartRangeToolbar>
                  </>
                ) : (
                  <EmptyState
                    title={t.dashboard.noHoldingsOnDateTitle}
                    description={t.dashboard.noHoldingsOnDateDescription}
                  />
                )}
              </>
            )}
            {d.convertedHoldingsToday.length > 0 && !d.showNativeAll && (
              <DashboardPositions
                holdings={d.convertedHoldingsToday}
                holdingsOpen={d.holdingsOpen}
                selectedChartPoint={d.selectedChartPoint}
                displayHeadlineTotal={d.displayHeadlineTotal}
                isOriginal={d.isOriginal}
                activeCurrencyFilter={d.activeCurrencyFilter}
                baseCurrency={d.baseCurrency}
                asOfDate={d.selectedChartDate ?? d.today}
                onToggle={d.toggleHoldings}
              />
            )}
            <Button asChild variant="outline" size="xl" className="w-full">
              <Link to="/allocation">{t.dashboard.allocation}</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
