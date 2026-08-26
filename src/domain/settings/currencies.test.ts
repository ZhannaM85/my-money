import { describe, expect, it } from 'vitest'
import { BASE_CURRENCIES } from './currencies'

describe('BASE_CURRENCIES (#107)', () => {
  it('includes GEL for Georgian Lari pickers', () => {
    expect(BASE_CURRENCIES).toContain('GEL')
  })
})
