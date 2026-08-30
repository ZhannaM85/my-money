import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SwipeRevealRow } from './swipe-reveal-row'

describe('SwipeRevealRow (#146)', () => {
  it('reveals the action after a left swipe and calls onAction', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <SwipeRevealRow
        actionLabel="Hide"
        actionAria="Hide Cash"
        onAction={onAction}
      >
        <p>Cash</p>
      </SwipeRevealRow>,
    )
    const panel = screen.getByText('Cash').parentElement
    expect(panel).toHaveAttribute('data-swipe-open', 'false')
    await user.pointer([
      { keys: '[TouchA>]', target: panel!, coords: { x: 200, y: 10 } },
      { pointerName: 'TouchA', coords: { x: 80, y: 10 } },
      { keys: '[/TouchA]', coords: { x: 80, y: 10 } },
    ])
    expect(panel).toHaveAttribute('data-swipe-open', 'true')
    await user.click(screen.getByRole('button', { name: 'Hide Cash' }))
    expect(onAction).toHaveBeenCalledOnce()
  })
})
