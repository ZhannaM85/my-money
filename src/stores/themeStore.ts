import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { applyNativeChromeTheme } from '@/shared/native/nativeChrome'

export type Mood = 'fresh' | 'ledger' | 'green' | 'soft' | 'neutral' | 'pastel'

export const MOODS: Mood[] = [
  'fresh',
  'ledger',
  'green',
  'soft',
  'neutral',
  'pastel',
]

export function applyTheme(mood: Mood) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.mood = mood
  const isDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  applyNativeChromeTheme(isDark)
}

interface ThemeStoreState {
  mood: Mood
  setMood: (mood: Mood) => void
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set) => ({
      mood: 'fresh',
      setMood: (mood) => {
        set({ mood })
        applyTheme(mood)
      },
    }),
    {
      name: 'my-money-theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

applyTheme(useThemeStore.getState().mood)
