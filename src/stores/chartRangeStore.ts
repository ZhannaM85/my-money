import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { HistoryRange } from '@/shared/lib/dates'
import { todayIsoDate } from '@/shared/lib/money'

export const CHART_RANGE_STORAGE_KEY = 'my-money-chart-range'

interface ChartRangeState {
  range: HistoryRange
  rangeEnd: string
  /** True after ←/→ pan; keeps an older end until reset (#210). */
  rangeEndPinned: boolean
  customStart: string
  customEnd: string
  setRange: (range: HistoryRange) => void
  setRangeEnd: (rangeEnd: string) => void
  setRangeEndPinned: (rangeEndPinned: boolean) => void
  setCustomStart: (customStart: string) => void
  setCustomEnd: (customEnd: string) => void
}

function initialToday(): string {
  return todayIsoDate()
}

export const useChartRangeStore = create<ChartRangeState>()(
  persist(
    (set) => ({
      range: '1M',
      rangeEnd: initialToday(),
      rangeEndPinned: false,
      customStart: initialToday(),
      customEnd: initialToday(),
      setRange: (range) => set({ range }),
      setRangeEnd: (rangeEnd) => set({ rangeEnd }),
      setRangeEndPinned: (rangeEndPinned) => set({ rangeEndPinned }),
      setCustomStart: (customStart) => set({ customStart }),
      setCustomEnd: (customEnd) => set({ customEnd }),
    }),
    {
      name: CHART_RANGE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        range: state.range,
        rangeEnd: state.rangeEnd,
        rangeEndPinned: state.rangeEndPinned,
        customStart: state.customStart,
        customEnd: state.customEnd,
      }),
    },
  ),
)
