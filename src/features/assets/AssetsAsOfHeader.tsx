import { Link } from 'react-router-dom'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { DateField } from '@/shared/ui/date-field'

export function AssetsAsOfHeader({
  total,
  asOf,
  today,
  asOfError,
  onAsOfDateChange,
  onJumpToToday,
}: {
  total?: string
  asOf: string
  today: string
  asOfError?: string
  onAsOfDateChange: (next: string) => void
  onJumpToToday: () => void
}) {
  const t = useTranslation()

  return (
    // DateField is a fixed 13.5rem. On a phone it wraps under the title
    // so Add stays in the corner; from sm it sits in the gap before Add.
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 sm:grid-cols-[minmax(0,auto)_minmax(13.5rem,1fr)_auto] sm:items-end">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-heading">
          {t.assets.title}
        </h1>
        {total ? (
          <p className="text-sm break-words text-muted-foreground">
            {t.dashboard.positionsTotal}: {total}
          </p>
        ) : null}
      </div>
      <Button
        asChild
        className="col-start-2 row-start-1 shrink-0 sm:col-start-3"
      >
        <Link to="/assets/new">{t.common.add}</Link>
      </Button>
      <div
        data-testid="assets-as-of-bar"
        className="col-span-2 flex max-w-full min-w-0 flex-wrap items-end gap-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:justify-self-end"
      >
        <DateField
          label={t.dashboard.asOfDate}
          value={asOf}
          max={today}
          onChange={(event) => onAsOfDateChange(event.target.value)}
          error={asOfError}
        />
        {asOf < today ? (
          <Button
            type="button"
            variant="outline"
            className="shrink-0 px-1.5"
            onClick={onJumpToToday}
          >
            {t.dashboard.jumpToToday}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
