'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keyboard behaviour for a modal or drawer:
 * - moves focus into the panel ([data-autofocus] first, else the first control),
 * - keeps Tab / Shift+Tab inside it,
 * - closes on Escape,
 * - returns focus to whatever opened it.
 *
 * Pair with role="dialog", aria-modal="true" and aria-labelledby on the panel.
 */
export function useModalA11y(panelRef: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const panel  = panelRef.current
    const items  = () => Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])

    const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? items()[0] ?? panel
    first?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); closeRef.current(); return }
      if (e.key !== 'Tab') return
      const list = items()
      if (list.length === 0) { e.preventDefault(); return }
      const head = list[0]
      const tail = list[list.length - 1]
      if (e.shiftKey && document.activeElement === head) { e.preventDefault(); tail.focus() }
      else if (!e.shiftKey && document.activeElement === tail) { e.preventDefault(); head.focus() }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [open, panelRef])
}
