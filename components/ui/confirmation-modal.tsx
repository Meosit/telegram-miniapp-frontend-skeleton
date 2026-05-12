"use client"

import { AlertCircle, X } from "lucide-react"
import { useEffect } from "react"

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) {
    return null
  }

  const isDestructive = variant === "destructive"

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <section className="tg-card w-full max-w-sm p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDestructive ? "tg-destructive-badge" : "tg-accent-badge"}`}>
            <AlertCircle size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tg-text">{title}</h2>
            {description && <p className="mt-1 text-sm leading-6 tg-subtitle-text">{description}</p>}
          </div>
          <button className="rounded-full p-1 tg-hint-text tg-scale-on-press" onClick={onCancel} aria-label="Close confirmation modal">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="rounded-lg px-4 py-3 text-sm font-medium tg-bg tg-scale-on-press" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`rounded-lg px-4 py-3 text-sm font-medium tg-scale-on-press ${isDestructive ? "tg-destructive-bg tg-button-text" : "tg-button"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
