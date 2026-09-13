import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useConfirm } from './confirm-dialog'

function Harness({ message }: { message: string }) {
  const [confirm, dialog] = useConfirm()
  const [result, setResult] = useState('idle')
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void confirm(message).then((ok) => setResult(ok ? 'yes' : 'no'))
        }}
      >
        Ask
      </button>
      <p>{result}</p>
      {dialog}
    </div>
  )
}

describe('useConfirm (#247)', () => {
  it('resolves true from OK and does not call window.confirm', async () => {
    const native = vi.spyOn(window, 'confirm')
    const user = userEvent.setup()
    render(<Harness message="Wipe this book?" />)
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Wipe this book?')
    expect(dialog).toHaveAttribute('data-state', 'open')
    await user.click(within(dialog).getByRole('button', { name: 'OK' }))
    expect(screen.getByText('yes')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(native).not.toHaveBeenCalled()
  })

  it('resolves false from Cancel, Escape, and the backdrop', async () => {
    const user = userEvent.setup()
    render(<Harness message="Delete this?" />)

    await user.click(screen.getByRole('button', { name: 'Ask' }))
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Cancel',
      }),
    )
    expect(screen.getByText('no')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ask' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Ask' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(dialog.previousElementSibling as Element)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
