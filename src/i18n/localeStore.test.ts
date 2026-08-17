import { describe, expect, it } from 'vitest'
import { detectDefaultLocale } from '@/domain/settings'
import { en } from './en'
import { ru } from './ru'
import { getDictionary } from './localeStore'

describe('detectDefaultLocale', () => {
  it('defaults to English for a non-Russian browser language', () => {
    const original = navigator.language
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true,
    })
    expect(detectDefaultLocale()).toBe('en')
    Object.defineProperty(navigator, 'language', {
      value: original,
      configurable: true,
    })
  })

  it('defaults to Russian for a Russian browser language', () => {
    const original = navigator.language
    Object.defineProperty(navigator, 'language', {
      value: 'ru-RU',
      configurable: true,
    })
    expect(detectDefaultLocale()).toBe('ru')
    Object.defineProperty(navigator, 'language', {
      value: original,
      configurable: true,
    })
  })
})

describe('getDictionary', () => {
  it('returns the matching dictionary for each locale', () => {
    expect(getDictionary('en')).toBe(en)
    expect(getDictionary('ru')).toBe(ru)
    expect(ru.dashboard.netWorth).toBe('Чистый капитал')
    expect(ru.asset.classes.liabilities).toBe('Обязательства')
  })
})
