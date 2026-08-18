import { useEffect, useState } from 'react'

const NON_KEYBOARD_INPUT_TYPES = new Set([
  'button',
  'submit',
  'checkbox',
  'radio',
  'range',
  'file',
  'color',
  'reset',
  'image',
  'date',
  'time',
  'datetime-local',
  'month',
  'week',
])

/** True when `el` is a control that typically opens the soft keyboard. */
export function opensKeyboard(el: Element | null): boolean {
  if (!el) return false
  if (el.tagName === 'TEXTAREA') return true
  if (el.tagName === 'INPUT') {
    return !NON_KEYBOARD_INPUT_TYPES.has((el as HTMLInputElement).type)
  }
  return false
}

const FOCUS_SETTLE_FALLBACK_DELAY_MS = 100

/**
 * Whether a text-entry control currently has focus (#25). Hide the fixed
 * tab bar while the iOS keyboard is likely open so `position: fixed` cannot
 * float mid-page.
 *
 * Transitions *into* a keyboard field apply immediately. Transitions *out*
 * wait for `pointerup` (or a short fallback) so the bar cannot reappear
 * mid-gesture and steal the tap that dismissed the field.
 */
export function useIsTextInputFocused(): boolean {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    let settled = true
    let fallback: ReturnType<typeof setTimeout> | undefined
    function settle() {
      settled = true
      document.removeEventListener('pointerup', settle)
      clearTimeout(fallback)
      setIsFocused(opensKeyboard(document.activeElement))
    }
    function handleFocusChange() {
      if (!settled) {
        settled = true
        document.removeEventListener('pointerup', settle)
        clearTimeout(fallback)
      }
      if (opensKeyboard(document.activeElement)) {
        setIsFocused(true)
        return
      }
      settled = false
      fallback = setTimeout(settle, FOCUS_SETTLE_FALLBACK_DELAY_MS)
      document.addEventListener('pointerup', settle, { once: true })
    }
    document.addEventListener('focusin', handleFocusChange)
    document.addEventListener('focusout', handleFocusChange)
    return () => {
      document.removeEventListener('focusin', handleFocusChange)
      document.removeEventListener('focusout', handleFocusChange)
      document.removeEventListener('pointerup', settle)
      clearTimeout(fallback)
    }
  }, [])

  return isFocused
}
