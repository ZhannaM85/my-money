import { describe, expect, it, vi } from 'vitest'
import { browserFetch } from './browserFetch'

describe('browserFetch', () => {
  it('invokes fetch as a method of globalThis so Safari keeps Window as this', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 }),
    )
    await browserFetch('/fx/rub/EUR.json')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(fetchSpy.mock.instances[0]).toBe(globalThis)
  })
})
