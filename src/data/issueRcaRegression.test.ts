import { describe, expect, it } from 'vitest'
import { issueRcas } from './issueRcas'

/** Live-feedback RCAs from this cutoff must be named in a *.test.ts(x) file. */
const FIRST_REQUIRED = 90

const testSources = import.meta.glob(['../**/*.test.ts', '../**/*.test.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

describe('RCA regression coverage (#101)', () => {
  it('names each shipped RCA from #90 onward in a unit test', () => {
    const blob = Object.values(testSources).join('\n')
    const missing = issueRcas
      .filter((row) => row.issue >= FIRST_REQUIRED)
      .filter((row) => !new RegExp(`#${row.issue}\\b`).test(blob))
      .map((row) => row.issue)
    expect(missing).toEqual([])
  })
})
