import { Capacitor } from '@capacitor/core'
import { FilePicker } from '@capawesome/capacitor-file-picker'

function fileFromPickedData(
  name: string,
  mimeType: string,
  data: string,
): File {
  const binary = atob(data)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new File([bytes], name, { type: mimeType })
}

/**
 * #169 — native document picker. Cancel returns undefined. Web callers
 * keep using `<input type="file">`.
 */
export async function pickNativeTextFile(
  types: string[],
): Promise<File | undefined> {
  if (!Capacitor.isNativePlatform()) return undefined

  try {
    const result = await FilePicker.pickFiles({
      types,
      limit: 1,
      readData: true,
    })
    const picked = result.files[0]
    if (!picked?.data) return undefined
    return fileFromPickedData(
      picked.name,
      picked.mimeType || 'application/octet-stream',
      picked.data,
    )
  } catch {
    return undefined
  }
}

/** Native picker, or click the hidden input on web. Cancel does not fall through. */
export async function pickImportFile(
  types: string[],
  input: HTMLInputElement | null,
): Promise<File | undefined> {
  if (Capacitor.isNativePlatform()) {
    return pickNativeTextFile(types)
  }
  input?.click()
  return undefined
}
