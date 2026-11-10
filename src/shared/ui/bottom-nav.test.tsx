import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BottomNav } from './bottom-nav'

describe('BottomNav (#323)', () => {
  it('keeps Dashboard highlighted on Allocation (owner tab)', () => {
    render(
      <MemoryRouter initialEntries={['/allocation']}>
        <BottomNav />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'More' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByRole('link', { name: 'Assets' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('still highlights Assets on asset routes', () => {
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <BottomNav />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Assets' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    )
  })
})
