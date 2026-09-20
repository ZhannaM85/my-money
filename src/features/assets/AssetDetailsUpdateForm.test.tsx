import 'fake-indexeddb/auto'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { addDaysIso } from '@/shared/lib/dates'
import { formatAmount, todayIsoDate } from '@/shared/lib/money'
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

  it('saves a ± amount against the current remaining (#276)', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(screen.getByRole('button', { name: 'Removed' }))
    await user.type(screen.getByLabelText('New amount'), '250')
    expect(screen.getByTestId('resulting-remaining')).toHaveTextContent(/750/)
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.some(
            (row) =>
              row.assetId === 'a1' &&
              row.date === todayIsoDate() &&
              row.amount === 750,
          ),
      ).toBe(true)
    })
  })

  it('persists given/spent headline and shows cumulative decreases (#276)', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(screen.getByRole('button', { name: 'Removed' }))
    await user.type(screen.getByLabelText('New amount'), '250')
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.some((row) => row.assetId === 'a1' && row.amount === 750),
      ).toBe(true)
    })
    await user.click(screen.getByRole('button', { name: 'Given / received' }))
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0]?.balanceHeadline).toBe(
        'given_spent',
      )
    })
    expect(screen.getByText(formatAmount(0, 'EUR', 'en'))).toBeInTheDocument()
  })

  it('does not prefill given/received amount with remaining (#291)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: todayIsoDate(),
        amount: 800,
        currency: 'EUR',
      },
    ])
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(screen.getByRole('button', { name: 'Given / received' }))
    const amount = await screen.findByLabelText('Entry 1')
    expect(amount).toHaveValue('')
    expect(amount).not.toHaveValue('800.00')
    expect(amount).not.toHaveValue('1,000.00')
  })

  it('saves multiple spend lines as separate same-day snapshots (#279)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().setBalanceHeadline('a1', 'given_spent')
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.type(screen.getByLabelText('Entry 1'), '250')
    await user.type(screen.getByLabelText('Entry 1 note'), 'Gift')
    await user.click(screen.getByRole('button', { name: 'Add entry' }))
    await user.type(screen.getByLabelText('Entry 2'), '150')
    await user.type(screen.getByLabelText('Entry 2 note'), 'Travel')
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter(
            (row) => row.assetId === 'a1' && row.date === todayIsoDate(),
          )
          .slice()
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((row) => ({
            amount: row.amount,
            note: row.note,
            flow: row.flow,
          })),
      ).toEqual([
        { amount: 750, note: 'Gift', flow: -250 },
        { amount: 600, note: 'Travel', flow: -150 },
      ])
    })
    expect(await screen.findByTestId('spend-line-note-0')).toHaveTextContent(
      'Gift',
    )
    expect(screen.getByTestId('spend-line-note-1')).toHaveTextContent('Travel')
    expect(screen.queryByLabelText('Entry 1')).not.toBeInTheDocument()
  })

  it('edits a saved spend line on Update this asset (#280)', async () => {
    const user = userEvent.setup()
    const today = todayIsoDate()
    await useAssetStore.getState().setBalanceHeadline('a1', 'given_spent')
    await useAssetStore.getState().saveSnapshots([
      {
        id: 's-gift',
        assetId: 'a1',
        date: today,
        amount: 750,
        currency: 'EUR',
        createdAt: `${today}T10:00:00.000Z`,
        note: 'Gift',
      },
      {
        id: 's-travel',
        assetId: 'a1',
        date: today,
        amount: 600,
        currency: 'EUR',
        createdAt: `${today}T11:00:00.000Z`,
        note: 'Travel',
      },
    ])
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(await screen.findByTestId('spend-line-amount-0')).toHaveTextContent(
      formatAmount(250, 'EUR', 'en'),
    )
    await user.click(screen.getByRole('button', { name: 'Edit entry 1' }))
    const amount = await screen.findByLabelText('Entry 1')
    expect(amount).toHaveValue('250.00')
    await user.clear(amount)
    await user.type(amount, '200')
    await user.click(screen.getByRole('button', { name: 'Save entry 1' }))
    await user.click(screen.getByRole('button', { name: /^Save$/ }))
    await waitFor(() => {
      const rows = useAssetStore
        .getState()
        .snapshots.filter((row) => row.assetId === 'a1' && row.date === today)
        .slice()
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      expect(
        rows.map((row) => ({ amount: row.amount, note: row.note })),
      ).toEqual([
        { amount: 800, note: 'Gift' },
        { amount: 650, note: 'Travel' },
      ])
    })
  })

  it('persists remaining and note from the field save (#284)', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.type(screen.getByLabelText('New amount'), '1100')
    await user.type(screen.getByLabelText('Note (optional)'), 'Top-up')
    await user.click(screen.getByRole('button', { name: 'Save remaining' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.some(
            (row) =>
              row.assetId === 'a1' &&
              row.date === todayIsoDate() &&
              row.amount === 1100 &&
              row.note === 'Top-up',
          ),
      ).toBe(true)
    })
    expect(
      await screen.findByTestId('asset-update-save-status'),
    ).toHaveTextContent('Saved')
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeInTheDocument()
  })

  it('persists a given/received line from its save control (#284)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().setBalanceHeadline('a1', 'given_spent')
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.type(screen.getByLabelText('Entry 1'), '250')
    await user.type(screen.getByLabelText('Entry 1 note'), 'Gift')
    await user.click(screen.getByRole('button', { name: 'Save entry 1' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.some(
            (row) =>
              row.assetId === 'a1' &&
              row.date === todayIsoDate() &&
              row.flow === -250 &&
              row.note === 'Gift',
          ),
      ).toBe(true)
    })
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeInTheDocument()
  })

  it('uses the diskette icon for remaining and comment field saves (#288)', async () => {
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    const remaining = screen.getByRole('button', { name: 'Save remaining' })
    const comment = screen.getByRole('button', { name: 'Save comment' })
    expect(remaining.querySelector('.lucide-save')).toBeTruthy()
    expect(comment.querySelector('.lucide-save')).toBeTruthy()
    expect(remaining.querySelector('.lucide-check')).toBeFalsy()
    expect(comment.querySelector('.lucide-check')).toBeFalsy()
    expect(screen.getByRole('button', { name: /^Save$/ })).toBeInTheDocument()
  })
})
