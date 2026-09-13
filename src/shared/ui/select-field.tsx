import * as React from 'react'
import { InfoHint } from '@/shared/ui/info-hint'
import { Select } from '@/shared/ui/select'

export interface SelectFieldProps extends React.ComponentProps<'select'> {
  label: string
  error?: string
  hint?: string
  aboutLabel?: string
}

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(
  (
    { label, error, hint, aboutLabel, id, className, children, ...props },
    ref,
  ) => {
    const generatedId = React.useId()
    const selectId = id ?? generatedId
    const errorId = error ? `${selectId}-error` : undefined
    const fieldLabel = (
      <label htmlFor={selectId} className="text-sm font-medium">
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
        <Select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={className}
          {...props}
        >
          {children}
        </Select>
        {error && (
          <p id={errorId} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  },
)
SelectField.displayName = 'SelectField'
