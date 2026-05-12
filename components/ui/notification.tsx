"use client"

import { AlertCircle, CheckCircle, X } from "lucide-react"
import { useEffect } from "react"

interface NotificationProps {
  message: string
  type: "success" | "error"
  isVisible: boolean
  onClose: () => void
}

export function Notification({ message, type, isVisible, onClose }: NotificationProps) {
  useEffect(() => {
    if (!isVisible) {
      return
    }

    const timer = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(timer)
  }, [isVisible, onClose])

  if (!isVisible) {
    return null
  }

  const Icon = type === "error" ? AlertCircle : CheckCircle

  return (
    <div className="fixed left-4 right-4 top-4 z-50 flex justify-center">
      <div className={`flex w-full max-w-sm items-center rounded-lg p-3 shadow-lg ${type === "error" ? "tg-destructive-bg" : "tg-success-bg"}`}>
        <Icon size={20} className="mr-3 tg-button-text" />
        <span className="flex-1 text-sm font-medium tg-button-text">{message}</span>
        <button className="ml-2 rounded-full p-1 tg-button-text tg-scale-on-press" onClick={onClose} aria-label="Close notification">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
