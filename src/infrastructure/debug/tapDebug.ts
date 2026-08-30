import { fxDebug } from '@/infrastructure/fx/fxDebug'

function labelOf(el: EventTarget | null): string {
  if (!(el instanceof HTMLElement)) return String(el)
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 48)
  return [
    el.tagName.toLowerCase(),
    el.getAttribute('role'),
    el.getAttribute('aria-label'),
    el.getAttribute('data-swipe-open')
      ? `swipe-open=${el.getAttribute('data-swipe-open')}`
      : '',
    text,
  ]
    .filter((bit) => bit && bit.length > 0)
    .join('|')
}

/** Allocation Hide/Show taps (#157). Reuses Settings FX debug so the phone can copy. */
export function tapDebug(
  where: string,
  event: {
    type: string
    pointerType?: string
    clientX?: number
    clientY?: number
    target: EventTarget | null
    currentTarget: EventTarget | null
  },
  extra?: Record<string, unknown>,
): void {
  fxDebug(`tap:${where}`, {
    type: event.type,
    pointerType: event.pointerType,
    x: Math.round(event.clientX ?? 0),
    y: Math.round(event.clientY ?? 0),
    target: labelOf(event.target),
    current: labelOf(event.currentTarget),
    ...extra,
  })
}
