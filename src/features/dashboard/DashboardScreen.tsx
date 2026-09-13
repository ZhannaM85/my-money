import { Link } from 'react-router-dom'
import { ChartRangeControls } from '@/features/charts'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { NetWorthChart } from './NetWorthChart'
import { DashboardAsOfBar } from './DashboardAsOfBar'
import { DashboardHeadline } from './DashboardHeadline'
import { DashboardPeriodChange } from './DashboardPeriodChange'
import { DashboardPositions } from './DashboardPositions'
import { UpdateRates } from '@/features/net-worth'
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
                <UpdateRates
                  fxLoading={d.fxLoading}
                  ratesStatus={d.ratesStatus}
                  lastFetchedAt={d.lastFetchedAt}
                  onUpdateRates={d.refreshRates}
                />
              </div>
            )}
            {!d.showNativeAll && (
              <ChartRangeControls
                range={d.chartRange}
                earliest={d.earliest}
                latest={d.today}
                showPan
                showToolbar={d.asOfHasData}
              >
                {d.asOfHasData ? (
                  <NetWorthChart
                    points={d.series}
                    currency={
                      d.isOriginal ? d.activeCurrencyFilter : d.baseCurrency
                    }
                    onZoomIn={d.chartRange.zoomIn}
                    onZoomOut={d.chartRange.zoomOut}
                    onPanEarlier={d.chartRange.panEarlier}
                    onPanLater={d.chartRange.panLater}
                    onSelectDate={d.onSelectChartDate}
                  />
                ) : (
                  <EmptyState
                    title={t.dashboard.noHoldingsOnDateTitle}
                    description={t.dashboard.noHoldingsOnDateDescription}
                  />
                )}
              </ChartRangeControls>
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
            <Button asChild variant="outline" className="w-full">
              <Link to="/allocation">{t.dashboard.allocation}</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
