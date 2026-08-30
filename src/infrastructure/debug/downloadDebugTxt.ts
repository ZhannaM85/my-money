export const DEBUG_LOG_FILENAME = 'my-money-debug.txt'

export function downloadDebugTxt(text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = DEBUG_LOG_FILENAME
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function shareOrDownloadDebugTxt(
  text: string,
): Promise<'shared' | 'downloaded'> {
  const file = new File([text], DEBUG_LOG_FILENAME, { type: 'text/plain' })
  const nav = globalThis.navigator
  if (typeof nav?.share === 'function' && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title: DEBUG_LOG_FILENAME })
    return 'shared'
  }
  downloadDebugTxt(text)
  return 'downloaded'
}
