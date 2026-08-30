import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('native icon source (#163)', () => {
  it('keeps a git-tracked resources/icon.png for capacitor-assets', () => {
    expect(existsSync(resolve('resources/icon.png'))).toBe(true)
  })
})
