import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  DEBUG_LOG_FILENAME,
  downloadDebugTxt,
  shareOrDownloadDebugTxt,
} from './downloadDebugTxt'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('downloadDebugTxt (#161)', () => {
  it('saves a text/plain .txt download', () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:debug')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined)

    downloadDebugTxt('hello log')

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0]?.[0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob?.type).toBe('text/plain;charset=utf-8')
    expect(click).toHaveBeenCalled()
    const anchor = click.mock.instances[0] as HTMLAnchorElement
    expect(anchor.download).toBe(DEBUG_LOG_FILENAME)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:debug')
  })

  it('uses the share sheet when the browser can share files', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', {
      share,
      canShare: () => true,
    })

    await expect(shareOrDownloadDebugTxt('hello log')).resolves.toBe('shared')
    expect(share).toHaveBeenCalledTimes(1)
    const payload = share.mock.calls[0]?.[0] as { files: File[] }
    expect(payload.files[0]?.name).toBe(DEBUG_LOG_FILENAME)
    expect(payload.files[0]?.type).toBe('text/plain')
  })

  it('downloads when share is unavailable', async () => {
    vi.stubGlobal('navigator', {})
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:debug')
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL: vi.fn(),
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => undefined,
    )

    await expect(shareOrDownloadDebugTxt('hello log')).resolves.toBe(
      'downloaded',
    )
    expect(createObjectURL).toHaveBeenCalled()
  })
})
