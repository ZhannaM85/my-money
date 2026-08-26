import { render, screen } from '@testing-library/react'
import { type ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { usePinchZoom } from './usePinchZoom'

function PinchHost({
  onZoomIn,
  onZoomOut,
  onPinchStart,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onPinchStart?: () => void
}): ReactElement {
  const ref = usePinchZoom(onZoomIn, onZoomOut, onPinchStart)
  return <div ref={ref} data-testid="pinch-target" />
}

function fakeTouch(id: number, x: number, target: EventTarget): Touch {
  return {
    identifier: id,
    clientX: x,
    clientY: 0,
    target,
  } as Touch
}

function dispatchPinch(
  target: HTMLElement,
  type: 'touchstart' | 'touchmove',
  x1: number,
  x2: number,
): void {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', {
    value: [fakeTouch(1, x1, target), fakeTouch(2, x2, target)],
  })
  target.dispatchEvent(event)
}

describe('usePinchZoom', () => {
  it('zooms in when fingers spread and out when they pinch', () => {
    const onZoomIn = vi.fn()
    const onZoomOut = vi.fn()
    render(<PinchHost onZoomIn={onZoomIn} onZoomOut={onZoomOut} />)
    const target = screen.getByTestId('pinch-target')

    dispatchPinch(target, 'touchstart', 100, 160)
    dispatchPinch(target, 'touchmove', 40, 240)

    expect(onZoomIn).toHaveBeenCalledTimes(1)
    expect(onZoomOut).not.toHaveBeenCalled()

    dispatchPinch(target, 'touchstart', 40, 240)
    dispatchPinch(target, 'touchmove', 100, 160)

    expect(onZoomOut).toHaveBeenCalledTimes(1)
    expect(onZoomIn).toHaveBeenCalledTimes(1)
  })

  it('notifies onPinchStart when a second finger lands (#116)', () => {
    const onPinchStart = vi.fn()
    render(
      <PinchHost
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onPinchStart={onPinchStart}
      />,
    )
    const target = screen.getByTestId('pinch-target')
    dispatchPinch(target, 'touchstart', 100, 160)
    expect(onPinchStart).toHaveBeenCalledTimes(1)
  })
})
