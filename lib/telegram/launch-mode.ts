import type { InitDataType as InitData, LaunchParams } from "@tma.js/sdk-react"

export type TelegramInitMode =
  | "browser"
  | "unknown-telegram"
  | "empty-init-data"
  | "direct-link"
  | "attachment-menu"
  | "attachment-menu-link"
  | "inline"
  | "keyboard-button"

export interface TelegramInitModeInfo {
  mode: TelegramInitMode
  label: string
  description: string
}

export function detectTelegramInitMode(options: {
  isTelegram: boolean
  initDataRaw?: string
  initData?: InitData
  launchParams?: Pick<LaunchParams, "tgWebAppBotInline" | "tgWebAppStartParam">
}): TelegramInitModeInfo {
  const { isTelegram, initDataRaw, initData, launchParams } = options

  if (!isTelegram) {
    return modeInfo("browser")
  }

  if (!initDataRaw && !initData) {
    return modeInfo("empty-init-data")
  }

  if (!initData) {
    return modeInfo("unknown-telegram")
  }

  if (initData.chat || initData.receiver) {
    return modeInfo(initData.start_param ? "attachment-menu-link" : "attachment-menu")
  }

  if (initData.chat_type || initData.chat_instance || launchParams?.tgWebAppStartParam) {
    return modeInfo("direct-link")
  }

  if (launchParams?.tgWebAppBotInline || initData.query_id) {
    return modeInfo("inline")
  }

  if (initData.user && initData.auth_date && initData.hash) {
    return modeInfo("keyboard-button")
  }

  return modeInfo("unknown-telegram")
}

function modeInfo(mode: TelegramInitMode): TelegramInitModeInfo {
  switch (mode) {
    case "browser":
      return {
        mode,
        label: "Browser",
        description: "The app is running outside Telegram, usually with local development mocks.",
      }
    case "empty-init-data":
      return {
        mode,
        label: "Empty init data",
        description: "Telegram provided no parsed init data. This can happen for keyboard-button or inline launches depending on client context.",
      }
    case "direct-link":
      return {
        mode,
        label: "Direct link",
        description: "Init data includes direct-link fields such as chat_type, chat_instance, or tgWebAppStartParam.",
      }
    case "attachment-menu":
      return {
        mode,
        label: "Attachment menu",
        description: "Init data includes chat or receiver fields from the attachment menu.",
      }
    case "attachment-menu-link":
      return {
        mode,
        label: "Attachment menu link",
        description: "Attachment-menu launch with start_param/startattach data.",
      }
    case "inline":
      return {
        mode,
        label: "Inline",
        description: "Launch data indicates inline mode or includes query_id for answerWebAppQuery.",
      }
    case "keyboard-button":
      return {
        mode,
        label: "Keyboard button",
        description: "Init data has the basic user/auth/hash shape but no direct-link, attachment-menu, or inline indicators.",
      }
    case "unknown-telegram":
      return {
        mode,
        label: "Unknown Telegram",
        description: "Telegram was detected, but the available init fields do not match a known launch shape.",
      }
  }
}
