/** True when pull-to-refresh should arm: every vertical scroller under the touch is at top. */

function elementFromTarget(target: EventTarget | null): Element | null {
  if (target instanceof Element) return target
  if (target instanceof Text) return target.parentElement
  return null
}

function isVerticallyScrollable(node: Element): boolean {
  const { overflowY } = getComputedStyle(node)
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') {
    return false
  }
  return node.scrollHeight > node.clientHeight + 1
}

/**
 * Pull-to-refresh must not treat AppShell `#main-content` at scrollTop 0 as
 * “page top” when an inner scroller (Update holdings, #191/#203) has moved.
 */
export function isAtRefreshableTop(target: EventTarget | null): boolean {
  const main = document.getElementById('main-content')
  if (main && main.scrollTop > 0) return false
  if (window.scrollY > 0) return false

  let node: Element | null = elementFromTarget(target)
  while (node && node !== document.documentElement) {
    if (isVerticallyScrollable(node) && node.scrollTop > 0) return false
    node = node.parentElement
  }
  return true
}
