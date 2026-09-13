import { ListOrdered, Save } from 'lucide-react'
import { Button } from './button'

/** Shared Order / reorder icon on Assets and Update (#267). */
export function ReorderIconButton({
  pressed = false,
  idleLabel,
  saveLabel,
  onClick,
}: {
  pressed?: boolean
  idleLabel: string
  saveLabel?: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant={pressed ? 'default' : 'outline'}
      size="icon-xl"
      aria-pressed={pressed}
      aria-label={pressed ? (saveLabel ?? idleLabel) : idleLabel}
      onClick={onClick}
    >
      {pressed ? (
        <Save className="size-5" aria-hidden />
      ) : (
        <ListOrdered className="size-5" aria-hidden />
      )}
    </Button>
  )
}
