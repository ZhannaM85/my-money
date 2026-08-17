import type { Locale } from '@/domain/settings'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Dictionary } from './Dictionary'
import { en } from './en'
import { ru } from './ru'

export type { Locale }

const dictionaries: Record<Locale, Dictionary> = { en, ru }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function useTranslation(): Dictionary {
  const locale = useSettingsStore((state) => state.settings.locale)
  return dictionaries[locale]
}

export function useLocale(): Locale {
  return useSettingsStore((state) => state.settings.locale)
}
