import { useEffect, useState } from 'react'
import { shareOrDownloadDebugTxt } from '@/infrastructure/debug/downloadDebugTxt'
import {
  applyHeaderDebugTweak,
  collectHeaderBlurReport,
  resetHeaderDebugTweaks,
  type HeaderDebugTweak,
} from '@/shared/lib/headerBlurDebug'
import { Button } from '@/shared/ui/button'

const TWEAKS: { id: HeaderDebugTweak; label: string }[] = [
  { id: 'hide-button', label: 'Скрыть кнопку шапки' },
  { id: 'smoothing-auto', label: 'Сглаживание auto' },
  { id: 'weight-700', label: 'Жирность 700' },
  { id: 'clear-z', label: 'Убрать z-index' },
  { id: 'pad-48', label: 'Опустить название' },
  { id: 'solid-title', label: 'Фон у названия' },
]

export function HeaderBlurDebug() {
  const [report, setReport] = useState(() => collectHeaderBlurReport())
  const [on, setOn] = useState<Partial<Record<HeaderDebugTweak, boolean>>>({})

  function refresh() {
    setReport(collectHeaderBlurReport())
  }

  useEffect(() => () => resetHeaderDebugTweaks(), [])

  return (
    <section id="header-debug" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-foreground">Шапка на iPhone</h3>
        <p className="text-sm text-muted-foreground">
          Включите пункт и сразу посмотрите на название My Money сверху. Один
          пункт за раз. Потом скопируйте отчёт.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {TWEAKS.map((tweak) => (
          <label key={tweak.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={on[tweak.id] === true}
              onChange={(event) => {
                const next = event.target.checked
                applyHeaderDebugTweak(document, tweak.id, next)
                setOn((current) => ({ ...current, [tweak.id]: next }))
                refresh()
              }}
            />
            {tweak.label}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={refresh}>
          Обновить
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void shareOrDownloadDebugTxt(report)
          }}
        >
          Отправить отчёт
        </Button>
      </div>
      <textarea
        readOnly
        value={report}
        rows={12}
        className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
      />
    </section>
  )
}
