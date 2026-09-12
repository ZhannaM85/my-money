import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { formatEditableAmount } from '@/shared/lib/money'
import { MoneyInput } from './money-input'

describe('MoneyInput (#236)', () => {
  it('shows the currency unit and reformats a valid draft on blur', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [value, setValue] = useState('116420')
      return (
        <MoneyInput
          locale="en"
          currency="EUR"
          value={value}
          onValueChange={setValue}
          aria-label="Amount"
        />
      )
    }
    render(<Harness />)
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.queryByText('Amount')).not.toBeInTheDocument()
    const input = screen.getByLabelText('Amount')
    expect(input).toHaveClass('h-control', 'pr-12', 'min-w-0')
    await user.click(input)
    await user.tab()
    expect(input).toHaveValue(formatEditableAmount(116420, 'en', 'EUR'))
  })

  it('renders a visible label when provided', () => {
    render(
      <MoneyInput
        label="Current amount"
        locale="en"
        currency="USD"
        value=""
        onValueChange={() => undefined}
      />,
    )
    expect(screen.getByLabelText('Current amount')).toBeInTheDocument()
    expect(screen.getByText('Current amount')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
  })
})
