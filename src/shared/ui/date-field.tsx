import { Calendar } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'

export interface DateFieldProps extends Omit<
  React.ComponentProps<'input'>,
  'type'
> {
  label: string
  error?: string
}

function openDatePicker(input: HTMLInputElement) {
  try {
    input.showPicker?.()
  } catch {
    input.focus()
  }
}

export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
  ({ label, error, id, className, onClick, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type="date"
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              'relative h-12 cursor-pointer bg-background pr-12',
              className,
            )}
            onClick={(event) => {
              openDatePicker(event.currentTarget)
              onClick?.(event)
            }}
            {...props}
          />
          <Calendar
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted-foreground"
          />
        </div>
        {error && (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  },
)
DateField.displayName = 'DateField'
