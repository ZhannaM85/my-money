import { describe, expect, it } from 'vitest'
import { useComparisonStore } from './comparisonStore'

describe('useComparisonStore (#137)', () => {
  it('adds unique dates in chronological order', () => {
    useComparisonStore.setState({ dates: [] })
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
})
