import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { InfoHint } from '@/shared/ui/info-hint'
import { Input } from '@/shared/ui/input'

export interface NumberInputProps extends Omit<
  React.ComponentProps<'input'>,
  'type'
> {
  label: string
  unit?: string
  error?: string
  hint?: string
  aboutLabel?: string
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, unit, error, hint, aboutLabel, id, className, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const errorId = error ? `${inputId}-error` : undefined
    const fieldLabel = (
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
    )

    return (
      <div className="flex flex-col gap-1.5">
        {hint && aboutLabel ? (
          <InfoHint hint={hint} label={aboutLabel}>
            {fieldLabel}
          </InfoHint>
        ) : (
          fieldLabel
        )}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn('h-12', unit && 'pr-10', className)}
            {...props}
          />
          {unit && (
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground">
              {unit}
            </span>
          )}
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
NumberInput.displayName = 'NumberInput'
