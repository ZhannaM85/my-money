import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { issueRcas } from '@/data/issueRcas'
import { useSettingsStore } from '@/stores/settingsStore'
import { RcaSection } from './RcaSection'

afterEach(() => {
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS })
})

describe('RcaSection', () => {
  it('lists shipped issues, newest number first', () => {
    render(<RcaSection />)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent(`#${issueRcas[0].issue}`)
    expect(items[0]).toHaveTextContent(issueRcas[0].en)
    expect(items.at(-1)).toHaveTextContent(`#${issueRcas[issueRcas.length - 1].issue}`)
    expect(issueRcas[0].issue).toBeGreaterThan(
      issueRcas[issueRcas.length - 1].issue,
    )
  })

  it('shows Russian entries when the locale is Russian', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
    })
    render(<RcaSection />)

    expect(screen.getByText(issueRcas[0].ru)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[0]?.textContent).toContain(
      issueRcas[0].title.ru,
    )
  })

  it('has one RCA per issue number and skips unimplemented native epics', () => {
    const issues = issueRcas.map((row) => row.issue)
    expect(new Set(issues).size).toBe(issues.length)
    expect(issues).not.toContain(19)
    expect(issues).not.toContain(20)
    expect(issues).toContain(1)
    expect(issues).toContain(96)
    expect(issues).toContain(97)
    expect(issues).toContain(98)
    expect(issues).toContain(99)
    expect(issues).toContain(100)
    expect(issues).toContain(102)
    expect(issues).toContain(103)
  })
})
