import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import { controlUnitPadClass } from '@/shared/ui/control'
import { InfoHint } from '@/shared/ui/info-hint'
import { Input } from '@/shared/ui/input'

export interface NumberInputProps extends Omit<
  React.ComponentProps<'input'>,
  'type'
> {
  /** Visible field label. Omit when the caller supplies `aria-label` (#236). */
  label?: string
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
    const fieldLabel = label ? (
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
    ) : null

    return (
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        {fieldLabel && hint && aboutLabel ? (
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
            className={cn(unit && controlUnitPadClass, className)}
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
