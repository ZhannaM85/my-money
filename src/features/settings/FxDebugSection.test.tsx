import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearFxDebugLog,
  fxDebug,
  setFxDebugEnabled,
} from '@/infrastructure/fx/fxDebug'
import { FxDebugSection } from './FxDebugSection'

beforeEach(() => {
  localStorage.clear()
  clearFxDebugLog()
  setFxDebugEnabled(false)
  vi.restoreAllMocks()
})

describe('FxDebugSection', () => {
  it('enables debug and shows recorded events on screen', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    render(
      <MemoryRouter>
        <FxDebugSection />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Turn on FX debug' }))
    fxDebug('ensureRange done', { quoteCount: 3 })

    expect(await screen.findByText(/ensureRange done/)).toBeInTheDocument()
  })

  it('saves the log as a .txt file (#161)', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      ...navigator,
      share,
      canShare: () => true,
    })
    render(
      <MemoryRouter>
        <FxDebugSection />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Save .txt' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Turn on FX debug' }))
    fxDebug('ensureRange done', { quoteCount: 3 })
    const save = await screen.findByRole('button', { name: 'Save .txt' })
    expect(save).toBeEnabled()
    await user.click(save)
    expect(share).toHaveBeenCalled()
    expect(await screen.findByText('Share sheet opened.')).toBeInTheDocument()
  })
})
