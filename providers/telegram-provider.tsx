"use client"

import {
  initData as sdkInitData,
  miniApp,
  themeParams,
  type InitDataType as InitData,
  type Platform,
} from "@tma.js/sdk-react"
import { postEvent, retrieveLaunchParams } from "@tma.js/bridge"
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { initTelegram } from "@/lib/telegram/init"
import { detectTelegramInitMode, type TelegramInitModeInfo } from "@/lib/telegram/launch-mode"
import { parseStartParam, type ParsedStartParam } from "@/lib/telegram/start-param"
import { TelegramInitDataError } from "@/lib/telegram/validation"

interface TelegramContextValue {
  initDataRaw?: string
  initData?: InitData
  user?: InitData["user"]
  startParam?: string
  parsedStartParam: ParsedStartParam
  platform?: Platform
  initMode: TelegramInitModeInfo
  isTelegram: boolean
  isMocked: boolean
  debugEnabled: boolean
  isReady: boolean
  error?: Error
}

const TelegramContext = createContext<TelegramContextValue | undefined>(undefined)

const initialValue: TelegramContextValue = {
  parsedStartParam: parseStartParam(undefined),
  initMode: detectTelegramInitMode({ isTelegram: false }),
  isTelegram: false,
  isMocked: false,
  debugEnabled: false,
  isReady: false,
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<TelegramContextValue>(initialValue)

  useEffect(() => {
    let cancelled = false

    async function initialize() {
      try {
        const initResult = await initTelegram()
        const nextValue = readTelegramState(initResult.isTelegram, initResult.isMocked, initResult.debugEnabled)

        if (!cancelled) {
          setValue(nextValue)
        }
      } catch (error) {
        if (!cancelled) {
          setValue({
            ...initialValue,
            isReady: true,
            error: error instanceof Error ? error : new TelegramInitDataError(String(error)),
          })
        }
      }
    }

    void initialize()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!value.isReady || !value.isTelegram) {
      return
    }

    const unsubscribeTheme = themeParams.state.sub(() => {
      try {
        const sectionColor = themeParams.sectionBgColor()
        if (sectionColor) {
          postEvent("web_app_set_header_color", { color: sectionColor })
        }
      } catch {
        // Header color is best-effort across clients.
      }
    })

    const unsubscribeDark = miniApp.isDark.sub((isDark) => {
      document.documentElement.style.setProperty("--tg-theme-success-text", isDark ? "#2ECC71" : "#4CAF50")
    })

    return () => {
      unsubscribeTheme()
      unsubscribeDark()
    }
  }, [value.isReady, value.isTelegram])

  const contextValue = useMemo(() => value, [value])

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram(): TelegramContextValue {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new TelegramInitDataError("useTelegram must be used within TelegramProvider.")
  }
  return context
}

function readTelegramState(isTelegram: boolean, isMocked: boolean, debugEnabled: boolean): TelegramContextValue {
  if (!isTelegram) {
    return {
      ...initialValue,
      isReady: true,
      isTelegram: false,
      isMocked,
      debugEnabled,
    }
  }

  const initDataRaw = safeRead(sdkInitData.raw)
  const initData = safeRead(sdkInitData.state)
  const launchParams = safeRead(() => retrieveLaunchParams()) as {
    tgWebAppPlatform?: Platform
    tgWebAppStartParam?: string
    tgWebAppBotInline?: boolean
  } | undefined
  const startParam = initData?.start_param || launchParams?.tgWebAppStartParam || undefined
  const initMode = detectTelegramInitMode({
    isTelegram,
    initDataRaw,
    initData,
    launchParams,
  })

  return {
    initDataRaw,
    initData,
    user: initData?.user,
    startParam,
    parsedStartParam: parseStartParam(startParam),
    platform: launchParams?.tgWebAppPlatform,
    initMode,
    isTelegram,
    isMocked,
    debugEnabled,
    isReady: true,
  }
}

function safeRead<T>(reader: () => T): T | undefined {
  try {
    return reader()
  } catch {
    return undefined
  }
}
