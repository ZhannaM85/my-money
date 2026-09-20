import { describe, expect, it } from 'vitest'
import { parseSpendLineDrafts, spendLinesOrDefault } from './spendLines'

describe('parseSpendLineDrafts (#279)', () => {
  it('keeps amounts and trims notes; skips empty and note-only rows', () => {
    expect(
      parseSpendLineDrafts([
        { key: '1', amount: '1000', note: '  Gift  ' },
        { key: '2', amount: '', note: 'Forgot' },
        { key: '3', amount: '2000', note: '   ' },
      ]),
    ).toEqual([
      { amount: 1000, note: 'Gift' },
      { amount: 2000 },
    ])
  })

  it('gives a stable empty line when nothing is drafted yet', () => {
    expect(spendLinesOrDefault(undefined, 'usd-cash')[0]?.key).toBe(
      'usd-cash-spend-0',
    )
  })
})
