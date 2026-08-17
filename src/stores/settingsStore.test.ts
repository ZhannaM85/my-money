import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useSettingsStore } from './settingsStore'

beforeEach(async () => {
  await db.settings.clear()
  useSettingsStore.setState({
    settings: {
      id: 'singleton',
      baseCurrency: 'EUR',
      locale: 'en',
      onboardingCompleted: false,
      updatedAt: '1970-01-01T00:00:00.000Z',
    },
    loaded: false,
  })
})

describe('settingsStore', () => {
  it('loads defaults then persists a base-currency change', async () => {
    await useSettingsStore.getState().load()
    expect(useSettingsStore.getState().settings.baseCurrency).toBe('EUR')
    await useSettingsStore.getState().setBaseCurrency('USD')
    expect(useSettingsStore.getState().settings.baseCurrency).toBe('USD')
    await useSettingsStore.getState().load()
    expect(useSettingsStore.getState().settings.baseCurrency).toBe('USD')
  })

  it('persists skipping onboarding', async () => {
    await useSettingsStore.getState().load()
    expect(useSettingsStore.getState().settings.onboardingCompleted).toBe(false)
    await useSettingsStore.getState().completeOnboarding()
    expect(useSettingsStore.getState().settings.onboardingCompleted).toBe(true)
    await useSettingsStore.getState().load()
    expect(useSettingsStore.getState().settings.onboardingCompleted).toBe(true)
  })

  it('persists an explicit language override', async () => {
    await useSettingsStore.getState().load()
    await useSettingsStore.getState().setLocale('ru')
    expect(useSettingsStore.getState().settings.locale).toBe('ru')
    await useSettingsStore.getState().load()
    expect(useSettingsStore.getState().settings.locale).toBe('ru')
  })
})
