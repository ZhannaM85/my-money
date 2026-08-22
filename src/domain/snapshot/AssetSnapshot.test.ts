import { describe, expect, it } from 'vitest'
import { optionalSnapshotNote } from './AssetSnapshot'

describe('optionalSnapshotNote', () => {
  it('trims text and drops empty notes so they do not persist', () => {
    expect(optionalSnapshotNote('  Bonus  ')).toBe('Bonus')
    expect(optionalSnapshotNote('   ')).toBeUndefined()
    expect(optionalSnapshotNote(undefined)).toBeUndefined()
  })
})
