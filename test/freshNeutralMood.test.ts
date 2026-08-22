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

describe('Fresh vs Neutral moods (#98)', () => {
  it('uses a slate primary on Neutral, not Fresh’s blue', () => {
    const fresh = blockAfter(":root[data-mood='fresh'] {")
    const freshDark = blockAfter(":root[data-mood='fresh'].dark {")
    const neutral = blockAfter(":root[data-mood='neutral'] {")
    const neutralDark = blockAfter(":root[data-mood='neutral'].dark {")

    expect(token(fresh, 'primary')).toBe('#2878e8')
    expect(token(neutral, 'primary')).toBe('#1d1d1f')
    expect(token(neutral, 'primary')).not.toBe(token(fresh, 'primary'))
    expect(token(neutralDark, 'primary')).not.toBe(token(freshDark, 'primary'))
    expect(token(neutral, 'primary')).not.toBe('#4c7dff')
    expect(token(neutralDark, 'primary')).not.toBe('#6b93ff')
  })
})
