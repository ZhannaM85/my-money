import 'fake-indexeddb/auto'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { CsvSection } from './CsvSection'

const now = '2026-08-17T00:00:00.000Z'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS, loaded: true })
  await useAssetStore.getState().saveAsset(
    {
      id: 'a1',
      name: 'Revolut',
      assetClass: 'money',
      type: 'bank',
      currency: 'EUR',
      trackingStatus: 'included',
      valuationMethod: 'account_balance',
      updateFrequency: 'weekly',
      createdAt: now,
      updatedAt: now,
    },
    {
      assetId: 'a1',
      date: '2026-08-01',
      amount: 900,
      currency: 'EUR',
    },
  )
})

describe('CsvSection', () => {
  it('maps CSV columns and reports unmatched rows instead of dropping them', async () => {
    const user = userEvent.setup()
    render(<CsvSection />)

    const file = new File(
      ['date,name,value,ccy\n2026-08-17,Revolut,1100,EUR\n2026-08-17,Unknown,50,EUR\n'],
      'balances.csv',
      { type: 'text/csv' },
    )
    await user.upload(screen.getByLabelText('Import CSV'), file)

    expect(await screen.findByText('Map columns')).toBeInTheDocument()
    expect(
      screen.getByText(/1 snapshot ready, 1 row unmatched or invalid/),
    ).toBeInTheDocument()
    expect(screen.getByText(/no matching asset/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Import mapped rows' }))

    expect(
      await screen.findByText(
        'Imported 1 snapshot. 1 row could not be imported.',
      ),
    ).toBeInTheDocument()
    expect(useAssetStore.getState().snapshots).toHaveLength(2)
  })
})
