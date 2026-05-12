"use client"

import { ExampleMiniApp } from "@/components/example/example-mini-app"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { ErrorScreen } from "@/components/ui/error-screen"
import { NotificationProvider } from "@/providers/notification-provider"
import { TelegramProvider } from "@/providers/telegram-provider"

export default function RootPage() {
  return (
    <ErrorBoundary fallback={UnhandledErrorFallback}>
      <TelegramProvider>
        <NotificationProvider>
          <ExampleMiniApp />
        </NotificationProvider>
      </TelegramProvider>
    </ErrorBoundary>
  )
}

function UnhandledErrorFallback({ error }: { error: Error | string | null }) {
  return (
    <ErrorScreen
      title="Something went wrong"
      message="An unexpected UI error occurred. Refresh the Mini App and try again."
      error={error}
      onRetry={() => window.location.reload()}
    />
  )
}
