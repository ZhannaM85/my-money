import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { controlFieldClass } from '@/shared/ui/control'

const Select = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<'select'>
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      data-slot="select"
      className={cn(controlFieldClass, className)}
      {...props}
    />
  )
})
Select.displayName = 'Select'

export { Select }
