import {
  backButton,
  hapticFeedback as sdkHapticFeedback,
  openInvoice as sdkOpenInvoice,
  openLink as sdkOpenLink,
  postEvent,
  shareMessage as sdkShareMessage,
  shareURL as sdkShareURL,
  type InvoiceStatus,
  type MethodName,
  type OpenLinkOptions,
} from "@telegram-apps/sdk-react"

export const hapticFeedback = {
  impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") {
    if (sdkHapticFeedback.impactOccurred.isAvailable()) {
      sdkHapticFeedback.impactOccurred(style)
    }
  },

  notificationOccurred(type: "success" | "error" | "warning") {
    if (sdkHapticFeedback.notificationOccurred.isAvailable()) {
      sdkHapticFeedback.notificationOccurred(type)
    }
  },

  selectionChanged() {
    if (sdkHapticFeedback.selectionChanged.isAvailable()) {
      sdkHapticFeedback.selectionChanged()
    }
  },
}

export const miniAppBackButton = {
  show() {
    if (backButton.show.isAvailable()) {
      backButton.show()
    }
  },

  hide() {
    if (backButton.hide.isAvailable()) {
      backButton.hide()
    }
  },

  onClick(callback: () => void): VoidFunction | undefined {
    if (backButton.onClick.isAvailable()) {
      return backButton.onClick(callback)
    }
    return undefined
  },

  isSupported(): boolean {
    return backButton.isSupported()
  },
}

export function openExternalLink(url: string, options?: OpenLinkOptions): boolean {
  if (sdkOpenLink.isAvailable()) {
    sdkOpenLink(url, options)
    return true
  }

  window.open(url, "_blank", "noopener,noreferrer")
  return false
}

export function shareURL(url: string, text?: string): boolean {
  if (sdkShareURL.isAvailable()) {
    sdkShareURL(url, text)
    return true
  }

  if (navigator.share) {
    void navigator.share({ url, text }).catch(() => undefined)
    return true
  }

  if (navigator.clipboard) {
    void navigator.clipboard.writeText(url)
  }
  return false
}

export async function shareMessage(messageId: string): Promise<boolean> {
  if (!sdkShareMessage.isAvailable()) {
    return false
  }

  await sdkShareMessage(messageId)
  return true
}

export async function openInvoice(invoiceUrl: string): Promise<InvoiceStatus | "unsupported"> {
  if (!sdkOpenInvoice.isAvailable()) {
    return "unsupported"
  }

  return sdkOpenInvoice(invoiceUrl, "url")
}

export function safePostEvent<M extends MethodName>(
  method: M,
  params?: unknown,
): boolean {
  try {
    const send = postEvent as (method: MethodName, params?: unknown) => void
    if (params === undefined) {
      send(method)
    } else {
      send(method, params)
    }
    return true
  } catch {
    return false
  }
}
