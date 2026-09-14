import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

export type SwitchProps = Omit<
  React.ComponentProps<'button'>,
  'children' | 'onClick' | 'role'
> & {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

/** Compact on/off control for settings rows (#271). */
export function Switch({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
        className,
      )}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
