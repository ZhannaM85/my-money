import { Save } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function FieldSaveButton({
  label,
  onClick,
  disabled,
  testId,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  testId?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-xl"
      aria-label={label}
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
    >
      <Save className="size-5" aria-hidden />
    </Button>
  )
}
