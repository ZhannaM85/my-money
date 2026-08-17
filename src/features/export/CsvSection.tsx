import { useEffect, useMemo, useRef, useState } from 'react'
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
  type CsvField,
} from './csvImport'
import { parseCsv } from './csvParse'
import { downloadCsv } from './downloadCsv'

const FIELD_LABELS: Record<CsvField, string> = {
  date: 'Date',
  asset: 'Asset (name or id)',
  amount: 'Amount',
  currency: 'Currency',
}

type CsvDraft = {
  text: string
  rows: string[][]
  mapping: Partial<CsvColumnMapping>
}

export function CsvSection() {
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
      downloadCsv(csv)
      setMessage('CSV downloaded.')
    } catch {
      setError('Could not export CSV.')
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
          setError(caught.message)
        } else {
          setError('Could not read this file.')
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
      const imported = result.snapshots.length
      const skipped = result.issues.length
      setMessage(
        skipped === 0
          ? `Imported ${imported} snapshot${imported === 1 ? '' : 's'}.`
          : `Imported ${imported} snapshot${imported === 1 ? '' : 's'}. ${skipped} row${skipped === 1 ? '' : 's'} could not be imported.`,
      )
      setIssues(result.issues.map(describeCsvIssue))
      setDraft(undefined)
    } catch (caught) {
      if (caught instanceof InvalidCsvError) {
        setError(caught.message)
      } else {
        setError('Could not import this file.')
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
      <h2 className="text-lg font-semibold">CSV</h2>
      <p className="text-sm text-muted-foreground">
        Spreadsheet of snapshots. JSON remains the backup. Import adds
        balances to assets that already exist; unmatched rows are listed, not
        dropped.
      </p>
      <Button
        type="button"
        size="xl"
        className="w-full"
        disabled={busy}
        onClick={() => void handleExport()}
      >
        Export CSV
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="text/csv,.csv"
        className="sr-only"
        aria-label="Import CSV"
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
        onClick={() => inputRef.current?.click()}
      >
        Import CSV
      </Button>
      {draft && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <p className="text-sm font-medium">Map columns</p>
          {CSV_FIELDS.map((field) => (
            <label key={field} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{FIELD_LABELS[field]}</span>
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
                <option value="">Select column</option>
                {headers.map((header, index) => (
                  <option key={`${header}-${index}`} value={index}>
                    {header || `Column ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {preview && (
            <p className="text-sm text-muted-foreground">
              {preview.snapshots.length} snapshot
              {preview.snapshots.length === 1 ? '' : 's'} ready
              {preview.issues.length > 0
                ? `, ${preview.issues.length} row${preview.issues.length === 1 ? '' : 's'} unmatched or invalid`
                : ''}
              .
            </p>
          )}
          {previewIssues.map((issue) => (
            <p
              key={`${issue.rowNumber}-${issue.reason}`}
              className="text-sm text-muted-foreground"
            >
              {describeCsvIssue(issue)}
            </p>
          ))}
          {extraIssues > 0 && (
            <p className="text-sm text-muted-foreground">
              And {extraIssues} more.
            </p>
          )}
          <Button
            type="button"
            size="xl"
            className="w-full"
            disabled={busy || !mappingIsComplete(draft.mapping)}
            onClick={() => void handleImport()}
          >
            Import mapped rows
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
            Cancel
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
