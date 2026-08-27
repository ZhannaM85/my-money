import { HISTORY_RANGES, type HistoryRange } from '@/shared/lib/dates'
import { useTranslation } from '@/i18n'
import { cn } from '@/shared/lib/utils'
import { DateField } from '@/shared/ui/date-field'

/** Week / Month / Year / All / Custom chips + optional custom dates (#126). */
export function ChartRangePicker({
  range,
  onRangeChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  earliest,
  latest,
}: {
  range: HistoryRange
  onRangeChange: (range: HistoryRange) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
  earliest: string
  latest: string
}) {
  const t = useTranslation()
  const labels: Record<HistoryRange, string> = {
    '1W': t.history.rangeWeek,
    '1M': t.history.rangeMonth,
    '1Y': t.history.rangeYear,
    All: t.history.rangeAll,
    Custom: t.history.rangeCustom,
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        role="group"
        aria-label={t.dashboard.zoomRange}
      >
        {HISTORY_RANGES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onRangeChange(item)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium',
              range === item
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
            aria-pressed={range === item}
          >
            {labels[item]}
          </button>
        ))}
      </div>
      {range === 'Custom' ? (
        <div className="flex flex-wrap items-end gap-2">
          <DateField
            label={t.history.rangeFrom}
            value={customStart}
            min={earliest}
            max={customEnd < latest ? customEnd : latest}
            onChange={(event) => {
              const next = event.target.value
              if (!next) return
              onCustomStartChange(next)
            }}
          />
          <DateField
            label={t.history.rangeTo}
            value={customEnd}
            min={customStart > earliest ? customStart : earliest}
            max={latest}
            onChange={(event) => {
              const next = event.target.value
              if (!next) return
              onCustomEndChange(next)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
