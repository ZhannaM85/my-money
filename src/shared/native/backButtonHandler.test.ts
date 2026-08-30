import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { router } from '@/app/router'

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(() => Promise.resolve({ remove: vi.fn() })),
    exitApp: vi.fn(() => Promise.resolve()),
  },
}))

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: vi.fn(() => 'web') },
}))

vi.mock('@/app/router', () => ({
  router: { navigate: vi.fn() },
}))

const { initBackButtonHandler } = await import('./backButtonHandler')

function listener() {
  const calls = vi.mocked(App.addListener).mock.calls
  const last = calls.at(-1)
  return last?.[1] as (event: { canGoBack: boolean }) => void
}

afterEach(() => {
  vi.mocked(Capacitor.getPlatform).mockReturnValue('web')
  vi.mocked(App.addListener).mockClear()
  vi.mocked(App.exitApp).mockClear()
  vi.mocked(router.navigate).mockClear()
})

describe('initBackButtonHandler (#165)', () => {
  it('does not listen on web', () => {
    initBackButtonHandler()
    expect(App.addListener).not.toHaveBeenCalled()
  })

  it('exits from Dashboard when there is no history', () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
    initBackButtonHandler()
    listener()({ canGoBack: false })
    expect(App.exitApp).toHaveBeenCalled()
  })

  it('goes to Dashboard from another tab instead of exiting', () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
    const original = window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: '/settings' },
      configurable: true,
    })
    initBackButtonHandler()
    listener()({ canGoBack: false })
    expect(router.navigate).toHaveBeenCalledWith('/')
    expect(App.exitApp).not.toHaveBeenCalled()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname: original },
      configurable: true,
    })
  })
})
