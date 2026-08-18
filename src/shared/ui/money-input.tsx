import * as React from 'react'
import type { Locale } from '@/domain/settings'
import { reformatAmountInput } from '@/shared/lib/money'
import { NumberInput, type NumberInputProps } from '@/shared/ui/number-input'

export interface MoneyInputProps extends Omit<
  NumberInputProps,
  'value' | 'onChange' | 'type'
> {
  locale: Locale
  currency?: string
  value: string
  onValueChange: (value: string) => void
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    { locale, currency, value, onValueChange, unit, onBlur, ...props },
    ref,
  ) => {
    return (
      <NumberInput
        ref={ref}
        {...props}
        unit={unit ?? currency}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={(event) => {
          onValueChange(reformatAmountInput(value, locale, currency))
          onBlur?.(event)
        }}
      />
    )
  },
)
MoneyInput.displayName = 'MoneyInput'
