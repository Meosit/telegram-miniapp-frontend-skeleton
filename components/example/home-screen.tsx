"use client"

import { ExternalLink, Send } from "lucide-react"
import { useState } from "react"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { UserAvatar } from "@/components/ui/user-avatar"
import { openExternalLink, shareURL } from "@/lib/telegram/methods"
import { createTelegramAuthHeaders, requireInitDataRaw } from "@/lib/telegram/validation"
import { useNotification } from "@/providers/notification-provider"
import { useTelegram } from "@/providers/telegram-provider"

export function HomeScreen() {
  const [shouldThrowBoundaryDemo, setShouldThrowBoundaryDemo] = useState(false)
  const [isErrorConfirmOpen, setIsErrorConfirmOpen] = useState(false)
  const telegram = useTelegram()
  const { showNotification, showErrorNotification } = useNotification()

  if (shouldThrowBoundaryDemo) {
    throw new Error("Intentional demo error from HomeScreen.")
  }

  function handleShowAuthHeaders() {
    try {
      const initDataRaw = requireInitDataRaw(telegram.initDataRaw)
      console.info("Example backend auth headers:", createTelegramAuthHeaders(initDataRaw))
      showNotification("Auth headers logged to console")
    } catch (error) {
      showErrorNotification(error)
    }
  }

  return (
    <div className="space-y-5 p-5 pb-24">
      <header className="space-y-2 pt-3">
        <p className="text-sm font-medium tg-accent-text">Telegram Mini App</p>
        <h1 className="text-2xl font-semibold tracking-normal tg-text">Skeleton app</h1>
        <p className="text-sm leading-6 tg-subtitle-text">
          A generic starter for SDK initialization, launch data, Telegram methods, haptics, and navigation.
        </p>
      </header>

      <section className="tg-card p-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={telegram.user} size="sm" />
          <h2 className="text-base font-semibold tg-text">Launch data</h2>
        </div>
        <dl className="mt-4 grid gap-3 text-sm">
          <InfoRow label="Ready" value={telegram.isReady ? "Yes" : "No"} />
          <InfoRow label="Telegram" value={telegram.isTelegram ? "Yes" : "No"} />
          <InfoRow label="Mocked" value={telegram.isMocked ? "Yes" : "No"} />
          <InfoRow label="Debug" value={telegram.debugEnabled ? "Enabled" : "Disabled"} />
          <InfoRow label="Init mode" value={telegram.initMode.label} />
          <InfoRow label="Platform" value={telegram.platform || "Unknown"} />
          <InfoRow label="Start param" value={telegram.startParam || "None"} />
          <InfoRow label="User" value={telegram.user ? `${telegram.user.first_name} (${telegram.user.id})` : "Unavailable"} />
        </dl>
      </section>

      <section className="tg-card p-4">
        <h2 className="text-base font-semibold tg-text">Init mode details</h2>
        <p className="mt-2 text-sm leading-6 tg-subtitle-text">{telegram.initMode.description}</p>
      </section>

      <section className="grid gap-3">
        <button className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium tg-button tg-scale-on-press" onClick={handleShowAuthHeaders}>
          <Send size={18} />
          Log backend auth headers
        </button>
        <button
          className="rounded-lg px-4 py-3 text-sm font-medium tg-destructive-badge tg-scale-on-press"
          onClick={() => setIsErrorConfirmOpen(true)}
        >
          Throw boundary demo error
        </button>
      </section>

      <ConfirmationModal
        isOpen={isErrorConfirmOpen}
        title="Throw demo error?"
        description="This intentionally crashes the Home screen so you can verify the generic React error boundary."
        confirmLabel="Throw error"
        variant="destructive"
        onConfirm={() => {
          setIsErrorConfirmOpen(false)
          setShouldThrowBoundaryDemo(true)
        }}
        onCancel={() => setIsErrorConfirmOpen(false)}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="tg-hint-text">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium tg-text">{value}</dd>
    </div>
  )
}
