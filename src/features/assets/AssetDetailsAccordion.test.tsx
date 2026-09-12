import 'fake-indexeddb/auto'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
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

describe('AssetDetailsAccordion', () => {
  it('opens existing assets in a read-only details view', async () => {
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(
      screen.queryByRole('button', { name: 'Save details' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Details$/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(
      screen.queryByRole('button', { name: 'Edit details' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Account balance')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /^Details$/ }))
    expect(screen.getByRole('button', { name: /^Details$/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(
      screen.getByRole('button', { name: 'Edit details' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Account balance')).toBeInTheDocument()
  })

  it('adds a past-dated snapshot from Save details', async () => {
    const user = userEvent.setup()
    const past = '2026-01-01'
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(
      screen.queryByRole('button', { name: 'Save details' }),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Details$/ }))
    await user.click(screen.getByRole('button', { name: 'Edit details' }))
    const asOfFields = screen.getAllByLabelText('As of')
    setDateField(asOfFields[asOfFields.length - 1]!, past)
    await user.type(screen.getByLabelText('New amount (optional)'), '500')
    await user.click(screen.getByRole('button', { name: 'Save details' }))
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.some(
            (row) =>
              row.assetId === 'a1' && row.date === past && row.amount === 500,
          ),
      ).toBe(true)
    })
  })

  it('expands Details to show the overview and edit action (#231)', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    const details = screen.getByRole('button', { name: /^Details$/ })
    await user.click(details)
    expect(details).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Account balance')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Edit details' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Exclude from net worth' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Hide asset' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Delete asset' }),
    ).toBeInTheDocument()
    await user.click(details)
    expect(details).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Account balance')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Exclude from net worth' }),
    ).not.toBeInTheDocument()
  })
})
