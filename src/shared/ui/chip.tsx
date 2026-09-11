import type * as React from 'react'
import { Button } from '@/shared/ui/button'

export type ChipProps = React.ComponentProps<typeof Button> & {
  pressed?: boolean
}

/** Compact toggle / filter / range chip. Height is `--control-height-compact`. */
export function Chip({ pressed, variant, size = 'chip', ...props }: ChipProps) {
  return (
    <Button
      type="button"
      size={size}
      variant={variant ?? (pressed ? 'default' : 'muted')}
      aria-pressed={pressed}
      {...props}
    />
  )
}
