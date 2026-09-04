import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollAppToTop } from './scrollAppToTop'

describe('scrollAppToTop', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('resets window, #main-content, and nested overflow scrollers (#215)', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    const main = document.createElement('main')
    main.id = 'main-content'
    Object.defineProperty(main, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 120,
    })
    document.body.append(main)

    const inner = document.createElement('div')
    Object.defineProperty(inner, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 80,
    })
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      if (el === inner) {
        return { overflowY: 'auto' } as CSSStyleDeclaration
      }
      return { overflowY: 'visible' } as CSSStyleDeclaration
    })
    main.append(inner)

    scrollAppToTop()

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    expect(main.scrollTop).toBe(0)
    expect(inner.scrollTop).toBe(0)
  })
})
