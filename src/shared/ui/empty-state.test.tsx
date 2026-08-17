import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('shows the title and description', () => {
    render(
      <EmptyState title="Nothing here" description="Add an asset to start." />,
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Add an asset to start.')).toBeInTheDocument()
  })
})
