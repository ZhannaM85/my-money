import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { useSettingsStore } from './settingsStore'

beforeEach(async () => {
  await db.settings.clear()
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
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

  it('persists the asset display mode preference', async () => {
    await useSettingsStore.getState().load()
    await useSettingsStore.getState().setCurrencyDisplayMode('native')
    expect(useSettingsStore.getState().settings.currencyDisplayMode).toBe(
      'native',
    )
    await useSettingsStore.getState().load()
    expect(useSettingsStore.getState().settings.currencyDisplayMode).toBe(
      'native',
    )
  })

  it('persists a custom asset list order', async () => {
    await useSettingsStore.getState().load()
    await useSettingsStore.getState().persistCustomAssetOrder(['b', 'a'])
    expect(useSettingsStore.getState().settings.assetListSort).toBe('custom')
    expect(useSettingsStore.getState().settings.assetListOrder).toEqual([
      'b',
      'a',
    ])
    await useSettingsStore.getState().load()
    expect(useSettingsStore.getState().settings.assetListOrder).toEqual([
      'b',
      'a',
    ])
  })
})
