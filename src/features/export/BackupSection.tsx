import { useEffect, useRef, useState } from 'react'
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
      setMessage('Backup downloaded.')
    } catch {
      setError('Could not export the backup.')
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
      setMessage('Backup restored.')
    } catch (caught) {
      if (
        caught instanceof BookNotEmptyError ||
        caught instanceof InvalidBackupError
      ) {
        setError(caught.message)
      } else {
        setError('Could not import this file.')
      }
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Backup</h2>
      <p className="text-sm text-muted-foreground">
        JSON is the backup format and the contract with the iOS app. Import
        restores into an empty book only.
      </p>
      <Button
        type="button"
        size="xl"
        className="w-full"
        disabled={busy}
        onClick={() => void handleExport()}
      >
        Export JSON
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label="Import JSON backup"
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
        Import JSON
      </Button>
      {bookHasAssets && (
        <p className="text-sm text-muted-foreground">
          Import is available only when this book has no assets.
        </p>
      )}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  )
}
