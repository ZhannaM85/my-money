import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppUpdateBanner } from './AppUpdateBanner'

function stubUpdateFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: 'some-newer-sha' }),
    }),
  )
}

function stubServiceWorker(value: unknown) {
  Object.defineProperty(window.navigator, 'serviceWorker', {
    value,
    configurable: true,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  // @ts-expect-error test cleanup
  delete window.navigator.serviceWorker
})

describe('AppUpdateBanner', () => {
  it('renders nothing when the deployed version matches the running one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: __APP_VERSION__ }),
      }),
    )

    const { container } = render(<AppUpdateBanner />)

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the version check fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const { container } = render(<AppUpdateBanner />)

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the banner once a different deployed version is detected', async () => {
    stubUpdateFetch()

    render(<AppUpdateBanner />)

    expect(
      await screen.findByText('A new version is available.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it('unregisters service workers and reloads when Reload is clicked', async () => {
    stubUpdateFetch()
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload })
    const unregister = vi.fn().mockResolvedValue(true)
    stubServiceWorker({
      getRegistrations: vi.fn().mockResolvedValue([{ unregister }]),
    })
    vi.stubGlobal('caches', {
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn(),
    })

    const user = userEvent.setup()
    render(<AppUpdateBanner />)
    await user.click(await screen.findByRole('button', { name: 'Reload' }))

    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1))
    expect(unregister).toHaveBeenCalledTimes(1)
  })

  it('shows reloading state after Reload is clicked', async () => {
    stubUpdateFetch()
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() })
    let resolveUnregister: () => void = () => {}
    stubServiceWorker({
      getRegistrations: vi.fn().mockResolvedValue([
        {
          unregister: vi.fn(
            () =>
              new Promise<void>((resolve) => {
                resolveUnregister = resolve
              }),
          ),
        },
      ]),
    })
    vi.stubGlobal('caches', {
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn(),
    })

    const user = userEvent.setup()
    render(<AppUpdateBanner />)
    await user.click(await screen.findByRole('button', { name: 'Reload' }))

    expect(
      screen.queryByRole('button', { name: 'Reload' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Reloading…')).toBeInTheDocument()

    resolveUnregister()
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled())
  })
})
