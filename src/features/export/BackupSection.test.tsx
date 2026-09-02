import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
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
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    await db.assets.put(asset)
    render(<BackupSection />)
    const input = screen.getByLabelText('Import JSON backup')
    const file = new File([validBackup], 'backup.json', {
      type: 'application/json',
    })
    await user.upload(input, file)
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled()
    })
    expect(await db.assets.toArray()).toEqual([asset])
    expect(screen.queryByText('Backup restored.')).not.toBeInTheDocument()
  })

  it('replaces after confirm (#198)', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await db.assets.put(asset)
    render(<BackupSection />)
    const input = screen.getByLabelText('Import JSON backup')
    const file = new File([validBackup], 'backup.json', {
      type: 'application/json',
    })
    await user.upload(input, file)
    await waitFor(() => {
      expect(screen.getByText('Backup restored.')).toBeInTheDocument()
    })
    expect(window.confirm).toHaveBeenCalled()
    const assets = await db.assets.toArray()
    expect(assets).toHaveLength(1)
    expect(assets[0]?.id).toBe('imported')
  })

  it('imports into an empty book without confirm (#198)', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm')
    render(<BackupSection />)
    const input = screen.getByLabelText('Import JSON backup')
    const file = new File([validBackup], 'backup.json', {
      type: 'application/json',
    })
    await user.upload(input, file)
    await waitFor(() => {
      expect(screen.getByText('Backup restored.')).toBeInTheDocument()
    })
    expect(confirm).not.toHaveBeenCalled()
  })

  it('shows invalid file without asking to replace (#198)', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm')
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
    expect(confirm).not.toHaveBeenCalled()
    expect(await db.assets.toArray()).toEqual([asset])
  })
})
