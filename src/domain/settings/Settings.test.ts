import { describe, expect, it } from 'vitest'
import { shouldShowOnboarding } from './Settings'

describe('shouldShowOnboarding', () => {
  it('shows on an empty book that has not skipped', () => {
    expect(shouldShowOnboarding(0, false)).toBe(true)
  })

  it('does not reappear after skip or once a book exists', () => {
    expect(shouldShowOnboarding(0, true)).toBe(false)
    expect(shouldShowOnboarding(1, false)).toBe(false)
    expect(shouldShowOnboarding(1, true)).toBe(false)
  })
})
