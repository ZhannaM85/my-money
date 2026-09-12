import 'fake-indexeddb/auto'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { addDaysIso } from '@/shared/lib/dates'
import { todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import {
  renderAssetDetails,
  resetAssetDetailsStores,
  seedRevolutAsset,
  setDateField,
} from './assetDetailsTestSetup'

beforeEach(async () => {
  await resetAssetDetailsStores()
  await seedRevolutAsset()
})

describe('AssetDetailsUpdateForm', () => {
  it('appends a snapshot from the update field', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.type(screen.getByLabelText('New amount'), '1100')
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter((row) => row.assetId === 'a1'),
      ).toHaveLength(3)
    })
  })

  it('stacks Update this asset amount and Save so the row cannot clip on a phone', async () => {
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(screen.getByLabelText('New amount')).toHaveClass('min-w-0')
    expect(screen.getByRole('button', { name: /^Save$/ })).toHaveClass('w-full')
  })

  it('adds a past-dated snapshot from Update this asset', async () => {
    const user = userEvent.setup()
    const past = addDaysIso(todayIsoDate(), -20)
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    setDateField(screen.getAllByLabelText('As of')[0]!, past)
    await user.type(screen.getByLabelText('New amount'), '750')
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.some(
            (row) =>
              row.assetId === 'a1' && row.date === past && row.amount === 750,
          ),
      ).toBe(true)
    })
  })

  it('warns on duplicate date and amount but still allows save (#115, #119)', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    setDateField(screen.getAllByLabelText('As of')[0]!, '2026-08-17')
    await user.type(screen.getByLabelText('New amount'), '1000')
    const hint = await screen.findByText(
      /A snapshot with this date and amount already exists/,
    )
    expect(hint).toHaveClass('text-warning')
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter(
            (row) =>
              row.assetId === 'a1' &&
              row.date === '2026-08-17' &&
              row.amount === 1000,
          ),
      ).toHaveLength(2)
    })
  })

  it('saves and shows a muted snapshot note on the history row (#97, #103)', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.type(screen.getByLabelText('New amount'), '1100')
    await user.type(screen.getByLabelText('Note (optional)'), 'Top-up')
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    expect(await screen.findByText('Top-up')).toHaveClass(
      'text-muted-foreground',
    )
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.some(
            (row) =>
              row.assetId === 'a1' &&
              row.amount === 1100 &&
              row.note === 'Top-up',
          ),
      ).toBe(true)
    })
  })
})
