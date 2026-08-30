import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/i18n'
import { pickImportFile } from '@/shared/lib/pickNativeTextFile'
import { Button } from '@/shared/ui/button'
import { useAssetStore } from '@/stores/assetStore'
import { exportCsv, importCsv, InvalidCsvError } from './csvActions'
import {
  CSV_FIELDS,
  describeCsvIssue,
  guessCsvMapping,
  mappingIsComplete,
  previewCsvImport,
  type CsvColumnMapping,
} from './csvImport'
import { parseCsv } from './csvParse'
import { shareOrDownloadCsv } from './downloadCsv'

type CsvDraft = {
  text: string
  rows: string[][]
  mapping: Partial<CsvColumnMapping>
}

export function CsvSection() {
  const t = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [issues, setIssues] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState<CsvDraft | undefined>()
  const assets = useAssetStore((state) => state.assets)
  const loadAssets = useAssetStore((state) => state.load)

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  const preview = useMemo(() => {
    if (!draft || !mappingIsComplete(draft.mapping)) return undefined
    return previewCsvImport(draft.rows, draft.mapping, assets)
  }, [assets, draft])

  async function handleExport() {
    setError(undefined)
    setMessage(undefined)
    setIssues([])
    setBusy(true)
    try {
      const csv = await exportCsv()
      const result = await shareOrDownloadCsv(csv)
      setMessage(result === 'shared' ? t.csv.shared : t.csv.exported)
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') {
        return
      }
      setError(t.csv.exportFailed)
    } finally {
      setBusy(false)
    }
  }

  function handlePick(file: File) {
    setError(undefined)
    setMessage(undefined)
    setIssues([])
    void file.text().then((text) => {
      try {
        const rows = parseCsv(text)
        setDraft({
          text,
          rows,
          mapping: guessCsvMapping(rows[0] ?? []),
        })
      } catch (caught) {
        setDraft(undefined)
        if (caught instanceof InvalidCsvError) {
          setError(t.csv.invalidFile)
        } else {
          setError(t.csv.importFailed)
        }
      }
    })
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleImport() {
    if (!draft || !mappingIsComplete(draft.mapping)) return
    setError(undefined)
    setMessage(undefined)
    setBusy(true)
    try {
      const result = await importCsv(draft.text, draft.mapping)
      await loadAssets()
      setMessage(t.csv.imported(result.snapshots.length, result.issues.length))
      setIssues(result.issues.map((issue) => describeCsvIssue(issue, t)))
      setDraft(undefined)
    } catch (caught) {
      if (caught instanceof InvalidCsvError) {
        setError(t.csv.invalidFile)
      } else {
        setError(t.csv.importFailed)
      }
    } finally {
      setBusy(false)
    }
  }

  const headers = draft?.rows[0] ?? []
  const previewIssues = (preview?.issues ?? []).slice(0, 8)
  const extraIssues = (preview?.issues.length ?? 0) - previewIssues.length

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.csv.title}</h2>
      <p className="text-sm text-muted-foreground">{t.csv.description}</p>
      <Button
        type="button"
        size="xl"
        className="w-full"
        disabled={busy}
        onClick={() => void handleExport()}
      >
        {t.csv.exportCsv}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="text/csv,.csv"
        className="sr-only"
        aria-label={t.csv.importAria}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) handlePick(file)
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="xl"
        className="w-full"
        disabled={busy}
        onClick={() => {
          void (async () => {
            const nativeFile = await pickImportFile(
              ['text/csv', 'text/plain'],
              inputRef.current,
            )
            if (nativeFile) handlePick(nativeFile)
          })()
        }}
      >
        {t.csv.importCsv}
      </Button>
      {draft && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <p className="text-sm font-medium">{t.csv.mapColumns}</p>
          {CSV_FIELDS.map((field) => (
            <label key={field} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t.csv.fields[field]}</span>
              <select
                className="h-12 rounded-lg border border-input bg-background px-2.5 text-base"
                value={draft.mapping[field] ?? ''}
                onChange={(event) => {
                  const value = event.target.value
                  setDraft({
                    ...draft,
                    mapping: {
                      ...draft.mapping,
                      [field]: value === '' ? undefined : Number(value),
                    },
                  })
                }}
              >
                <option value="">{t.csv.selectColumn}</option>
                {headers.map((header, index) => (
                  <option key={`${header}-${index}`} value={index}>
                    {header || t.csv.columnN(index + 1)}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {preview && (
            <p className="text-sm text-muted-foreground">
              {t.csv.ready(preview.snapshots.length, preview.issues.length)}
            </p>
          )}
          {previewIssues.map((issue) => (
            <p
              key={`${issue.rowNumber}-${issue.reason}`}
              className="text-sm text-muted-foreground"
            >
              {describeCsvIssue(issue, t)}
            </p>
          ))}
          {extraIssues > 0 && (
            <p className="text-sm text-muted-foreground">
              {t.csv.andMore(extraIssues)}
            </p>
          )}
          <Button
            type="button"
            size="xl"
            className="w-full"
            disabled={busy || !mappingIsComplete(draft.mapping)}
            onClick={() => void handleImport()}
          >
            {t.csv.importMapped}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="w-full"
            disabled={busy}
            onClick={() => {
              setDraft(undefined)
              setIssues([])
            }}
          >
            {t.common.cancel}
          </Button>
        </div>
      )}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {issues.map((line) => (
        <p key={line} className="text-sm text-muted-foreground">
          {line}
        </p>
      ))}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  )
}
