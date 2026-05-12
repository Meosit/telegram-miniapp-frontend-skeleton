"use client"

import { AlertCircle, RotateCcw } from "lucide-react"

interface ErrorScreenProps {
  title?: string
  message?: string
  error?: Error | string | null
  onRetry?: () => void
}

export function ErrorScreen({
  title = "Could not start the app",
  message = "Telegram initialization failed. Try reopening the Mini App or refreshing this page.",
  error,
  onRetry,
}: ErrorScreenProps) {
  return (
    <main className="miniapp-shell flex min-h-screen items-center justify-center p-6">
      <section className="tg-card w-full max-w-sm p-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full tg-destructive-badge">
          <AlertCircle size={24} />
        </div>
        <h1 className="mt-4 text-lg font-semibold tg-text">{title}</h1>
        <p className="mt-2 text-sm leading-6 tg-subtitle-text">{message}</p>
        {getErrorMessage(error) && (
          <p className="mt-3 break-words rounded-md p-3 text-xs tg-bg tg-hint-text">{getErrorMessage(error)}</p>
        )}
        {onRetry && (
          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium tg-button tg-scale-on-press" onClick={onRetry}>
            <RotateCcw size={18} />
            Retry
          </button>
        )}
      </section>
    </main>
  )
}

function getErrorMessage(error: Error | string | null | undefined): string | undefined {
  if (!error) {
    return undefined
  }

  return error instanceof Error ? error.message : error
}
