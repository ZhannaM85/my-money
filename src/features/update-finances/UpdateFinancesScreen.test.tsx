import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { UpdateFinancesScreen } from './UpdateFinancesScreen'

const now = '2026-08-01T00:00:00.000Z'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
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
      amount: 1000,
      currency: 'EUR',
    },
  )
})

describe('UpdateFinancesScreen', () => {
  it('writes a same-amount snapshot when No change is saved', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UpdateFinancesScreen />
      </MemoryRouter>,
    )
    await user.click(await screen.findByRole('button', { name: 'No change' }))
    await user.click(screen.getByRole('button', { name: 'Save updates' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter((row) => row.assetId === 'a1'),
      ).toHaveLength(2)
    })
    const snapshots = useAssetStore
      .getState()
      .snapshots.filter((row) => row.assetId === 'a1')
    expect(snapshots.some((row) => row.date === todayIsoDate())).toBe(true)
    expect(snapshots.filter((row) => row.amount === 1000)).toHaveLength(2)
  })
})
