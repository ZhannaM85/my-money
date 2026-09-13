import 'fake-indexeddb/auto'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { BackupSection } from './BackupSection'

const now = '2026-08-17T00:00:00.000Z'

const asset = {
  id: 'a1',
  name: 'Revolut',
  assetClass: 'money' as const,
  type: 'bank' as const,
  currency: 'EUR',
  trackingStatus: 'included' as const,
  valuationMethod: 'account_balance' as const,
  updateFrequency: 'weekly' as const,
  createdAt: now,
  updatedAt: now,
}

const validBackup = JSON.stringify({
  version: 2,
  exportedAt: now,
  settings: DEFAULT_SETTINGS,
  assets: [
    {
      ...asset,
      id: 'imported',
      name: 'Imported',
    },
  ],
  snapshots: [],
  fxRates: [],
  manualFxRates: [],
})

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  await db.settings.clear()
  await db.fxRates.clear()
  await db.manualFxRates.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: true })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('BackupSection', () => {
  it('keeps Import JSON enabled when the book has assets (#198)', async () => {
    await db.assets.put(asset)
    useAssetStore.setState({ assets: [asset], snapshots: [], loaded: true })
    render(<BackupSection />)
    expect(screen.getByRole('button', { name: 'Import JSON' })).toBeEnabled()
    expect(
      screen.getByText(
        'If this book already has assets, import asks before replacing them. It does not merge.',
      ),
    ).toBeInTheDocument()
  })

  it('does not replace when confirm is cancelled (#198)', async () => {
    const user = userEvent.setup()
    await db.assets.put(asset)
    render(<BackupSection />)
    const input = screen.getByLabelText('Import JSON backup')
    const file = new File([validBackup], 'backup.json', {
      type: 'application/json',
    })
    await user.upload(input, file)
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(
      'This replaces every asset and snapshot on this device with the file.',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(await db.assets.toArray()).toEqual([asset])
    expect(screen.queryByText('Backup restored.')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('replaces after confirm (#198)', async () => {
    const user = userEvent.setup()
    await db.assets.put(asset)
    render(<BackupSection />)
    const input = screen.getByLabelText('Import JSON backup')
    const file = new File([validBackup], 'backup.json', {
      type: 'application/json',
    })
    await user.upload(input, file)
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(screen.getByText('Backup restored.')).toBeInTheDocument()
    })
    const assets = await db.assets.toArray()
    expect(assets).toHaveLength(1)
    expect(assets[0]?.id).toBe('imported')
  })

  it('imports into an empty book without confirm (#198)', async () => {
    const user = userEvent.setup()
    render(<BackupSection />)
    const input = screen.getByLabelText('Import JSON backup')
    const file = new File([validBackup], 'backup.json', {
      type: 'application/json',
    })
    await user.upload(input, file)
    await waitFor(() => {
      expect(screen.getByText('Backup restored.')).toBeInTheDocument()
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows invalid file without asking to replace (#198)', async () => {
    const user = userEvent.setup()
    await db.assets.put(asset)
    render(<BackupSection />)
    const input = screen.getByLabelText('Import JSON backup')
    const file = new File(['not-json'], 'backup.json', {
      type: 'application/json',
    })
    await user.upload(input, file)
    await waitFor(() => {
      expect(
        screen.getByText('This file is not a valid My Money backup.'),
      ).toBeInTheDocument()
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await db.assets.toArray()).toEqual([asset])
  })

  it('shows Delete all data and leaves the book when confirm is cancelled (#197)', async () => {
    const user = userEvent.setup()
    await db.assets.put(asset)
    await db.snapshots.put({
      id: 's1',
      assetId: 'a1',
      date: '2026-08-17',
      amount: 1000,
      currency: 'EUR',
      createdAt: now,
    })
    render(<BackupSection />)
    await user.click(screen.getByRole('button', { name: 'Delete all data' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(
      'This removes every asset, snapshot, and FX rate on this device.',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(await db.assets.toArray()).toEqual([asset])
    expect(await db.snapshots.count()).toBe(1)
    expect(
      screen.queryByText('All data on this device was deleted.'),
    ).not.toBeInTheDocument()
  })

  it('wipes assets and snapshots after confirm (#197)', async () => {
    const user = userEvent.setup()
    await db.assets.put(asset)
    await db.snapshots.put({
      id: 's1',
      assetId: 'a1',
      date: '2026-08-17',
      amount: 1000,
      currency: 'EUR',
      createdAt: now,
    })
    render(<BackupSection />)
    await user.click(screen.getByRole('button', { name: 'Delete all data' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'OK' }))
    await waitFor(() => {
      expect(
        screen.getByText('All data on this device was deleted.'),
      ).toBeInTheDocument()
    })
    expect(await db.assets.count()).toBe(0)
    expect(await db.snapshots.count()).toBe(0)
    expect(screen.getByRole('button', { name: 'Import JSON' })).toBeEnabled()
  })
})
