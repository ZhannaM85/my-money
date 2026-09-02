import type { ReactNode } from 'react'

export const CHART_ZOOM_PILL_CLASS =
  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium'

export function ChartRangeToolbar({
  rangeLabel,
  children,
}: {
  rangeLabel: string
  children: ReactNode
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2"
      data-testid="chart-range-toolbar"
    >
      <span className="min-w-0 text-sm text-muted-foreground">{rangeLabel}</span>
      <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}
