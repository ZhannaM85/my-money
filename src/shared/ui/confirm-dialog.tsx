import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '@/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export type ConfirmOptions = {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  message,
  confirmLabel,
  cancelLabel,
  destructive = true,
  onConfirm,
  onCancel,
}: {
  open: boolean
  message: string
  confirmLabel: string
  cancelLabel: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    panelRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40"
        role="presentation"
        onClick={onCancel}
      />
      <div
        ref={panelRef}
        role="dialog"
        data-state="open"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-md bg-card p-4 shadow-lg ring-1 ring-foreground/10',
          'rounded-t-3xl pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-4',
        )}
      >
        <p id={titleId} className="text-sm text-foreground">
          {message}
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            size="xl"
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function useConfirm(): [
  (messageOrOptions: string | ConfirmOptions) => Promise<boolean>,
  ReactNode,
] {
  const t = useTranslation()
  const [request, setRequest] = useState<ConfirmOptions | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const finish = useCallback((ok: boolean) => {
    resolveRef.current?.(ok)
    resolveRef.current = null
    setRequest(null)
  }, [])
  const onConfirm = useCallback(() => finish(true), [finish])
  const onCancel = useCallback(() => finish(false), [finish])

  const confirm = useCallback((messageOrOptions: string | ConfirmOptions) => {
    const next =
      typeof messageOrOptions === 'string'
        ? { message: messageOrOptions }
        : messageOrOptions
    return new Promise<boolean>((resolve) => {
      resolveRef.current?.(false)
      resolveRef.current = resolve
      setRequest(next)
    })
  }, [])

  useEffect(() => {
    return () => {
      resolveRef.current?.(false)
      resolveRef.current = null
    }
  }, [])

  const dialog = (
    <ConfirmDialog
      open={request !== null}
      message={request?.message ?? ''}
      confirmLabel={request?.confirmLabel ?? t.common.ok}
      cancelLabel={request?.cancelLabel ?? t.common.cancel}
      destructive={request?.destructive ?? true}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )

  return [confirm, dialog]
}
