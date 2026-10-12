import 'fake-indexeddb/auto'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/infrastructure/persistence/indexeddb'
import { useAssetStore } from '@/stores/assetStore'
import { AssetNameEditor } from './AssetNameEditor'
import {
  renderAssetDetails,
  resetAssetDetailsStores,
  seedRevolutAsset,
} from './assetDetailsTestSetup'

beforeEach(async () => {
  await resetAssetDetailsStores()
  await seedRevolutAsset()
})

describe('asset renaming (#311)', () => {
  it('prefills and trims the name, persists it, and preserves other fields and snapshots', async () => {
    const user = userEvent.setup()
    const original = useAssetStore.getState().assets[0]
    const snapshots = await db.snapshots.toArray()
    renderAssetDetails()
    await user.click(await screen.findByRole('button', { name: 'Rename asset' }))
    const input = screen.getByRole('textbox', { name: 'Name' })
    expect(input).toHaveValue('Revolut')
    expect(input).toHaveFocus()
    await user.clear(input)
    await user.type(input, '   ')
    expect(screen.getByRole('button', { name: 'Save name' })).toBeDisabled()
    await user.clear(input)
    await user.type(input, '  Holiday fund  ')
    await user.click(screen.getByRole('button', { name: 'Save name' }))
    await screen.findByRole('heading', { name: 'Holiday fund' })
    const persisted = await db.assets.get('a1')
    expect(persisted).toEqual({ ...original, name: 'Holiday fund', updatedAt: expect.any(String) })
    expect(await db.snapshots.toArray()).toEqual(snapshots)
    await useAssetStore.getState().load()
    expect(useAssetStore.getState().assets[0].name).toBe('Holiday fund')
    expect(screen.getByRole('button', { name: 'Rename asset' })).toHaveFocus()
  })

  it('keeps the draft when the modal is dismissed and discards only after confirmation', async () => {
    const user = userEvent.setup()
    renderAssetDetails()
    await user.click(await screen.findByRole('button', { name: 'Rename asset' }))
    const input = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(input)
    await user.type(input, 'Draft name')
    await user.click(screen.getByRole('button', { name: 'Cancel renaming' }))
    const modal = await screen.findByRole('dialog', { name: 'Discard the name changes?' })
    await user.click(within(modal).getByRole('button', { name: 'Keep editing' }))
    expect(input).toHaveValue('Draft name')
    expect((await db.assets.get('a1'))?.name).toBe('Revolut')
    await user.click(screen.getByRole('button', { name: 'Cancel renaming' }))
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('Draft name')
    await user.click(screen.getByRole('button', { name: 'Cancel renaming' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Discard changes' }))
    await screen.findByRole('heading', { name: 'Revolut' })
    expect((await db.assets.get('a1'))?.name).toBe('Revolut')
    await user.click(screen.getByRole('button', { name: 'Rename asset' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Revolut')
  })

  it('retains a failed draft and allows retrying with Enter', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockRejectedValueOnce(new Error('Storage failed')).mockResolvedValueOnce(undefined)
    render(<AssetNameEditor name="Revolut" description="Bank account · EUR" onSave={onSave} />)
    await user.click(screen.getByRole('button', { name: 'Rename asset' }))
    const input = screen.getByRole('textbox', { name: 'Name' })
    await user.clear(input)
    await user.type(input, 'Holiday fund{Enter}')
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save the name')
    expect(input).toHaveValue('Holiday fund')
    expect(screen.getByRole('button', { name: 'Save name' })).toBeEnabled()
    await user.type(input, '{Enter}')
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument())
  })
})
