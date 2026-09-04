/**
 * Reset every vertical scrollport to the top (#215).
 * AppShell locks `html`/`body` overflow, so iOS status-bar tap cannot drive
 * document scroll the way Turtle does — callers wire the app chrome instead.
 */
export function scrollAppToTop(): void {
  window.scrollTo(0, 0)

  const main = document.getElementById('main-content')
  if (main) main.scrollTop = 0

  for (const node of document.querySelectorAll('*')) {
    if (!(node instanceof HTMLElement)) continue
    if (node.scrollTop <= 0) continue
    const { overflowY } = getComputedStyle(node)
    if (
      overflowY !== 'auto' &&
      overflowY !== 'scroll' &&
      overflowY !== 'overlay'
    ) {
      continue
    }
    node.scrollTop = 0
  }
}
