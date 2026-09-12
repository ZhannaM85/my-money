import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { addDaysIso } from '@/shared/lib/dates'
import { todayIsoDate } from '@/shared/lib/money'
import {
  resetChartRangeStore,
  useChartRangeStore,
} from '@/stores/chartRangeStore'
import { useLocalChartRange, useSharedChartRange } from './useChartRange'

const today = todayIsoDate()
const earliest = addDaysIso(today, -120)

beforeEach(() => {
  resetChartRangeStore()
})

describe('useSharedChartRange / useLocalChartRange (#239)', () => {
  it('shares chip + custom dates + pan window across hook instances', () => {
    const { result: first } = renderHook(() =>
      useSharedChartRange(earliest, today),
    )
    expect(first.current.range).toBe('1M')

    act(() => {
      first.current.selectRange('All')
    })
    expect(useChartRangeStore.getState().range).toBe('All')

    const { result: second } = renderHook(() =>
      useSharedChartRange(earliest, today),
    )
    expect(second.current.range).toBe('All')
    expect(second.current.rangeLabel).toMatch(/All/)
  })

  it('keeps a local range off the shared store', () => {
    useChartRangeStore.getState().setRange('1W')
    const { result } = renderHook(() =>
      useLocalChartRange(earliest, today, 'All'),
    )
    expect(result.current.range).toBe('All')

    act(() => {
      result.current.selectRange('1Y')
    })
    expect(result.current.range).toBe('1Y')
    expect(useChartRangeStore.getState().range).toBe('1W')
  })
})
