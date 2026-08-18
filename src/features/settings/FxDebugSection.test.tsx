import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    render(<FxDebugSection />)

    await user.click(screen.getByRole('button', { name: 'Turn on FX debug' }))
    fxDebug('ensureRange done', { quoteCount: 3 })

    expect(await screen.findByText(/ensureRange done/)).toBeInTheDocument()
  })
})
