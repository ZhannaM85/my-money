import 'fake-indexeddb/auto'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  renderAssetDetails,
  resetAssetDetailsStores,
  seedRevolutAsset,
} from './assetDetailsTestSetup'

beforeEach(async () => {
  await resetAssetDetailsStores()
  await seedRevolutAsset()
})

describe('AssetDetailsScreen', () => {
  it('shows native history and overall change', async () => {
    renderAssetDetails()
    expect(
      await screen.findByRole('heading', { name: 'Revolut' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Bank account · EUR')).toBeInTheDocument()
    expect(
      screen.getAllByText(formatAmount(1000, 'EUR')).length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('2026-08-01')).toBeInTheDocument()
    expect(screen.getByText(/Since first snapshot/)).toBeInTheDocument()
  })

  it('includes the institution in the sub-header when it is set (#102)', async () => {
    const existing = useAssetStore.getState().assets[0]
    expect(existing).toBeDefined()
    await useAssetStore.getState().saveAsset({
      ...existing!,
      institution: 'Sber',
    })
    renderAssetDetails()
    expect(
      await screen.findByText('Bank account · Sber · EUR'),
    ).toBeInTheDocument()
  })

  it('zooms the asset chart range with buttons and pinch handlers (#114)', async () => {
    const user = userEvent.setup()
    await useAssetStore.getState().saveSnapshots([
      {
        assetId: 'a1',
        date: '2025-01-15',
        amount: 100,
        currency: 'EUR',
      },
    ])
    renderAssetDetails()
    expect(await screen.findByText(/Chart range: All/)).toBeInTheDocument()
    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(screen.getByText(/Chart range: Year/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(screen.getByText(/Chart range: Month/)).toBeInTheDocument()
  })

  it('explains the two amount fields with tappable info hints', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(
      screen.getByRole('button', { name: 'About Update this asset' }),
    )
    expect(
      screen.getByText(
        'Saves a new snapshot for the chosen date (defaults to today). It does not change older history rows.',
      ),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Details$/ }))
    await user.click(screen.getByRole('button', { name: 'Edit details' }))
    await user.click(
      screen.getByRole('button', { name: 'About New amount (optional)' }),
    )
    expect(
      screen.getByText(
        'Optional. If you enter an amount, Save details also writes a snapshot for the As of date (defaults to today). Leave empty to change name and settings only.',
      ),
    ).toBeInTheDocument()
  })

  it('puts Update this asset and collapsed Details above the chart (#231)', async () => {
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    const update = screen.getByRole('heading', { name: 'Update this asset' })
    const details = screen.getByRole('button', { name: /^Details$/ })
    const chartRange = await screen.findByText(/Chart range:/)
    expect(details).toHaveAttribute('aria-expanded', 'false')
    expect(
      update.compareDocumentPosition(details) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(
      details.compareDocumentPosition(chartRange) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('keeps tracking and delete actions in the Details overflow (#244)', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(
      screen.queryByRole('button', { name: 'Exclude from net worth' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Hide asset' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete asset' }),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Actions for Revolut' }),
    )
    expect(
      screen.getByRole('menuitem', { name: 'Exclude from net worth' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Hide asset' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Delete asset' }),
    ).toBeInTheDocument()
  })

  it('persists native/base chips to the settings display mode (#243)', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    const native = screen.getByRole('button', { name: 'Native' })
    const base = screen.getByRole('button', { name: 'EUR' })
    expect(native).toHaveAttribute('aria-pressed', 'false')
    expect(base).toHaveAttribute('aria-pressed', 'true')
    await user.click(native)
    await waitFor(() => {
      expect(useSettingsStore.getState().settings.currencyDisplayMode).toBe(
        'native',
      )
    })
    expect(native).toHaveAttribute('aria-pressed', 'true')
    expect(base).toHaveAttribute('aria-pressed', 'false')
  })

  it('excludes and re-includes an asset from net worth', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(
      screen.getByRole('button', { name: 'Actions for Revolut' }),
    )
    await user.click(
      screen.getByRole('menuitem', { name: 'Exclude from net worth' }),
    )
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('excluded')
    })
    expect(screen.getByText('Not counted in net worth')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Actions for Revolut' }),
    )
    await user.click(
      screen.getByRole('menuitem', { name: 'Include in net worth' }),
    )
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('included')
    })
  })

  it('hides and restores an asset', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(
      screen.getByRole('button', { name: 'Actions for Revolut' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Hide asset' }))
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('archived')
    })
  })

  it('deletes an asset and its snapshots after confirmation', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(
      screen.getByRole('button', { name: 'Actions for Revolut' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Delete asset' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(
      'Delete this asset and all its history from this device? This cannot be undone.',
    )
    await user.click(within(dialog).getByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(useAssetStore.getState().assets).toHaveLength(0)
      expect(useAssetStore.getState().snapshots).toHaveLength(0)
    })
  })
})
