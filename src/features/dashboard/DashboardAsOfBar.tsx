import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'

export function DashboardAsOfBar({
  selectedChartDate,
  today,
  earliest,
  asOfError,
  comparisonDates,
  onDateChange,
  onJumpToToday,
  onAddToComparison,
}: {
  selectedChartDate: string | null
  today: string
  earliest: string
  asOfError?: string
  comparisonDates: readonly string[]
  onDateChange: (next: string) => void
  onJumpToToday: () => void
  onAddToComparison: () => void
}) {
  const t = useTranslation()
  const asOfValue = selectedChartDate ?? today
  const alreadyAdded = comparisonDates.includes(asOfValue)

  return (
    <div
      data-testid="dashboard-as-of-bar"
      className="sticky top-0 z-30 isolate -mx-4 flex w-[calc(100%+2rem)] min-w-0 shrink-0 flex-col gap-2 bg-background px-4 pt-1 pb-2"
    >
      <div className="flex min-w-0 flex-nowrap items-end gap-1.5">
        <DateField
          label={t.dashboard.asOfDate}
          value={asOfValue}
          min={earliest}
          max={today}
          onChange={(event) => {
            onDateChange(event.target.value)
          }}
          error={asOfError}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-xl"
          className="mb-0 shrink-0"
          aria-label={t.dashboard.addToComparison}
          disabled={alreadyAdded}
          onClick={onAddToComparison}
        >
          <Plus className="size-5" aria-hidden />
        </Button>
        {selectedChartDate !== null && selectedChartDate < today ? (
          <Button
            type="button"
            variant="outline"
            className="mb-0 shrink-0 px-1.5"
            onClick={onJumpToToday}
          >
            {t.dashboard.jumpToToday}
          </Button>
        ) : null}
      </div>
      {alreadyAdded ? (
        <p
          role="status"
          data-testid="comparison-already-added"
          className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground"
        >
          {t.dashboard.comparisonDayAlreadyAdded}
        </p>
      ) : null}
      {comparisonDates.length >= 2 ? (
        <Link
          to="/compare"
          className="flex items-center justify-center rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground"
        >
          {t.dashboard.navigateToComparison}
        </Link>
      ) : null}
    </div>
  )
}
