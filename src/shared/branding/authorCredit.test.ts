import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  AUTHOR_CREDIT,
  AUTHOR_CREDIT_RU,
  FORBIDDEN_SURNAME_PATTERNS,
} from './authorCredit'

const SRC_ROOT = join(process.cwd(), 'src')

function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(path))
      continue
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.test.tsx')) {
      files.push(path)
    }
  }
  return files
}

describe('author credit (#334)', () => {
  it('exports Zhanna M. / Жанна М. for public credit', () => {
    expect(AUTHOR_CREDIT).toBe('Zhanna M.')
    expect(AUTHOR_CREDIT_RU).toBe('Жанна М.')
  })

  it('keeps the full surname out of product source strings', () => {
    const offenders: string[] = []
    for (const file of listSourceFiles(SRC_ROOT)) {
      // This module documents the forbidden patterns themselves.
      if (file.endsWith(`${join('shared', 'branding', 'authorCredit.ts')}`)) continue
      const text = readFileSync(file, 'utf8')
      for (const pattern of FORBIDDEN_SURNAME_PATTERNS) {
        if (pattern.test(text)) {
          offenders.push(`${file} matches ${pattern}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
