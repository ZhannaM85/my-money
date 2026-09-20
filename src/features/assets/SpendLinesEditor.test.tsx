import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { formatAmount } from '@/shared/lib/money'
import { SpendLinesEditor } from './SpendLinesEditor'
import type { SpendLineDraft } from './spendLines'

function EditorHarness({ initial }: { initial: SpendLineDraft[] }) {
  const [lines, setLines] = useState(initial)
  return (
    <SpendLinesEditor
      lines={lines}
      onChange={setLines}
      locale="en"
      currency="USD"
      amountAria={(index) => `Entry ${index}`}
      noteAria={(index) => `Entry ${index} note`}
    />
  )
}

const saved: SpendLineDraft[] = [
  {
    key: 's1',
    snapshotId: 's1',
    amount: '1,500.00',
    note: 'Anton',
    direction: 'given',
  },
  {
    key: 's2',
    snapshotId: 's2',
    amount: '800.00',
    note: 'Card',
    direction: 'received',
  },
]

describe('SpendLinesEditor (#283)', () => {
  it('shows saved lines read-only until pencil, then save locks them again', async () => {
    const user = userEvent.setup()
    render(<EditorHarness initial={saved} />)

    expect(screen.getByTestId('spend-line-0')).toHaveAttribute(
      'data-editing',
      'false',
    )
    expect(screen.getByTestId('spend-line-amount-0')).toHaveTextContent(
      formatAmount(1500, 'USD', 'en'),
    )
    expect(screen.getByTestId('spend-line-note-0')).toHaveTextContent('Anton')
    expect(screen.queryByLabelText('Entry 1')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Received' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit entry 1' }))
    const amount = screen.getByLabelText('Entry 1')
    expect(amount).toHaveValue('1,500.00')
    await user.clear(amount)
    await user.type(amount, '1200')
    await user.click(screen.getByRole('button', { name: 'Received' }))
    await user.click(screen.getByRole('button', { name: 'Save entry 1' }))

    expect(screen.getByTestId('spend-line-0')).toHaveAttribute(
      'data-editing',
      'false',
    )
    expect(screen.queryByLabelText('Entry 1')).not.toBeInTheDocument()
    expect(screen.getByTestId('spend-line-amount-0')).toHaveTextContent(
      formatAmount(1200, 'USD', 'en'),
    )
    expect(screen.getByTestId('spend-line-0')).toHaveTextContent('Received')
    expect(screen.getByTestId('spend-line-1')).toHaveAttribute(
      'data-editing',
      'false',
    )
  })

  it('keeps new unsaved lines editable until their first save', async () => {
    const user = userEvent.setup()
    render(
      <EditorHarness
        initial={[{ key: 'new', amount: '', note: '', direction: 'given' }]}
      />,
    )

    expect(screen.getByTestId('spend-line-0')).toHaveAttribute(
      'data-editing',
      'true',
    )
    await user.type(screen.getByLabelText('Entry 1'), '400')
    await user.type(screen.getByLabelText('Entry 1 note'), 'Taxi')
    await user.click(screen.getByRole('button', { name: 'Add entry' }))
    expect(screen.getByTestId('spend-line-1')).toHaveAttribute(
      'data-editing',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Save entry 1' }))
    expect(screen.getByTestId('spend-line-0')).toHaveAttribute(
      'data-editing',
      'false',
    )
    expect(screen.getByTestId('spend-line-note-0')).toHaveTextContent('Taxi')
    expect(screen.getByTestId('spend-line-1')).toHaveAttribute(
      'data-editing',
      'true',
    )
  })

  it('keeps delete on a read-only saved line', async () => {
    const user = userEvent.setup()
    render(<EditorHarness initial={saved} />)
    await user.click(screen.getByRole('button', { name: 'Remove entry 2' }))
    expect(screen.queryByTestId('spend-line-1')).not.toBeInTheDocument()
    expect(screen.getByTestId('spend-line-note-0')).toHaveTextContent('Anton')
  })
})
