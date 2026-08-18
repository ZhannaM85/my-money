import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/domain/settings'
import { releaseNotes } from '@/data/releaseNotes'
import { useSettingsStore } from '@/stores/settingsStore'
import { ReleaseNotesSection } from './ReleaseNotesSection'

afterEach(() => {
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS })
})

describe('ReleaseNotesSection', () => {
  it('shows entries, most-recent-first', () => {
    render(<ReleaseNotesSection />)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent(releaseNotes[0].en)
    expect(items.at(-1)).toHaveTextContent(
      releaseNotes[releaseNotes.length - 1].en,
    )
  })

  it('shows each entry version number', () => {
    render(<ReleaseNotesSection />)

    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent(`v${releaseNotes[0].version}`)
  })

  it('shows Russian entries when the locale is Russian', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, locale: 'ru' },
    })
    render(<ReleaseNotesSection />)

    expect(screen.getByText(releaseNotes[0].ru)).toBeInTheDocument()
  })
})
