export type { Dictionary } from './Dictionary'
export type { Locale } from './localeStore'
export { detectDefaultLocale } from '@/domain/settings'
export {
  getDictionary,
  useTranslation,
  useLocale,
} from './localeStore'
export { formatLastUpdated } from './formatLastUpdated'
export { ruPluralize } from './ruPluralize'
