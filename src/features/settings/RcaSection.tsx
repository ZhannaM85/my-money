import { issueRcas } from '@/data/issueRcas'
import { useLocale } from '@/i18n'

export function RcaSection() {
  const locale = useLocale()

  return (
    <div className="max-h-[50svh] overflow-y-auto rounded-lg border border-border bg-background p-3 overscroll-contain">
      <ul className="flex flex-col gap-2.5 text-sm">
        {issueRcas.map((row) => (
          <li key={row.issue} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              #{row.issue} · {row.title[locale]}
            </span>
            <span className="text-foreground">{row[locale]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
