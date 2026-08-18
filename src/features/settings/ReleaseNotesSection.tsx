import { releaseNotes } from '@/data/releaseNotes'
import { useLocale } from '@/i18n'

function formatNoteDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function ReleaseNotesSection() {
  const locale = useLocale()

  return (
    <ul className="flex max-h-80 flex-col gap-2.5 overflow-y-auto text-sm">
      {releaseNotes.map((note) => (
        <li key={note.version} className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">
            v{note.version} · {formatNoteDate(note.date, locale)}
          </span>
          <span className="text-foreground">{note[locale]}</span>
        </li>
      ))}
    </ul>
  )
}
