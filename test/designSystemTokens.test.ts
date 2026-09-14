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

describe('DESIGN_SYSTEM tokens (#255)', () => {
  it('maps Tailwind primary to action and keeps navy on heading', () => {
    const root = blockAfter(':root,')
    expect(token(root, 'heading')).toBe('#142b4a')
    expect(token(root, 'action')).toBe('#2878e8')
    expect(token(root, 'positive')).toBe('#16a878')
    expect(token(root, 'asset-liabilities')).toBe('#e05252')
    expect(token(root, 'asset-bank')).toBe('#2878e8')
    expect(token(root, 'asset-cash')).toBe('#4ade80')
    expect(token(root, 'asset-vehicles')).toBe('#20b89a')
    expect(token(root, 'asset-crypto')).toBe('#f7931a')
    expect(token(root, 'asset-other')).toBe('#667085')
    expect(token(root, 'asset-deposit')).toBe('#0ea5e9')
    expect(token(root, 'asset-debit-card')).toBe('#db2777')
    expect(token(root, 'asset-apartment')).toBe('#7656d6')
    expect(token(root, 'asset-house')).toBe('#0d9488')
    expect(token(root, 'currency-eur')).toBe('#2878e8')
    expect(token(root, 'currency-usd')).toBe('#059669')
    expect(token(root, 'currency-rub')).toBe('#e11d48')
    expect(token(root, 'currency-gel')).toBe('#22d3ee')
    expect(token(root, 'primary')).toBe('var(--action)')
    expect(token(root, 'chart-investments')).toBe('var(--asset-investments)')
    expect(css).toContain('--color-heading: var(--heading)')
    expect(css).toContain('--color-action: var(--action)')
    expect(css).toContain('--color-positive: var(--positive)')
  })

  it('does not let green mood recolor asset or positive tokens', () => {
    const green = blockAfter(":root[data-mood='green'] {")
    const greenDark = blockAfter(":root[data-mood='green'].dark {")
    for (const block of [green, greenDark]) {
      expect(block).not.toMatch(/--asset-liabilities/)
      expect(block).not.toMatch(/--chart-liabilities/)
      expect(block).not.toMatch(/--positive:/)
    }
  })
})
