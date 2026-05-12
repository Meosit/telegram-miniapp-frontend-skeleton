"use client"

import { createContext, type ReactNode, useContext, useState } from "react"
import { Notification } from "@/components/ui/notification"
import { hapticFeedback } from "@/lib/telegram/methods"
import { TelegramInitDataError } from "@/lib/telegram/validation"

interface NotificationContextValue {
  showNotification: (message: string, type?: "success" | "error") => void
  showErrorNotification: (error: unknown) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState({
    message: "",
    type: "success" as "success" | "error",
    isVisible: false,
  })

  function showNotification(message: string, type: "success" | "error" = "success") {
    setNotification({ message, type, isVisible: true })
    hapticFeedback.notificationOccurred(type)
  }

  function showErrorNotification(error: unknown) {
    showNotification(error instanceof Error ? error.message : String(error), "error")
  }

  function hideNotification() {
    setNotification((current) => ({ ...current, isVisible: false }))
  }

  return (
    <NotificationContext.Provider value={{ showNotification, showErrorNotification }}>
      {children}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new TelegramInitDataError("useNotification must be used within NotificationProvider.")
  }
  return context
}
