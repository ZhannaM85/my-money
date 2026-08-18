import { describe, expect, it } from 'vitest'
import { pinchZoomDirection, touchDistance } from './pinchZoom'

describe('pinchZoom', () => {
  it('measures the distance between two touches', () => {
    expect(touchDistance({ clientX: 0, clientY: 0 }, { clientX: 3, clientY: 4 })).toBe(
      5,
    )
  })

  it('treats spreading fingers as zoom in and pinching as zoom out', () => {
    expect(pinchZoomDirection(100, 120)).toBe('in')
    expect(pinchZoomDirection(100, 80)).toBe('out')
    expect(pinchZoomDirection(100, 105)).toBeNull()
  })
})
