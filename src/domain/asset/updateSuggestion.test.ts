import { describe, expect, it } from 'vitest'
import {
  daysBetweenIso,
  isSuggestedUpdate,
  lastUpdatedCopy,
} from './updateSuggestion'

describe('isSuggestedUpdate', () => {
  it('nags weekly/monthly when stale, but not yearly or manual', () => {
    expect(isSuggestedUpdate('weekly', '2026-08-01', '2026-08-17')).toBe(true)
    expect(isSuggestedUpdate('weekly', '2026-08-16', '2026-08-17')).toBe(false)
    expect(isSuggestedUpdate('monthly', '2026-07-01', '2026-08-17')).toBe(true)
    expect(isSuggestedUpdate('yearly', '2025-01-01', '2026-08-17')).toBe(false)
    expect(isSuggestedUpdate('manual', undefined, '2026-08-17')).toBe(false)
    expect(isSuggestedUpdate('weekly', undefined, '2026-08-17')).toBe(true)
  })
})

describe('lastUpdatedCopy', () => {
  it('describes recency in plain language', () => {
    expect(lastUpdatedCopy(undefined, '2026-08-17')).toBe('No value yet')
    expect(lastUpdatedCopy('2026-08-17', '2026-08-17')).toBe('Updated today')
    expect(lastUpdatedCopy('2026-08-16', '2026-08-17')).toBe(
      'Updated yesterday',
    )
    expect(lastUpdatedCopy('2026-08-10', '2026-08-17')).toBe(
      'Updated 7 days ago',
    )
  })
})

describe('daysBetweenIso', () => {
  it('counts UTC calendar days', () => {
    expect(daysBetweenIso('2026-08-01', '2026-08-17')).toBe(16)
  })
})
