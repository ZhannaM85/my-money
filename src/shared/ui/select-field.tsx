import * as React from 'react'
import { Select } from '@/shared/ui/select'

export interface SelectFieldProps extends React.ComponentProps<'select'> {
  label: string
  error?: string
}

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ label, error, id, className, children, ...props }, ref) => {
  const generatedId = React.useId()
  const selectId = id ?? generatedId
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium">
        {label}
      </label>
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
})
SelectField.displayName = 'SelectField'
