import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OverflowMenu } from './overflow-menu'

describe('OverflowMenu', () => {
  it('opens on the ⋯ trigger and runs the chosen item (#244)', async () => {
    const user = userEvent.setup()
    const onHide = vi.fn()
    render(
      <OverflowMenu
        ariaLabel="Actions for Cash"
        items={[{ label: 'Hide', ariaLabel: 'Hide Cash', onSelect: onHide }]}
      />,
    )
    expect(
      screen.queryByRole('menuitem', { name: 'Hide Cash' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Actions for Cash' }))
    await user.click(screen.getByRole('menuitem', { name: 'Hide Cash' }))
    expect(onHide).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByRole('menuitem', { name: 'Hide Cash' }),
    ).not.toBeInTheDocument()
  })

  it('closes when clicking outside the menu', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <button type="button">Outside</button>
        <OverflowMenu
          ariaLabel="Actions for Cash"
          items={[{ label: 'Hide', onSelect: () => undefined }]}
        />
      </div>,
    )
    await user.click(screen.getByRole('button', { name: 'Actions for Cash' }))
    expect(screen.getByRole('menuitem', { name: 'Hide' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Outside' }))
    expect(
      screen.queryByRole('menuitem', { name: 'Hide' }),
    ).not.toBeInTheDocument()
  })
})
