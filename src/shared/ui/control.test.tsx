import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'
import { Chip } from './chip'
import { Input } from './input'
import { Select } from './select'
import { SelectField } from './select-field'

describe('shared control sizes (#232)', () => {
  it('uses the control-height token on default buttons, inputs, and selects', () => {
    render(
      <>
        <Button>Save</Button>
        <Input aria-label="Amount" />
        <Select aria-label="Currency">
          <option value="EUR">EUR</option>
        </Select>
      </>,
    )
    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(
      'h-control',
    )
    expect(screen.getByLabelText('Amount')).toHaveClass('h-control')
    expect(screen.getByLabelText('Currency')).toHaveClass('h-control')
  })

  it('keeps xl CTAs on the same height token as default', () => {
    render(
      <Button size="xl" className="w-full">
        Update rates
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Update rates' })
    expect(button).toHaveClass('h-control')
    expect(button).toHaveClass('w-full')
  })

  it('sizes chips and compact icon buttons on the compact token', () => {
    render(
      <>
        <Chip pressed>Week</Chip>
        <Button size="icon-compact" aria-label="Earlier" />
        <Button size="icon-xl" aria-label="Add" />
      </>,
    )
    expect(screen.getByRole('button', { name: 'Week' })).toHaveClass(
      'h-control-compact',
      'rounded-full',
    )
    expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Earlier' })).toHaveClass(
      'size-control-compact',
    )
    expect(screen.getByRole('button', { name: 'Add' })).toHaveClass(
      'size-control',
    )
  })

  it('renders a labelled select field', () => {
    render(
      <SelectField label="Language" defaultValue="en">
        <option value="en">English</option>
      </SelectField>,
    )
    expect(screen.getByLabelText('Language')).toHaveClass('h-control')
  })

  it('uses compact density for dense table inputs', () => {
    render(<Input aria-label="Cell" density="compact" />)
    expect(screen.getByLabelText('Cell')).toHaveClass('h-control-compact')
    expect(screen.getByLabelText('Cell')).not.toHaveClass('h-control')
  })
})
