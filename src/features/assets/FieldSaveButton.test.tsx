import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FieldSaveButton } from './FieldSaveButton'

describe('FieldSaveButton (#288)', () => {
  it('uses the diskette icon, not a checkmark', () => {
    render(<FieldSaveButton label="Save remaining" onClick={vi.fn()} />)
    const button = screen.getByRole('button', { name: 'Save remaining' })
    expect(button.querySelector('.lucide-save')).toBeTruthy()
    expect(button.querySelector('.lucide-check')).toBeFalsy()
  })
})
