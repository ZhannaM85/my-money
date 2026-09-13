import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EllipsisVertical } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type OverflowMenuItem = {
  label: string
  ariaLabel?: string
  onSelect: () => void
  tone?: 'default' | 'destructive'
}

export function OverflowMenu({
  ariaLabel,
  items,
  className,
  children,
}: {
  ariaLabel: string
  items: OverflowMenuItem[]
  className?: string
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocumentPointerDown(event: PointerEvent) {
      const root = rootRef.current
      if (root && event.target instanceof Node && root.contains(event.target)) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDocumentPointerDown)
    return () =>
      document.removeEventListener('pointerdown', onDocumentPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        className="flex h-full min-h-11 min-w-11 items-center justify-center px-2 text-muted-foreground"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {children ?? <EllipsisVertical className="size-5" />}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 min-w-36 rounded-lg bg-card py-1 shadow-md ring-1 ring-foreground/10"
        >
          {items.map((item) => (
            <button
              key={item.ariaLabel ?? item.label}
              type="button"
              role="menuitem"
              className={cn(
                'w-full px-3 py-3 text-left text-sm',
                item.tone === 'destructive' && 'text-destructive',
              )}
              aria-label={item.ariaLabel}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
