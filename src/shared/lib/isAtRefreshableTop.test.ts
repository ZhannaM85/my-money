import { afterEach, describe, expect, it } from 'vitest'
import { isAtRefreshableTop } from './isAtRefreshableTop'

function scrollable(
  overflowY: string,
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
) {
  const el = document.createElement('div')
  el.style.overflowY = overflowY
  Object.defineProperty(el, 'scrollTop', { value: scrollTop, writable: true })
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight })
  Object.defineProperty(el, 'clientHeight', { value: clientHeight })
  return el
}

describe('isAtRefreshableTop', () => {
  afterEach(() => {
    document.body.replaceChildren()
    window.scrollTo(0, 0)
  })

  it('is true at the real page top (#39)', () => {
    const main = scrollable('auto', 0, 400, 400)
    main.id = 'main-content'
    const child = document.createElement('p')
    main.append(child)
    document.body.append(main)
    expect(isAtRefreshableTop(child)).toBe(true)
  })

  it('is false when an inner scroller has moved (#203)', () => {
    const main = scrollable('auto', 0, 400, 400)
    main.id = 'main-content'
    const inner = scrollable('auto', 80, 800, 400)
    const child = document.createElement('p')
    inner.append(child)
    main.append(inner)
    document.body.append(main)
    expect(isAtRefreshableTop(child)).toBe(false)
  })

  it('is false when main itself has scrolled', () => {
    const main = scrollable('auto', 40, 800, 400)
    main.id = 'main-content'
    const child = document.createElement('p')
    main.append(child)
    document.body.append(main)
    expect(isAtRefreshableTop(child)).toBe(false)
  })
})
