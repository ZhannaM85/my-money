/** Live facts for the iPhone header-title blur (#321). */

const TITLE = '[data-app-title]'
const BUTTON = '[data-testid="scroll-to-top"]'

const LAYER_PROPS = [
  'transform',
  'filter',
  'opacity',
  'will-change',
  'position',
  'z-index',
  'overflow',
  'overflow-x',
  'overflow-y',
  'backdrop-filter',
  '-webkit-backdrop-filter',
  '-webkit-font-smoothing',
  'mix-blend-mode',
  'perspective',
  'contain',
] as const

const QUIET = new Set([
  'none',
  'auto',
  '1',
  'static',
  'visible',
  'normal',
])

export type HeaderDebugTweak =
  | 'hide-button'
  | 'smoothing-auto'
  | 'weight-700'
  | 'clear-z'
  | 'pad-48'
  | 'solid-title'

export function collectHeaderBlurReport(
  doc: Document = document,
  win: Window = window,
): string {
  const nav = win.navigator as Navigator & { standalone?: boolean }
  const visual = win.visualViewport
  const safeAreaTop = readSafeAreaTop(doc)
  const title = doc.querySelector<HTMLElement>(TITLE)
  const box = title?.getBoundingClientRect()
  const titleStyle = title ? win.getComputedStyle(title) : null
  const lines = [
    `standalone: ${nav.standalone === true}`,
    `displayMode: ${
      typeof win.matchMedia === 'function' &&
      win.matchMedia('(display-mode: standalone)').matches
        ? 'standalone'
        : 'browser'
    }`,
    `dpr: ${win.devicePixelRatio || 1}`,
    `screen: ${win.screen.width}x${win.screen.height}`,
    `inner: ${win.innerWidth}x${win.innerHeight}`,
    `visual: ${visual ? `${Math.round(visual.width)}x${Math.round(visual.height)} offset ${Math.round(visual.offsetTop)}` : 'none'}`,
    `uncoveredY: ${win.screen.height - win.innerHeight}`,
    `safeAreaTop: ${safeAreaTop}`,
    title && box
      ? `title: top ${Math.round(box.top)} height ${Math.round(box.height)} font ${titleStyle?.fontSize} ${titleStyle?.fontWeight} ${titleStyle?.fontFamily}`
      : 'title: missing',
  ]
  if (title) {
    let node: HTMLElement | null = title
    let depth = 0
    while (node && depth < 8) {
      const style = win.getComputedStyle(node)
      const flags = LAYER_PROPS.flatMap((prop) => {
        const value = style.getPropertyValue(prop).trim()
        if (!value || QUIET.has(value)) return []
        return [`${prop}=${value}`]
      })
      const name = node.hasAttribute('data-app-title')
        ? 'title'
        : node.id
          ? `#${node.id}`
          : node.tagName.toLowerCase()
      lines.push(`${depth} ${name}${flags.length ? ` ${flags.join(' ')}` : ''}`)
      node = node.parentElement
      depth += 1
    }
  }
  return lines.join('\n')
}

export function readSafeAreaTop(doc: Document): number {
  const probe = doc.createElement('div')
  probe.style.paddingTop = 'env(safe-area-inset-top)'
  doc.documentElement.appendChild(probe)
  const top = Number.parseFloat(getComputedStyle(probe).paddingTop)
  probe.remove()
  return Number.isFinite(top) ? top : 0
}

export function applyHeaderDebugTweak(
  doc: Document,
  tweak: HeaderDebugTweak,
  on: boolean,
): void {
  const title = doc.querySelector<HTMLElement>(TITLE)
  const row = title?.parentElement ?? null
  const button = doc.querySelector<HTMLElement>(BUTTON)
  if (tweak === 'hide-button' && button) {
    button.style.display = on ? 'none' : ''
  }
  if (tweak === 'smoothing-auto' && title) {
    title.style.setProperty('-webkit-font-smoothing', on ? 'auto' : '')
  }
  if (tweak === 'weight-700' && title) {
    title.style.fontWeight = on ? '700' : ''
  }
  if (tweak === 'clear-z' && row) {
    row.style.zIndex = on ? 'auto' : ''
  }
  if (tweak === 'pad-48' && row) {
    row.style.paddingTop = on ? 'calc(env(safe-area-inset-top) + 3rem)' : ''
  }
  if (tweak === 'solid-title' && title) {
    title.style.backgroundColor = on ? 'Canvas' : ''
    title.style.position = on ? 'relative' : ''
  }
}

export function resetHeaderDebugTweaks(doc: Document = document): void {
  const tweaks: HeaderDebugTweak[] = [
    'hide-button',
    'smoothing-auto',
    'weight-700',
    'clear-z',
    'pad-48',
    'solid-title',
  ]
  for (const tweak of tweaks) applyHeaderDebugTweak(doc, tweak, false)
}
