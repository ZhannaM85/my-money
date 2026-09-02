import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/i18n'
import { bookHasAssets } from '@/infrastructure/persistence/indexeddb/backupStore'
import { pickImportFile } from '@/shared/lib/pickNativeTextFile'
import { Button } from '@/shared/ui/button'
import { useAssetStore } from '@/stores/assetStore'
import { useComparisonStore } from '@/stores/comparisonStore'
import { useFxStore } from '@/stores/fxStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  deleteAllLocalData,
  exportBackup,
  importBackupJson,
  InvalidBackupError,
  parseBackupJson,
} from './backupActions'
import { shareOrDownloadBackupJson } from './downloadBackup'

export function BackupSection() {
  const t = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const loadAssets = useAssetStore((state) => state.load)
  const loadSettings = useSettingsStore((state) => state.load)
  const loadFx = useFxStore((state) => state.loadCached)

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  async function handleExport() {
    setError(undefined)
    setMessage(undefined)
    setBusy(true)
    try {
      const bundle = await exportBackup()
      const result = await shareOrDownloadBackupJson(bundle)
      setMessage(result === 'shared' ? t.backup.shared : t.backup.downloaded)
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') {
        return
      }
      setError(t.backup.exportFailed)
    } finally {
      setBusy(false)
    }
  }

  async function handleImport(file: File) {
    setError(undefined)
    setMessage(undefined)
    setBusy(true)
    try {
      const text = await file.text()
      parseBackupJson(text)
      if (
        (await bookHasAssets()) &&
        !window.confirm(t.backup.replaceConfirm)
      ) {
        return
      }
      await importBackupJson(text)
      await Promise.all([loadAssets(), loadSettings(), loadFx()])
      setMessage(t.backup.restored)
    } catch (caught) {
      if (caught instanceof InvalidBackupError) {
        setError(t.backup.invalidFile)
      } else {
        setError(t.backup.importFailed)
      }
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDeleteAll() {
    setError(undefined)
    setMessage(undefined)
    const hasAssets = await bookHasAssets()
    const confirmed = window.confirm(
      hasAssets ? t.backup.deleteAllConfirm : t.backup.deleteAllConfirmEmpty,
    )
    if (!confirmed) return
    setBusy(true)
    try {
      await deleteAllLocalData()
      useComparisonStore.getState().clearDates()
      await Promise.all([loadAssets(), loadSettings(), loadFx()])
      setMessage(t.backup.deleted)
    } catch {
      setError(t.backup.deleteFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.backup.title}</h2>
      <p className="text-sm text-muted-foreground">{t.backup.description}</p>
      <Button
        type="button"
        size="xl"
        className="w-full"
        disabled={busy}
        onClick={() => void handleExport()}
      >
        {t.backup.exportJson}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label={t.backup.importAria}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleImport(file)
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
              ['application/json'],
              inputRef.current,
            )
            if (nativeFile) void handleImport(nativeFile)
          })()
        }}
      >
        {t.backup.importJson}
      </Button>
      <p className="text-sm text-muted-foreground">{t.backup.replaceHint}</p>
      <Button
        type="button"
        variant="destructive"
        size="xl"
        className="w-full"
        disabled={busy}
        onClick={() => void handleDeleteAll()}
      >
        {t.backup.deleteAll}
      </Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  )
}
