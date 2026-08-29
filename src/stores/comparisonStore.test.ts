import { beforeEach, describe, expect, it } from 'vitest'
import {
  COMPARISON_STORAGE_KEY,
  useComparisonStore,
} from './comparisonStore'

beforeEach(() => {
  localStorage.removeItem(COMPARISON_STORAGE_KEY)
  useComparisonStore.setState({ dates: [] })
})

describe('useComparisonStore (#137)', () => {
  it('adds unique dates in chronological order', () => {
    useComparisonStore.getState().addDate('2026-08-29')
    useComparisonStore.getState().addDate('2026-08-25')
    useComparisonStore.getState().addDate('2026-08-25')
    expect(useComparisonStore.getState().dates).toEqual([
      '2026-08-25',
      '2026-08-29',
    ])
  })

  it('removes a date from the set', () => {
    useComparisonStore.setState({ dates: ['2026-08-25', '2026-08-29'] })
    useComparisonStore.getState().removeDate('2026-08-25')
    expect(useComparisonStore.getState().dates).toEqual(['2026-08-29'])
  })

  it('clears every date (#143)', () => {
    useComparisonStore.setState({ dates: ['2026-08-25', '2026-08-29'] })
    useComparisonStore.getState().clearDates()
    expect(useComparisonStore.getState().dates).toEqual([])
  })
})

describe('useComparisonStore persistence (#142)', () => {
  it('writes dates to localStorage so a refresh can restore them', () => {
    useComparisonStore.getState().addDate('2026-08-25')
    useComparisonStore.getState().addDate('2026-08-29')
    const stored = JSON.parse(
      localStorage.getItem(COMPARISON_STORAGE_KEY) ?? '{}',
    ) as { state?: { dates?: string[] } }
    expect(stored.state?.dates).toEqual(['2026-08-25', '2026-08-29'])
  })

  it('restores dates from localStorage after a reload', async () => {
    localStorage.setItem(
      COMPARISON_STORAGE_KEY,
      JSON.stringify({
        state: { dates: ['2026-08-25', '2026-08-29'] },
        version: 0,
      }),
    )
    await useComparisonStore.persist.rehydrate()
    expect(useComparisonStore.getState().dates).toEqual([
      '2026-08-25',
      '2026-08-29',
    ])
  })
})
