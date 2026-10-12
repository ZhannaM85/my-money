import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Pencil, Save, X } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { Button } from '@/shared/ui/button'
import { useConfirm } from '@/shared/ui/confirm-dialog'
import { Input } from '@/shared/ui/input'
import { PageHeader } from '@/shared/ui/page-header'

export function AssetNameEditor({
  name,
  description,
  onSave,
}: {
  name: string
  description: string
  onSave: (name: string) => Promise<void>
}) {
  const t = useTranslation()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [confirm, confirmDialog] = useConfirm()
  const inputRef = useRef<HTMLInputElement>(null)
  const editRef = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  const errorId = useId()
  const trimmed = draft.trim()
  const error = !trimmed
    ? t.asset.nameRequired
    : saveError
      ? t.asset.renameFailed
      : undefined

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    } else if (wasEditing.current) {
      editRef.current?.focus()
    }
    wasEditing.current = editing
  }, [editing])

  async function save(event: FormEvent) {
    event.preventDefault()
    if (saving || !trimmed) return
    setSaving(true)
    setSaveError(false)
    try {
      await onSave(trimmed)
      setEditing(false)
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  async function cancel() {
    if (saving) return
    const discard = await confirm({
      message: t.asset.cancelRenameConfirm,
      confirmLabel: t.asset.discardRename,
      cancelLabel: t.asset.keepRenaming,
    })
    if (!discard) return
    setDraft(name)
    setSaveError(false)
    setEditing(false)
  }

  return (
    <>
      {editing ? (
        <div className="flex flex-col gap-1">
          <form
            className="flex min-w-0 items-center gap-2"
            onSubmit={(event) => void save(event)}
          >
            <Input
              ref={inputRef}
              aria-label={t.asset.name}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="min-w-0 flex-1"
              value={draft}
              disabled={saving}
              onChange={(event) => {
                setDraft(event.target.value)
                setSaveError(false)
              }}
            />
            <Button
              type="submit"
              size="icon-xl"
              aria-label={t.asset.saveName}
              disabled={saving || !trimmed}
            >
              <Save aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-xl"
              aria-label={t.asset.cancelRename}
              disabled={saving}
              onClick={() => void cancel()}
            >
              <X aria-hidden />
            </Button>
          </form>
          {error && (
            <p id={errorId} role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      ) : (
        <PageHeader
          title={name}
          description={description}
          action={
            <Button
              ref={editRef}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t.asset.renameAsset}
              onClick={() => {
                setDraft(name)
                setSaveError(false)
                setEditing(true)
              }}
            >
              <Pencil aria-hidden />
            </Button>
          }
        />
      )}
      {confirmDialog}
    </>
  )
}
