import { CircleHelp } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

export function InfoHint({
  hint,
  label,
  children,
}: {
  hint: string
  label: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const hintId = useId()

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-0.5">
        <div className="min-w-0 flex-1">{children}</div>
        <button
          type="button"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={label}
          aria-expanded={open}
          aria-controls={hintId}
          onClick={() => setOpen((value) => !value)}
        >
          <CircleHelp className="size-4" />
        </button>
      </div>
      {open ? (
        <p id={hintId} role="note" className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
