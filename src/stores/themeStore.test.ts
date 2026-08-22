import { beforeEach, describe, expect, it } from 'vitest'
import { applyTheme, MOODS, useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ mood: 'fresh' })
    applyTheme('fresh')
  })

  it('lists Fresh first and can apply it without renaming older moods', () => {
    expect(MOODS[0]).toBe('fresh')
    expect(MOODS).toContain('ledger')
    expect(document.documentElement.dataset.mood).toBe('fresh')
    applyTheme('ledger')
    expect(document.documentElement.dataset.mood).toBe('ledger')
    expect(useThemeStore.getState().mood).toBe('fresh')
  })
})

