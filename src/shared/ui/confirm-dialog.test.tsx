import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useConfirm } from './confirm-dialog'

function setDateField(input: HTMLElement, value: string) {
  input.focus()
  Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

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

  it('returns the chosen end date (#328)', async () => {
    const user = userEvent.setup()
    function DateHarness() {
      const [confirm, dialog] = useConfirm()
      const [result, setResult] = useState('idle')
      return (
        <div>
          <button
            type="button"
            onClick={() => {
              void confirm({
                message: 'History before this date stays.',
                confirmLabel: 'Remove',
                date: { label: 'Remove from', value: '2026-11-17' },
              }).then((value) => setResult(String(value)))
            }}
          >
            Ask
          </button>
          <p>{result}</p>
          {dialog}
        </div>
      )
    }
    render(<DateHarness />)
    await user.click(screen.getByRole('button', { name: 'Ask' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('History before this date stays.')
    const date = within(dialog).getByLabelText('Remove from')
    expect(date).toHaveValue('2026-11-17')
    setDateField(date, '2026-05-01')
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }))
    expect(screen.getByText('2026-05-01')).toBeInTheDocument()
  })
})
