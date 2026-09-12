import type { Dictionary } from '@/i18n/Dictionary'
import type { HistoryRange } from '@/shared/lib/dates'

export function chartRangeDisplayName(
  range: HistoryRange,
  t: Dictionary,
): string {
  switch (range) {
    case '1W':
      return t.history.rangeWeek
    case '1M':
      return t.history.rangeMonth
    case '1Y':
      return t.history.rangeYear
    case 'All':
      return t.history.rangeAll
    case 'Custom':
      return t.history.rangeCustom
  }
}

export function chartRangeToolbarLabel(
  range: HistoryRange,
  t: Dictionary,
): string {
  return `${t.dashboard.zoomRange}: ${chartRangeDisplayName(range, t)}`
}
