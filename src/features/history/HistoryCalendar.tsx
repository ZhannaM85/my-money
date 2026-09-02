import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslation } from '@/i18n'
import {
  addMonthsIso,
  monthGridCells,
  monthStartIso,
} from '@/shared/lib/dates'
import { formatMonthYear, todayIsoDate } from '@/shared/lib/money'
import { cn } from '@/shared/lib/utils'

export function HistoryCalendar({
  snapshotDates,
}: {
  snapshotDates: readonly string[]
}) {
  const t = useTranslation()
  const locale = useLocale()
  const today = todayIsoDate()
  const marked = useMemo(() => new Set(snapshotDates), [snapshotDates])
  const latestMarked = useMemo(() => {
    if (snapshotDates.length === 0) return today
    return snapshotDates.reduce((max, date) => (date > max ? date : max))
  }, [snapshotDates, today])
  const [monthStart, setMonthStart] = useState(() =>
    monthStartIso(latestMarked),
  )
  const cells = useMemo(() => monthGridCells(monthStart), [monthStart])
  const weekdays = useMemo(() => {
    const tag = locale === 'ru' ? 'ru-RU' : 'en-GB'
    return cells.slice(0, 7).map((cell) =>
      new Intl.DateTimeFormat(tag, {
        weekday: 'short',
        timeZone: 'UTC',
      }).format(new Date(`${cell.date}T00:00:00.000Z`)),
    )
  }, [cells, locale])

  return (
    <div className="flex flex-col gap-3" data-testid="history-calendar">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full bg-muted text-foreground"
          aria-label={t.history.calendarPrevMonth}
          onClick={() => setMonthStart((current) => addMonthsIso(current, -1))}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <p className="text-sm font-medium">
          {formatMonthYear(monthStart, locale)}
        </p>
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full bg-muted text-foreground"
          aria-label={t.history.calendarNextMonth}
          onClick={() => setMonthStart((current) => addMonthsIso(current, 1))}
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {weekdays.map((label, index) => (
          <span key={cells[index]?.date ?? label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const hasSnapshot = marked.has(cell.date)
          return (
            <div
              key={cell.date}
              data-testid={
                hasSnapshot ? `history-calendar-mark-${cell.date}` : undefined
              }
              aria-label={
                hasSnapshot
                  ? t.history.calendarDayWithSnapshot(cell.date)
                  : cell.date
              }
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-md py-1.5 text-sm',
                cell.inMonth ? 'text-foreground' : 'text-muted-foreground/40',
                cell.date === today && 'font-semibold text-primary',
              )}
            >
              {Number(cell.date.slice(8, 10))}
              <span
                aria-hidden
                className={cn(
                  'size-1 rounded-full',
                  hasSnapshot ? 'bg-primary' : 'bg-transparent',
                )}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
