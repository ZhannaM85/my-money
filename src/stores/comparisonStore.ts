import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const COMPARISON_STORAGE_KEY = 'my-money-comparison'

interface ComparisonState {
  dates: string[]
  addDate: (date: string) => void
  removeDate: (date: string) => void
  clearDates: () => void
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      dates: [],
      addDate: (date) =>
        set((state) => {
          if (state.dates.includes(date)) return state
          return { dates: [...state.dates, date].sort() }
        }),
      removeDate: (date) =>
        set((state) => ({
          dates: state.dates.filter((row) => row !== date),
        })),
      clearDates: () => set({ dates: [] }),
    }),
    {
      name: COMPARISON_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ dates: state.dates }),
    },
  ),
)
