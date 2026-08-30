import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

const THRESHOLD_PX = 48
const ACTION_WIDTH_CLASS = 'w-24'

export function SwipeRevealRow({
  actionLabel,
  actionAria,
  onAction,
  children,
}: {
  actionLabel: string
  actionAria: string
  onAction: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX
    startY.current = event.clientY
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current === null || startY.current === null) return
    const dx = event.clientX - startX.current
    const dy = event.clientY - startY.current
    startX.current = null
    startY.current = null
    if (Math.abs(dx) < Math.abs(dy)) return
    if (dx < -THRESHOLD_PX) setOpen(true)
    else if (dx > THRESHOLD_PX) setOpen(false)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <button
        type="button"
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-center bg-destructive text-sm font-medium text-white',
          ACTION_WIDTH_CLASS,
        )}
        aria-label={actionAria}
        onClick={() => {
          onAction()
          setOpen(false)
        }}
      >
        {actionLabel}
      </button>
      <div
        className="relative bg-card transition-transform duration-200 ease-out"
        style={{ transform: open ? 'translateX(-6rem)' : 'translateX(0)' }}
        data-swipe-open={open ? 'true' : 'false'}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {children}
      </div>
    </div>
  )
}
