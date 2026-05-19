import type { InitDataType as InitData } from "@tma.js/sdk-react"

export class TelegramInitDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TelegramInitDataError"
  }
}

export function requireInitDataRaw(initDataRaw: string | undefined): string {
  if (!initDataRaw) {
    throw new TelegramInitDataError("Telegram initDataRaw is missing.")
  }
  return initDataRaw
}

export function requireTelegramUser(initData: InitData | undefined): NonNullable<InitData["user"]> {
  if (!initData?.user?.id) {
    throw new TelegramInitDataError("Telegram user is missing from init data.")
  }
  return initData.user
}

export function createTelegramAuthHeaders(initDataRaw: string): Record<string, string> {
  return {
    Authorization: `tma ${initDataRaw}`,
    "X-Telegram-Init-Data": initDataRaw,
  }
}

export function createTelegramJsonHeaders(initDataRaw: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...createTelegramAuthHeaders(initDataRaw),
  }
}
