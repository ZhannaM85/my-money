import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  BookNotEmptyError,
  exportBackup,
  importBackupJson,
  InvalidBackupError,
} from './backupActions'
import { downloadBackupJson } from './downloadBackup'

export function BackupSection() {
  const t = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const loadAssets = useAssetStore((state) => state.load)
  const loadSettings = useSettingsStore((state) => state.load)
  const assetCount = useAssetStore((state) => state.assets.length)
  const assetsLoaded = useAssetStore((state) => state.loaded)

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  const bookHasAssets = assetsLoaded && assetCount > 0

  async function handleExport() {
    setError(undefined)
    setMessage(undefined)
    setBusy(true)
    try {
      const bundle = await exportBackup()
      downloadBackupJson(bundle)
      setMessage(t.backup.downloaded)
    } catch {
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
      await importBackupJson(text)
      await Promise.all([loadAssets(), loadSettings()])
      setMessage(t.backup.restored)
    } catch (caught) {
      if (caught instanceof BookNotEmptyError) {
        setError(t.backup.bookNotEmpty)
      } else if (caught instanceof InvalidBackupError) {
        setError(t.backup.invalidFile)
      } else {
        setError(t.backup.importFailed)
      }
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
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
        disabled={busy || bookHasAssets}
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
        disabled={busy || bookHasAssets}
        onClick={() => inputRef.current?.click()}
      >
        {t.backup.importJson}
      </Button>
      {bookHasAssets && (
        <p className="text-sm text-muted-foreground">
          {t.backup.onlyEmpty}
        </p>
      )}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  )
}
