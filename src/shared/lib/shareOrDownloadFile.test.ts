import { afterEach, describe, expect, it, vi } from 'vitest'
import { Capacitor } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn(() => false) },
}))

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Encoding: { UTF8: 'utf8' },
  Filesystem: {
    writeFile: vi.fn(() => Promise.resolve()),
    getUri: vi.fn(() => Promise.resolve({ uri: 'file://cache/note.json' })),
  },
}))

vi.mock('@capacitor/share', () => ({
  Share: { share: vi.fn(() => Promise.resolve()) },
}))

const { shareOrDownloadFile, triggerBlobDownload } =
  await import('./shareOrDownloadFile')

afterEach(() => {
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
  vi.mocked(Filesystem.writeFile).mockClear()
  vi.mocked(Filesystem.getUri).mockClear()
  vi.mocked(Share.share).mockClear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('shareOrDownloadFile (#169)', () => {
  it('uses the share sheet when the browser can share files', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      share,
      canShare: () => true,
    })
    const file = new File(['{}'], 'my-money-backup.json', {
      type: 'application/json',
    })

    await expect(shareOrDownloadFile(file)).resolves.toBe('shared')
    expect(share).toHaveBeenCalledTimes(1)
    expect(Share.share).not.toHaveBeenCalled()
  })

  it('writes to cache and shares on the native shell when Web Share files are missing', async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
    vi.stubGlobal('navigator', {})
    const file = new File(['{"ok":true}'], 'my-money-backup.json', {
      type: 'application/json',
    })

    await expect(shareOrDownloadFile(file)).resolves.toBe('shared')
    expect(Filesystem.writeFile).toHaveBeenCalledWith({
      path: 'my-money-backup.json',
      data: '{"ok":true}',
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    expect(Share.share).toHaveBeenCalledWith({
      title: 'my-money-backup.json',
      files: ['file://cache/note.json'],
    })
  })

  it('downloads on web when share is unavailable', async () => {
    vi.stubGlobal('navigator', {})
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:file')
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => undefined,
    )
    const file = new File(['a,b'], 'export.csv', { type: 'text/csv' })

    await expect(shareOrDownloadFile(file)).resolves.toBe('downloaded')
    expect(createObjectURL).toHaveBeenCalled()
    expect(Share.share).not.toHaveBeenCalled()
  })
})

describe('triggerBlobDownload', () => {
  it('clicks an anchor with the given filename', () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:file')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    triggerBlobDownload(new Blob(['x']), 'note.txt')

    const anchor = click.mock.instances[0] as HTMLAnchorElement
    expect(anchor.download).toBe('note.txt')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:file')
  })
})
