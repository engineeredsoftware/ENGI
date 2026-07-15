"use client"

import React, { ReactNode, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmModalProps {
  open: boolean
  title?: string
  description?: string | ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

// Generic confirmation modal – matches modal styles used in profile-step
export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  const containerRef = useRef<HTMLDivElement>(null)

  // Focus trap within modal
  useEffect(() => {
    if (!open) return
    const root = containerRef.current
    if (!root) return
    // Focus first focusable element on open
    const firstFocus = root.querySelector<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
    firstFocus?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = root.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    root.addEventListener('keydown', handleTab)
    return () => root.removeEventListener('keydown', handleTab)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={containerRef}
            className="w-full max-w-sm rounded-lg bg-card border shadow-surface p-6 relative focus:outline-none"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4">
              <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-md border text-sm hover:bg-secondary"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 rounded-md text-sm text-white ${
                  variant === 'danger'
                    ? 'bg-destructive hover:bg-destructive/90'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
