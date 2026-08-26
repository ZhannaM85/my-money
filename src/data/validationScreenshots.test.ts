import { describe, expect, it } from 'vitest'

const docs = import.meta.glob('../../docs/VALIDATION_SCREENSHOTS.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const packages = import.meta.glob('../../package.json', {
  eager: true,
  import: 'default',
}) as Record<string, { scripts: Record<string, string> }>

describe('validation screenshot workflow (#118)', () => {
  it('documents capture and attach commands', () => {
    const doc = Object.values(docs)[0] ?? ''
    const pkg = Object.values(packages)[0]
    expect(doc).toContain('npm run screenshots:capture')
    expect(doc).toContain('npm run screenshots:attach')
    expect(pkg?.scripts['screenshots:capture']).toContain('playwright')
    expect(pkg?.scripts['screenshots:attach']).toContain(
      'attach-validation-screenshots',
    )
  })
})
