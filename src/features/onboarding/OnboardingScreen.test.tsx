import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { OnboardingScreen } from './OnboardingScreen'

beforeEach(async () => {
  await db.settings.clear()
  await db.assets.clear()
  await db.snapshots.clear()
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: false,
  })
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
})

describe('OnboardingScreen', () => {
  it('continues from base currency to the first-asset form', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <OnboardingScreen />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(
      screen.getByRole('heading', { name: 'First asset' }),
    ).toBeInTheDocument()
  })
})
