"use client"

import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { mockItems } from "@/components/example/mock-data"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { hapticFeedback } from "@/lib/telegram/methods"
import { useNotification } from "@/providers/notification-provider"
import { useNavigation } from "@/providers/navigation-provider"
import type { ExampleScreen } from "@/types/example"

export function ItemDetailScreen() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const navigation = useNavigation<ExampleScreen>()
  const { showNotification } = useNotification()
  const itemId = typeof navigation.currentParams?.itemId === "string" ? navigation.currentParams.itemId : undefined
  const item = mockItems.find((candidate) => candidate.id === itemId) || mockItems[0]

  function handleComplete() {
    hapticFeedback.notificationOccurred("success")
    showNotification(`${item.title} marked as handled`)
  }

  function handleArchive() {
    hapticFeedback.notificationOccurred("warning")
    setIsConfirmOpen(false)
    showNotification(`${item.title} archived`)
    navigation.goBack({ haptic: "none" })
  }

  return (
    <div className="min-h-screen p-5">
      <header className="flex items-center gap-3 pt-3">
        <button
          className="tg-card flex h-10 w-10 items-center justify-center rounded-full tg-scale-on-press"
          onClick={() => navigation.goBack()}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-sm tg-hint-text">Detail</p>
          <h1 className="truncate text-xl font-semibold tg-text">{item.title}</h1>
        </div>
      </header>

      <section className="tg-card mt-6 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm tg-hint-text">Status</p>
            <p className="mt-1 font-medium tg-accent-text">{item.status}</p>
          </div>
          <CheckCircle2 size={24} className="tg-accent-text" />
        </div>
        <p className="mt-5 text-sm leading-6 tg-subtitle-text">{item.description}</p>
      </section>

      <button className="mt-5 w-full rounded-lg px-4 py-3 font-medium tg-button tg-scale-on-press" onClick={handleComplete}>
        Trigger success feedback
      </button>
      <button
        className="mt-3 w-full rounded-lg px-4 py-3 font-medium tg-destructive-badge tg-scale-on-press"
        onClick={() => {
          hapticFeedback.impactOccurred("medium")
          setIsConfirmOpen(true)
        }}
      >
        Archive with confirmation
      </button>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Archive item?"
        description="This demonstrates a reusable confirmation modal for actions that need an explicit user decision."
        confirmLabel="Archive"
        variant="destructive"
        onConfirm={handleArchive}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}
