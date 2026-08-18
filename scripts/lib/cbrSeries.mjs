export function parseCbrNumber(raw) {
  return Number(raw.trim().replace(',', '.'))
}

export function cbrToIsoDate(raw) {
  const [day, month, year] = raw.split('.')
  return `${year}-${month}-${day}`
}

/**
 * Parse CBR XML_dynamic Record rows into { date, rate } quotes.
 * Records include Date and Id attributes:
 * `<Record Date="18.08.2026" Id="R01239">…</Record>`
 */
export function parseSeries(xml) {
  const rows = []
  const recordRegex = /<Record\s+Date="([^"]+)"[^>]*>([\s\S]*?)<\/Record>/g
  for (const match of xml.matchAll(recordRegex)) {
    const date = cbrToIsoDate(match[1].trim())
    const body = match[2]
    const nominalRaw = body.match(/<Nominal>([^<]+)<\/Nominal>/)?.[1]
    const valueRaw = body.match(/<Value>([^<]+)<\/Value>/)?.[1]
    if (!nominalRaw || !valueRaw) continue
    const nominal = parseCbrNumber(nominalRaw)
    const value = parseCbrNumber(valueRaw)
    if (!Number.isFinite(nominal) || !Number.isFinite(value) || nominal === 0) {
      continue
    }
    rows.push({ date, rate: value / nominal })
  }
  rows.sort((a, b) => a.date.localeCompare(b.date))
  return rows
}

export function addDaysIso(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function isoDatesInclusive(from, to) {
  if (from > to) return []
  const dates = []
  let current = from
  while (current <= to) {
    dates.push(current)
    current = addDaysIso(current, 1)
  }
  return dates
}

export function fillForward(quotes, start, end) {
  const byDate = new Map(quotes.map((quote) => [quote.date, quote.rate]))
  const filled = []
  let lastRate
  for (const date of isoDatesInclusive(start, end)) {
    const current = byDate.get(date)
    if (current !== undefined) lastRate = current
    if (lastRate !== undefined) {
      filled.push({ date, rate: lastRate })
    }
  }
  return filled
}
