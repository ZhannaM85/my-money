import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch } from './switch'

describe('Switch (#271)', () => {
  it('toggles aria-checked and notifies on click', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const { rerender } = render(
      <Switch
        checked={false}
        aria-label="Demo"
        onCheckedChange={onCheckedChange}
      />,
    )
    const control = screen.getByRole('switch', { name: 'Demo' })
    expect(control).toHaveAttribute('aria-checked', 'false')
    await user.click(control)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    rerender(
      <Switch
        checked={true}
        aria-label="Demo"
        onCheckedChange={onCheckedChange}
      />,
    )
    expect(screen.getByRole('switch', { name: 'Demo' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })
})
