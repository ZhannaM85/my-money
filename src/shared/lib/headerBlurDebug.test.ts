import { describe, expect, it } from 'vitest'
import {
  applyHeaderDebugTweak,
  collectHeaderBlurReport,
  resetHeaderDebugTweaks,
} from './headerBlurDebug'

describe('header blur debug (#321)', () => {
  it('reports the title box and walks ancestors', () => {
    document.body.innerHTML =
      '<header><div><span data-app-title>My Money</span></div></header>'
    const report = collectHeaderBlurReport(document, window)
    expect(report).toContain('title: top')
    expect(report).toContain('safeAreaTop:')
    expect(report).toContain('0 title')
    expect(report).toContain('1 div')
  })

  it('hides the header button and restores it', () => {
    document.body.innerHTML =
      '<button data-testid="scroll-to-top"></button><span data-app-title>My Money</span>'
    applyHeaderDebugTweak(document, 'hide-button', true)
    expect(
      document.querySelector<HTMLElement>('[data-testid="scroll-to-top"]')
        ?.style.display,
    ).toBe('none')
    resetHeaderDebugTweaks(document)
    expect(
      document.querySelector<HTMLElement>('[data-testid="scroll-to-top"]')
        ?.style.display,
    ).toBe('')
  })
})
