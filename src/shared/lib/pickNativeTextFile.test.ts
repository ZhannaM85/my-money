import { afterEach, describe, expect, it, vi } from 'vitest'
import { Capacitor } from '@capacitor/core'
import { FilePicker } from '@capawesome/capacitor-file-picker'

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(() => false) },
}))

vi.mock('@capawesome/capacitor-file-picker', () => ({
  FilePicker: {
    pickFiles: vi.fn(),
  },
}))

const { pickNativeTextFile, pickImportFile } =
  await import('./pickNativeTextFile')

afterEach(() => {
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
  vi.mocked(FilePicker.pickFiles).mockReset()
})

describe('pickNativeTextFile (#169)', () => {
  it('does not open the picker on web', async () => {
    await expect(
      pickNativeTextFile(['application/json']),
    ).resolves.toBeUndefined()
    expect(FilePicker.pickFiles).not.toHaveBeenCalled()
  })

  it('returns a File from base64 picker data on native', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
    vi.mocked(FilePicker.pickFiles).mockResolvedValue({
      files: [
        {
          name: 'book.json',
          mimeType: 'application/json',
          data: btoa('{"ok":true}'),
        },
      ],
    })

    const file = await pickNativeTextFile(['application/json'])
    expect(file?.name).toBe('book.json')
    await expect(file?.text()).resolves.toBe('{"ok":true}')
  })

  it('returns undefined when the user cancels', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
    vi.mocked(FilePicker.pickFiles).mockRejectedValue(new Error('canceled'))

    await expect(pickNativeTextFile(['text/csv'])).resolves.toBeUndefined()
  })

  it('clicks the hidden input on web instead of the native picker', async () => {
    const input = { click: vi.fn() } as unknown as HTMLInputElement
    await pickImportFile(['application/json'], input)
    expect(input.click).toHaveBeenCalled()
    expect(FilePicker.pickFiles).not.toHaveBeenCalled()
  })
})
