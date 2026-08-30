import { useEffect, useState, useSyncExternalStore } from 'react'
import { useTranslation } from '@/i18n'
import { shareOrDownloadDebugTxt } from '@/infrastructure/debug/downloadDebugTxt'
import {
  clearFxDebugLog,
  formatFxDebugLog,
  getFxDebugSnapshot,
  setFxDebugEnabled,
  subscribeFxDebugLog,
} from '@/infrastructure/fx/fxDebug'
import { Button } from '@/shared/ui/button'

export function FxDebugSection() {
  const t = useTranslation()
  const { enabled, entries } = useSyncExternalStore(
    subscribeFxDebugLog,
    getFxDebugSnapshot,
    getFxDebugSnapshot,
  )
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  )
  const [saveState, setSaveState] = useState<
    'idle' | 'saved' | 'shared' | 'failed'
  >('idle')

  useEffect(() => {
    if (copyState === 'idle') return
    const id = window.setTimeout(() => setCopyState('idle'), 2000)
    return () => window.clearTimeout(id)
  }, [copyState])

  useEffect(() => {
    if (saveState === 'idle') return
    const id = window.setTimeout(() => setSaveState('idle'), 2000)
    return () => window.clearTimeout(id)
  }, [saveState])

  async function handleCopy() {
    const text = formatFxDebugLog(entries)
    try {
      await navigator.clipboard.writeText(text || t.settings.fxDebugEmpty)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  async function handleSave() {
    const text = formatFxDebugLog(entries) || t.settings.fxDebugEmpty
    try {
      const result = await shareOrDownloadDebugTxt(text)
      setSaveState(result === 'shared' ? 'shared' : 'saved')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setSaveState('failed')
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{t.settings.fxDebugTitle}</h2>
        <p className="text-sm text-muted-foreground">
          {t.settings.fxDebugDescription}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={enabled ? 'default' : 'outline'}
          onClick={() => setFxDebugEnabled(!enabled)}
        >
          {enabled ? t.settings.fxDebugDisable : t.settings.fxDebugEnable}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={entries.length === 0}
          onClick={() => void handleSave()}
        >
          {t.settings.fxDebugSave}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={entries.length === 0}
          onClick={() => void handleCopy()}
        >
          {t.settings.fxDebugCopy}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={entries.length === 0}
          onClick={() => clearFxDebugLog()}
        >
          {t.settings.fxDebugClear}
        </Button>
      </div>
      {copyState === 'copied' && (
        <p className="text-sm text-muted-foreground">{t.settings.fxDebugCopied}</p>
      )}
      {copyState === 'failed' && (
        <p className="text-sm text-muted-foreground">
          {t.settings.fxDebugCopyFailed}
        </p>
      )}
      {saveState === 'saved' && (
        <p className="text-sm text-muted-foreground">{t.settings.fxDebugSaved}</p>
      )}
      {saveState === 'shared' && (
        <p className="text-sm text-muted-foreground">
          {t.settings.fxDebugShared}
        </p>
      )}
      {saveState === 'failed' && (
        <p className="text-sm text-muted-foreground">
          {t.settings.fxDebugSaveFailed}
        </p>
      )}
      {enabled && (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-card p-3 text-xs ring-1 ring-foreground/10">
          {entries.length === 0
            ? t.settings.fxDebugEmpty
            : formatFxDebugLog(entries)}
        </pre>
      )}
    </section>
  )
}
