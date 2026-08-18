import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../src/index.css'),
  'utf8',
)

function blockAfter(marker: string): string {
  const start = css.indexOf(marker)
  expect(start).toBeGreaterThan(-1)
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  return css.slice(open, close + 1)
}

function token(block: string, name: string): string {
  const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`))
  expect(match, `--${name}`).toBeTruthy()
  return match![1].trim()
}

describe('Colorful mood tokens', () => {
  it('keeps charcoal chrome and a colorful primary, not a teal page', () => {
    const colorful = blockAfter(":root[data-mood='ledger'] {")
    const colorfulDark = blockAfter(":root[data-mood='ledger'].dark {")

    expect(token(colorful, 'background')).toBe('#0a0a0a')
    expect(token(colorful, 'card')).toBe('#171717')
    expect(token(colorful, 'primary')).toBe('#7c3aed')
    expect(token(colorfulDark, 'background')).toBe('#0a0a0a')
    expect(token(colorfulDark, 'card')).toBe('#171717')
    expect(token(colorfulDark, 'primary')).toBe('#a78bfa')

    for (const block of [colorful, colorfulDark]) {
      expect(token(block, 'background')).not.toBe('#f3f7f6')
      expect(token(block, 'background')).not.toBe('#12222a')
      expect(token(block, 'primary')).not.toBe('#0e8a7d')
      expect(token(block, 'primary')).not.toBe('#2ec4b6')
      expect(token(block, 'primary')).not.toBe('#171717')
    }
  })
})
