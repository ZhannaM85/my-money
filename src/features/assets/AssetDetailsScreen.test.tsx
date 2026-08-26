import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { db } from '@/infrastructure/persistence/indexeddb'
import { addDaysIso } from '@/shared/lib/dates'
import { formatAmount, todayIsoDate } from '@/shared/lib/money'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { AssetDetailsScreen } from './AssetDetailsScreen'

function setDateField(input: HTMLElement, value: string) {
  input.focus()
  Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const now = '2026-08-17T00:00:00.000Z'

beforeEach(async () => {
  await db.assets.clear()
  await db.snapshots.clear()
  useAssetStore.setState({ assets: [], snapshots: [], loaded: false })
  useSettingsStore.setState({
    settings: DEFAULT_SETTINGS,
    loaded: true,
  })
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
      amount: 800,
      currency: 'EUR',
    },
  )
  await useAssetStore.getState().saveSnapshots([
    {
      assetId: 'a1',
      date: '2026-08-17',
      amount: 1000,
      currency: 'EUR',
    },
  ])
})

describe('AssetDetailsScreen', () => {
  it('shows native history and overall change', async () => {
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
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
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
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
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(await screen.findByText(/Chart range: All/)).toBeInTheDocument()
    expect(screen.getByTestId('net-worth-chart')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(screen.getByText(/Chart range: 1Y/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(screen.getByText(/Chart range: 6M/)).toBeInTheDocument()
  })

  it('opens existing assets in a read-only details view', async () => {
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(
      screen.queryByRole('button', { name: 'Save details' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit details' })).toBeInTheDocument()
    expect(screen.getByText('Account balance')).toBeInTheDocument()
  })

  it('explains the two amount fields with tappable info hints', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(
      screen.getByRole('button', { name: 'About Update this asset' }),
    )
    expect(
      screen.getByText(
        'Saves a new snapshot for the chosen date (defaults to today). It does not change older history rows.',
      ),
    ).toBeInTheDocument()
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

  it('appends a snapshot from the update field', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
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
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(screen.getByLabelText('New amount')).toHaveClass('min-w-0')
    expect(screen.getByRole('button', { name: /^Save$/ })).toHaveClass('w-full')
  })

  it('adds a past-dated snapshot from Update this asset', async () => {
    const user = userEvent.setup()
    const past = addDaysIso(todayIsoDate(), -20)
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
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
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
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
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
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

  it('adds a past-dated snapshot from Save details', async () => {
    const user = userEvent.setup()
    const past = '2026-01-01'
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    expect(
      screen.queryByRole('button', { name: 'Save details' }),
    ).not.toBeInTheDocument()
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

  it('excludes and re-includes an asset from net worth', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(
      screen.getByRole('button', { name: 'Exclude from net worth' }),
    )
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('excluded')
    })
    expect(screen.getByText('Not counted in net worth')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Include in net worth' }),
    )
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('included')
    })
  })

  it('hides and restores an asset', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(screen.getByRole('button', { name: 'Hide asset' }))
    await waitFor(() => {
      expect(useAssetStore.getState().assets[0].trackingStatus).toBe('archived')
    })
  })

  it('deletes one history snapshot after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
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
      useAssetStore.getState().snapshots.some((row) => row.date === '2026-08-01'),
    ).toBe(false)
  })

  it('edits an existing snapshot without adding a new row', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
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
    await user.click(screen.getAllByRole('button', { name: 'Save' })[0])
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
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    const originalId = useAssetStore
      .getState()
      .snapshots.find((row) => row.date === '2026-08-01')?.id
    await user.click(
      screen.getByRole('button', { name: 'Edit snapshot from 2026-08-01' }),
    )
    await user.selectOptions(screen.getByLabelText('Currency'), 'RUB')
    await user.click(screen.getAllByRole('button', { name: 'Save' })[0])
    await waitFor(() => {
      expect(
        useAssetStore.getState().snapshots.find((row) => row.id === originalId)
          ?.currency,
      ).toBe('RUB')
    })
  })

  it('deletes an asset and its snapshots after confirmation', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <MemoryRouter initialEntries={['/assets/a1']}>
        <Routes>
          <Route path="/assets/:id" element={<AssetDetailsScreen />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findByRole('heading', { name: 'Revolut' })
    await user.click(screen.getByRole('button', { name: 'Delete asset' }))
    await waitFor(() => {
      expect(useAssetStore.getState().assets).toHaveLength(0)
      expect(useAssetStore.getState().snapshots).toHaveLength(0)
    })
  })
})
