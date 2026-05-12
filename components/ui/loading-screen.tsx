"use client"

interface LoadingScreenProps {
  title?: string
  message?: string
}

export function LoadingScreen({
  title = "Loading",
  message = "Preparing Telegram Mini App...",
}: LoadingScreenProps) {
  return (
    <main className="miniapp-shell flex min-h-screen items-center justify-center p-6">
      <section className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-t-transparent border-tg-button" />
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tg-text">{title}</h1>
          <p className="text-sm leading-6 tg-subtitle-text">{message}</p>
        </div>
      </section>
    </main>
  )
}
