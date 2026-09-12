import 'fake-indexeddb/auto'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { formatAmount } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useFxStore } from '@/stores/fxStore'
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

describe('AssetSnapshotList', () => {
  it('deletes one history snapshot after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(
      screen.getByRole('button', { name: 'Delete snapshot from 2026-08-01' }),
    )
    await waitFor(() => {
      expect(
        useAssetStore
          .getState()
          .snapshots.filter((row) => row.assetId === 'a1'),
      ).toHaveLength(1)
    })
    expect(useAssetStore.getState().assets).toHaveLength(1)
    expect(
      useAssetStore
        .getState()
        .snapshots.some((row) => row.date === '2026-08-01'),
    ).toBe(false)
  })

  it('edits an existing snapshot without adding a new row', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    const before = useAssetStore
      .getState()
      .snapshots.filter((row) => row.assetId === 'a1')
    const originalId = before.find((row) => row.date === '2026-08-01')?.id
    await user.click(
      screen.getByRole('button', { name: 'Edit snapshot from 2026-08-01' }),
    )
    const amountInput = screen.getByLabelText('Snapshot amount')
    await user.clear(amountInput)
    await user.type(amountInput, '900')
    const snapshotEditor = screen
      .getByRole('button', { name: 'Cancel' })
      .closest('li')
    expect(snapshotEditor).toBeTruthy()
    await user.click(
      within(snapshotEditor!).getByRole('button', { name: 'Save' }),
    )
    await waitFor(() => {
      const rows = useAssetStore
        .getState()
        .snapshots.filter((row) => row.assetId === 'a1')
      expect(rows).toHaveLength(before.length)
      expect(rows.find((row) => row.id === originalId)?.amount).toBe(900)
    })
  })

  it('lets the user change currency when editing a snapshot', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    const originalId = useAssetStore
      .getState()
      .snapshots.find((row) => row.date === '2026-08-01')?.id
    await user.click(
      screen.getByRole('button', { name: 'Edit snapshot from 2026-08-01' }),
    )
    await user.selectOptions(screen.getByLabelText('Currency'), 'RUB')
    const snapshotEditor = screen
      .getByRole('button', { name: 'Cancel' })
      .closest('li')
    expect(snapshotEditor).toBeTruthy()
    await user.click(
      within(snapshotEditor!).getByRole('button', { name: 'Save' }),
    )
    await waitFor(() => {
      expect(
        useAssetStore.getState().snapshots.find((row) => row.id === originalId)
          ?.currency,
      ).toBe('RUB')
    })
  })

  it('shows muted native amount under converted history rows (#129)', async () => {
    await useSettingsStore.getState().setBaseCurrency('RUB')
    useFxStore.setState({
      ...useFxStore.getState(),
      quotes: [
        { date: '2026-08-17', base: 'EUR', quote: 'RUB', rate: 100 },
        { date: '2026-08-01', base: 'EUR', quote: 'RUB', rate: 100 },
      ],
    })
    renderAssetDetails()
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(
      await screen.findByRole('button', { name: 'RUB' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(
        (_, node) =>
          node?.children.length === 0 &&
          node.textContent === formatAmount(100_000, 'RUB'),
      ).length,
    ).toBeGreaterThan(0)
    const native = screen.getByText(
      (_, node) =>
        node?.children.length === 0 &&
        node.textContent === formatAmount(1000, 'EUR') &&
        node.className.includes('text-muted-foreground'),
    )
    expect(native).toBeInTheDocument()
  })
})
