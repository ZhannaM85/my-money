import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReorderIconButton } from './reorder-icon-button'

describe('ReorderIconButton (#267)', () => {
  it('is an icon-only control with the Reorder name', () => {
    render(
      <ReorderIconButton idleLabel="Reorder" onClick={() => undefined} />,
    )
    const button = screen.getByRole('button', { name: 'Reorder' })
    expect(button).toHaveClass('size-control')
    expect(button).not.toHaveTextContent('Reorder')
    expect(button.querySelector('svg')).toBeTruthy()
  })

  it('shows Save while pressed', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(
      <ReorderIconButton
        pressed
        idleLabel="Reorder"
        saveLabel="Save order"
        onClick={onClick}
      />,
    )
    const button = screen.getByRole('button', { name: 'Save order' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    await user.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })
})
