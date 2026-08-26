import { describe, expect, it } from 'vitest'

/**
 * Every `<NetWorthChart` JSX usage must wire pinch zoom (#54 / #114 / #116).
 * Props are required on the component; this catches accidental omit in screens.
 */
const screenSources = import.meta.glob(['../**/*Screen.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

describe('NetWorthChart pinch wiring (#116)', () => {
  it('requires onZoomIn and onZoomOut on every screen that mounts NetWorthChart', () => {
    const missing: string[] = []
    for (const [path, source] of Object.entries(screenSources)) {
      if (!source.includes('<NetWorthChart')) continue
      if (!source.includes('onZoomIn=') || !source.includes('onZoomOut=')) {
        missing.push(path)
      }
    }
    expect(missing).toEqual([])
  })
})
