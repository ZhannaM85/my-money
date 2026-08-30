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

  it('reveals the action on click when revealOn is click (#150)', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(
      <SwipeRevealRow
        revealOn="click"
        actionLabel="Hide"
        actionAria="Hide Cash"
        onAction={onAction}
      >
        <p>Cash</p>
      </SwipeRevealRow>,
    )
    const panel = screen.getByRole('button', { expanded: false })
    expect(panel).toHaveAttribute('data-swipe-open', 'false')
    await user.click(panel)
    expect(panel).toHaveAttribute('data-swipe-open', 'true')
    expect(panel).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: 'Hide Cash' }))
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('does not let a click-mode reveal bubble to a parent toggle (#157)', async () => {
    const user = userEvent.setup()
    const onParent = vi.fn()
    const onAction = vi.fn()
    render(
      <div onClick={onParent}>
        <SwipeRevealRow
          revealOn="click"
          actionLabel="Hide"
          actionAria="Hide Cash"
          onAction={onAction}
        >
          <p>Cash</p>
        </SwipeRevealRow>
      </div>,
    )
    await user.click(screen.getByRole('button', { expanded: false }))
    expect(onParent).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { expanded: true })).toHaveAttribute(
      'data-swipe-open',
      'true',
    )
  })

  it('paints Show green and Hide red (#159)', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <SwipeRevealRow
        revealOn="click"
        actionLabel="Hide"
        actionAria="Hide Cash"
        actionTone="destructive"
        onAction={() => undefined}
      >
        <p>Cash</p>
      </SwipeRevealRow>,
    )
    await user.click(screen.getByRole('button', { expanded: false }))
    expect(screen.getByRole('button', { name: 'Hide Cash' })).toHaveAttribute(
      'data-action-tone',
      'destructive',
    )
    rerender(
      <SwipeRevealRow
        revealOn="click"
        actionLabel="Show"
        actionAria="Show Cash"
        actionTone="positive"
        onAction={() => undefined}
      >
        <p>Cash</p>
      </SwipeRevealRow>,
    )
    expect(screen.getByRole('button', { name: 'Show Cash' })).toHaveAttribute(
      'data-action-tone',
      'positive',
    )
  })
})
