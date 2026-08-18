import { describe, expect, it } from 'vitest'
import { fillForward, parseSeries } from '../../scripts/lib/cbrSeries.mjs'

describe('cbrSeries parseSeries', () => {
  it('parses Record rows that include both Date and Id attributes', () => {
    const xml = `<?xml version="1.0"?>
<ValCurs>
  <Record Date="18.08.2026" Id="R01239">
    <Nominal>1</Nominal>
    <Value>98,3352</Value>
  </Record>
  <Record Date="17.08.2026" Id="R01239">
    <Nominal>1</Nominal>
    <Value>97,1000</Value>
  </Record>
</ValCurs>`

    expect(parseSeries(xml)).toEqual([
      { date: '2026-08-17', rate: 97.1 },
      { date: '2026-08-18', rate: 98.3352 },
    ])
  })

  it('returns an empty list when the old Date-only regex would have matched nothing', () => {
    const xml = `<Record Date="18.08.2026" Id="R01239"><Nominal>1</Nominal><Value>98,3352</Value></Record>`
    expect(parseSeries(xml)).toHaveLength(1)
  })
})

describe('cbrSeries fillForward', () => {
  it('fills weekends with the previous published rate', () => {
    expect(
      fillForward(
        [
          { date: '2026-08-14', rate: 90 },
          { date: '2026-08-17', rate: 91 },
        ],
        '2026-08-14',
        '2026-08-17',
      ),
    ).toEqual([
      { date: '2026-08-14', rate: 90 },
      { date: '2026-08-15', rate: 90 },
      { date: '2026-08-16', rate: 90 },
      { date: '2026-08-17', rate: 91 },
    ])
  })
})
