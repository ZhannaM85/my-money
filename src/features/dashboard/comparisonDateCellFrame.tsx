import type { ReactNode } from 'react'

/** Same trailing slot as the holding pencil so Итого lines up (#261). */
export function ComparisonDateCellFrame({
  children,
  end,
}: {
  children: ReactNode
  end?: ReactNode
}) {
  return (
    <span className="flex items-start justify-end gap-1 whitespace-nowrap">
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
