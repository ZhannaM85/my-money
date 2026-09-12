import type { ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/** Shared drag row for Assets and Update reorder mode (#236). */
export function SortableRow({
  id,
  reorderLabel,
  children,
}: {
  id: string
  reorderLabel: string
  children: ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-stretch rounded-xl bg-card ring-1 ring-foreground/10',
        isDragging && 'z-10 opacity-80',
      )}
    >
      <button
        type="button"
        className="flex w-10 shrink-0 items-center justify-center text-muted-foreground"
        aria-label={reorderLabel}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      {children}
    </li>
  )
}
