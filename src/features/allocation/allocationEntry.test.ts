import { describe, expect, it } from 'vitest'
import {
  allocationEntryFromState,
  allocationParentPath,
} from './allocationEntry'

describe('allocationEntry (#323)', () => {
  it('defaults to dashboard (owner tab) when state is missing', () => {
    expect(allocationEntryFromState(null)).toBe('dashboard')
    expect(allocationEntryFromState(undefined)).toBe('dashboard')
    expect(allocationEntryFromState({})).toBe('dashboard')
  })

  it('keeps settings when opened from More', () => {
    expect(allocationEntryFromState({ from: 'settings' })).toBe('settings')
  })

  it('maps entry to parent path', () => {
    expect(allocationParentPath('dashboard')).toBe('/')
    expect(allocationParentPath('settings')).toBe('/settings')
  })
})
