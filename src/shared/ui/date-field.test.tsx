import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DateField } from './date-field'

describe('DateField', () => {
  afterEach(() => {
    Reflect.deleteProperty(window.HTMLInputElement.prototype, 'showPicker')
  })

  it('opens the native picker when the date field is tapped', async () => {
    const user = userEvent.setup()
    const showPicker = vi.fn()
    Object.defineProperty(window.HTMLInputElement.prototype, 'showPicker', {
      configurable: true,
      value: showPicker,
      writable: true,
    })

    render(
      <DateField label="As of" value="2026-08-21" onChange={() => undefined} />,
    )
    await user.click(screen.getByLabelText('As of'))
    expect(showPicker).toHaveBeenCalled()
  })
})
