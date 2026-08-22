import * as React from 'react'
import type { Locale } from '@/domain/settings'
import { reformatRateInput } from '@/shared/lib/money'
import { NumberInput, type NumberInputProps } from '@/shared/ui/number-input'

export interface RateInputProps extends Omit<
  NumberInputProps,
  'value' | 'onChange' | 'type'
> {
  locale: Locale
  value: string
  onValueChange: (value: string) => void
}

export const RateInput = React.forwardRef<HTMLInputElement, RateInputProps>(
  ({ locale, value, onValueChange, onBlur, ...props }, ref) => {
    return (
      <NumberInput
        ref={ref}
        {...props}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={(event) => {
          onValueChange(reformatRateInput(value, locale))
          onBlur?.(event)
        }}
      />
    )
  },
)
RateInput.displayName = 'RateInput'
