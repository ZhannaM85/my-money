/**
 * #334 — public-facing author credit for marketing / About surfaces.
 * Never put the full surname in product UI, Pages copy, or listing drafts
 * that ship with the app. Git commit author and App Store Connect legal
 * name fields are out of scope.
 */
export const AUTHOR_CREDIT = 'Zhanna M.' as const
export const AUTHOR_CREDIT_RU = 'Жанна М.' as const

/** Full-surname patterns that must not appear in user-visible product strings. */
export const FORBIDDEN_SURNAME_PATTERNS: RegExp[] = [
  /Myshkovskaia/i,
  /Myshkovskaya/i,
  /Мышковск/i,
]
