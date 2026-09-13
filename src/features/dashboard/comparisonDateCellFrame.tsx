import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/** Same trailing slot as the holding pencil so Итого lines up (#261). */
export function ComparisonDateCellFrame({
  children,
  end,
  align = 'start',
}: {
  children: ReactNode
  end?: ReactNode
  /** Totals use center so the amount sits on the same line as Итого (#263). */
  align?: 'start' | 'center'
}) {
  return (
    <span
      className={cn(
        'flex justify-end gap-1 whitespace-nowrap',
        align === 'center' ? 'items-center' : 'items-start',
      )}
    >
      <span className="flex flex-col items-end gap-0.5">{children}</span>
      {end ?? (
        <span
          data-testid="comparison-col-end-spacer"
          className="inline-flex size-11 shrink-0"
          aria-hidden
        />
      )}
    </span>
  )
}
