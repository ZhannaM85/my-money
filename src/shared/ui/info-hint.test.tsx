import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InfoHint } from './info-hint'

describe('InfoHint', () => {
  it('reveals the hint when the info button is tapped', async () => {
    const user = userEvent.setup()
    render(
      <InfoHint hint="Saves a snapshot for today." label="About Update this asset">
        <h2>Update this asset</h2>
      </InfoHint>,
    )

    expect(
      screen.queryByText('Saves a snapshot for today.'),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'About Update this asset' }),
    )
    expect(screen.getByText('Saves a snapshot for today.')).toBeInTheDocument()
  })
})
