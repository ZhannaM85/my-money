import { Capacitor } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

export type ShareOrDownloadResult = 'shared' | 'downloaded'

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

async function shareViaCapacitor(file: File): Promise<void> {
  const text = await file.text()
  await Filesystem.writeFile({
    path: file.name,
    data: text,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  })
  const { uri } = await Filesystem.getUri({
    path: file.name,
    directory: Directory.Cache,
  })
  await Share.share({
    files: [uri],
  })
}

/**
 * #169 — Web Share with a File when the browser can; native shell falls
 * back to Capacitor Filesystem + Share; otherwise `<a download>`.
 */
export async function shareOrDownloadFile(
  file: File,
): Promise<ShareOrDownloadResult> {
  const nav = globalThis.navigator
  if (typeof nav?.share === 'function' && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file] })
    return 'shared'
  }

  if (Capacitor.isNativePlatform()) {
    await shareViaCapacitor(file)
    return 'shared'
  }

  triggerBlobDownload(file, file.name)
  return 'downloaded'
}
