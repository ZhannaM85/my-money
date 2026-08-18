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
    <div className="max-h-[50svh] overflow-y-auto rounded-lg border border-border bg-background p-3 overscroll-contain">
      <ul className="flex flex-col gap-2.5 text-sm">
        {releaseNotes.map((note) => (
          <li key={note.version} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              v{note.version} · {formatNoteDate(note.date, locale)}
            </span>
            <span className="text-foreground">{note[locale]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
