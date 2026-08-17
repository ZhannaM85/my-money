import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'

export interface TextFieldProps extends React.ComponentProps<'input'> {
  label: string
  error?: string
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn('h-12', className)}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  },
)
TextField.displayName = 'TextField'
