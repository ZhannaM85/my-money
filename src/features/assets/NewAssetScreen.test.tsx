import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { addDaysIso } from '@/shared/lib/dates'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { NewAssetScreen } from './NewAssetScreen'

function setDateField(label: string, value: string) {
  const input = screen.getByLabelText(label)
  input.focus()
  Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: true })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: true,
  })
})

describe('NewAssetScreen', () => {
  it('saves the first snapshot on a past date', async () => {
    const user = userEvent.setup()
    const past = addDaysIso(todayIsoDate(), -10)
    render(
      <MemoryRouter>
        <NewAssetScreen />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Name'), 'Past bank')
    await user.type(screen.getByLabelText('Current amount'), '1000')
    await user.tab()
    setDateField('As of', past)
    await user.click(screen.getByRole('button', { name: 'Save asset' }))

    await waitFor(() => {
      expect(useAssetStore.getState().snapshots[0]?.date).toBe(past)
    })
    expect(useAssetStore.getState().snapshots[0]?.amount).toBe(1000)
  })

  it('rejects a future first-snapshot date', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <NewAssetScreen />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Name'), 'Future bank')
    await user.type(screen.getByLabelText('Current amount'), '1000')
    await user.tab()
    setDateField('As of', addDaysIso(todayIsoDate(), 1))
    await user.click(screen.getByRole('button', { name: 'Save asset' }))

    expect(
      await screen.findByText('Choose today or a past date'),
    ).toBeInTheDocument()
    expect(useAssetStore.getState().snapshots).toHaveLength(0)
  })
})
