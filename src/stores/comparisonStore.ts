import { create } from 'zustand'

interface ComparisonState {
  dates: string[]
  addDate: (date: string) => void
  removeDate: (date: string) => void
}

export const useComparisonStore = create<ComparisonState>((set) => ({
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
}))
