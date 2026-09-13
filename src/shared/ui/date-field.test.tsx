import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { formatCalendarDate } from '@/shared/lib/money'
import { useSettingsStore } from '@/stores/settingsStore'
import { DateField } from './date-field'

describe('DateField', () => {
  afterEach(() => {
    Reflect.deleteProperty(window.HTMLInputElement.prototype, 'showPicker')
    useSettingsStore.setState({ settings: DEFAULT_SETTINGS })
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

  it('uses a fixed Safari-safe width instead of stretching with the page (#95, #84)', () => {
    render(
      <DateField label="As of" value="2026-08-21" onChange={() => undefined} />,
    )
    const input = screen.getByLabelText('As of')
    expect(input).toHaveClass('w-[13.5rem]')
    expect(input).toHaveClass('h-control')
    expect(input).not.toHaveClass('w-full')
    expect(input).not.toHaveClass('max-w-full')
  })

  it('shows a Russian locale overlay, not English January (#259)', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
    })
    render(
      <DateField label="На дату" value="2025-01-24" onChange={() => undefined} />,
    )
    expect(screen.getByTestId('date-field-display')).toHaveTextContent(
      formatCalendarDate('2025-01-24', 'ru'),
    )
    expect(screen.getByTestId('date-field-display')).not.toHaveTextContent(
      'January',
    )
  })
})
