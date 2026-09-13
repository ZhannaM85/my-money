import { ChartRangeControls } from '@/features/charts'
import { NetWorthChart } from '@/features/dashboard/NetWorthChart'
import { HistoryCalendar } from './HistoryCalendar'
import { HistoryDayRow } from './HistoryDayRow'
import { useHistoryScreen } from './useHistoryScreen'
import { formatAmount, formatSignedAmount } from '@/shared/lib/money'
import { Chip } from '@/shared/ui/chip'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { StatCard } from '@/shared/ui/stat-card'

export function HistoryScreen() {
  const h = useHistoryScreen()
  const { t, locale } = h

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.history.title} />
      <ChartRangeControls
        range={h.chartRange}
        earliest={h.earliest}
        latest={h.today}
        showToolbar={false}
      />
      {!h.loaded ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : h.assets.length === 0 ? (
        <EmptyState
          title={t.history.emptyTitle}
          description={t.history.emptyDescription}
        />
      ) : (
        <>
          {h.isOriginal ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                {t.dashboard.nativeHoldings}
              </span>
              <ul className="flex flex-col gap-2">
                {h.nativeTotals.map((row) => (
                  <li
                    key={row.currency}
                    className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                  >
                    <span className="text-sm font-medium">{row.currency}</span>
                    <span className="tabular-nums text-base font-semibold">
                      {formatAmount(row.amount, row.currency, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <StatCard
              label={t.dashboard.netWorth}
              value={formatAmount(
                h.latestPoint?.total ?? 0,
                h.baseCurrency,
                locale,
              )}
              description={`${formatSignedAmount(h.change.absolute, h.baseCurrency, locale)} ${h.rangeLabel}`}
            />
          )}
          {h.breakdown && (
            <ul className="flex flex-col gap-1 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {t.dashboard.amountChange}
                </span>
                <span className="tabular-nums">
                  {formatSignedAmount(
                    h.breakdown.amountChange,
                    h.baseCurrency,
                    locale,
                  )}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {t.dashboard.rateChange}
                </span>
                <span className="tabular-nums">
                  {formatSignedAmount(
                    h.breakdown.rateChange,
                    h.baseCurrency,
                    locale,
                  )}
                </span>
              </li>
            </ul>
          )}
          {!h.isOriginal && (
            <ChartRangeControls
              range={h.chartRange}
              earliest={h.earliest}
              latest={h.today}
              showPicker={false}
              showPan
            >
              <NetWorthChart
                points={h.series}
                currency={h.baseCurrency}
                onZoomIn={h.chartRange.zoomIn}
                onZoomOut={h.chartRange.zoomOut}
                onPanEarlier={h.chartRange.panEarlier}
                onPanLater={h.chartRange.panLater}
              />
            </ChartRangeControls>
          )}
          <div
            className="flex gap-2"
            role="group"
            aria-label={t.history.viewModeLabel}
          >
            <Chip pressed={h.viewMode === 'list'} onClick={h.showList}>
              {t.history.listViewLabel}
            </Chip>
            <Chip pressed={h.viewMode === 'calendar'} onClick={h.showCalendar}>
              {t.history.calendarViewLabel}
            </Chip>
          </div>
          {h.viewMode === 'calendar' ? (
            <>
              <HistoryCalendar
                snapshotDates={h.allSnapshotDates}
                selectedDate={h.selectedCalendarDate}
                onSelectDate={h.selectCalendarDate}
              />
              {(() => {
                const day = h.selectedCalendarDay
                if (!day) return null
                return (
                  <ul
                    className="flex flex-col gap-2"
                    data-testid="history-calendar-day-detail"
                  >
                    <HistoryDayRow
                      row={day}
                      open={h.openDates.has(day.date)}
                      baseCurrency={h.baseCurrency}
                      nativeOnly={h.isOriginal}
                      label={t.history.holdingsOn(day.date)}
                      onToggle={() => h.toggleOpenDate(day.date)}
                    />
                  </ul>
                )
              })()}
            </>
          ) : (
            <ul className="flex flex-col gap-2">
              {(h.isOriginal ? h.originalList : h.convertedList).map((row) => {
                return (
                  <HistoryDayRow
                    key={row.date}
                    row={row}
                    open={h.openDates.has(row.date)}
                    baseCurrency={h.baseCurrency}
                    nativeOnly={h.isOriginal}
                    label={t.history.holdingsOn(row.date)}
                    onToggle={() => h.toggleOpenDate(row.date)}
                    testId={`history-day-row-${row.date}`}
                  />
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
