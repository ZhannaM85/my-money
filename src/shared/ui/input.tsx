import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import {
  controlFieldChromeClass,
  controlHeightClass,
  controlHeightCompactClass,
} from '@/shared/ui/control'

export interface InputProps extends React.ComponentProps<'input'> {
  /** Compact height for dense tables; default matches `--control-height`. */
  density?: 'default' | 'compact'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, density = 'default', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          controlFieldChromeClass,
          density === 'compact'
            ? controlHeightCompactClass
            : controlHeightClass,
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
