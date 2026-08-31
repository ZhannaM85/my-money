import { beforeEach, describe, expect, it } from 'vitest'
import {
  CHART_RANGE_STORAGE_KEY,
  useChartRangeStore,
} from './chartRangeStore'

beforeEach(() => {
  localStorage.removeItem(CHART_RANGE_STORAGE_KEY)
  useChartRangeStore.setState({
    range: '1M',
    rangeEnd: '2026-08-31',
    customStart: '2026-08-31',
    customEnd: '2026-08-31',
  })
})

describe('useChartRangeStore (#185)', () => {
  it('writes range to localStorage so a tab hop can restore it', () => {
    useChartRangeStore.getState().setRange('All')
    const stored = JSON.parse(
      localStorage.getItem(CHART_RANGE_STORAGE_KEY) ?? '{}',
    ) as { state?: { range?: string } }
    expect(stored.state?.range).toBe('All')
  })

  it('restores range and custom dates from localStorage after a reload', async () => {
    localStorage.setItem(
      CHART_RANGE_STORAGE_KEY,
      JSON.stringify({
        state: {
          range: 'Custom',
          rangeEnd: '2026-08-31',
          customStart: '2026-08-01',
          customEnd: '2026-08-20',
        },
        version: 0,
      }),
    )
    await useChartRangeStore.persist.rehydrate()
    expect(useChartRangeStore.getState().range).toBe('Custom')
    expect(useChartRangeStore.getState().customStart).toBe('2026-08-01')
    expect(useChartRangeStore.getState().customEnd).toBe('2026-08-20')
  })
})
