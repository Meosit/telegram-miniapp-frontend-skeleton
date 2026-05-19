import {
  backButton,
  init as initSDK,
  initData,
  miniApp,
  themeParams,
  viewport,
  type ThemeParamsType as ThemeParams,
} from "@tma.js/sdk-react"
import {
  emitEvent,
  isTMA,
  mockTelegramEnv,
  postEvent,
  retrieveLaunchParams,
  setDebug,
} from "@tma.js/bridge"
import { canEnableDebugFromInitData } from "@/lib/telegram/debug"
import { mockEnv } from "@/lib/telegram/mock-env"

let isInitialized = false
let isInitializing = false
let isMocked = false
let isDebugEnabled = false

export interface TelegramInitOptions {
  debug?: boolean
  eruda?: boolean
  forceMock?: boolean
}

export interface TelegramInitResult {
  isTelegram: boolean
  isMocked: boolean
  debugEnabled: boolean
}

export function initEruda(): void {
  void import("eruda").then(({ default: eruda }) => {
    eruda.init()
    eruda.position({ x: window.innerWidth - 50, y: 0 })
  })
}

export function isTelegramSDKInitialized(): boolean {
  return isInitialized
}

export function wasTelegramEnvMocked(): boolean {
  return isMocked
}

export async function initTelegram(options: TelegramInitOptions = {}): Promise<TelegramInitResult> {
  if (isInitialized) {
    return { isTelegram: true, isMocked, debugEnabled: isDebugEnabled }
  }

  if (isInitializing) {
    return waitForInitialization()
  }

  isInitializing = true

  try {
    const detectedTMA = await isTMA("complete", { timeout: 100 }).catch(() => false)
    if (!detectedTMA) {
      isMocked = await mockEnv(Boolean(options.forceMock))
    }

    const launchParams = safeRetrieveLaunchParams()
    if (!launchParams) {
      return { isTelegram: false, isMocked, debugEnabled: false }
    }

    const startParam = launchParams.tgWebAppData?.start_param || launchParams.tgWebAppStartParam
    const debug = options.debug
      ?? (process.env.NODE_ENV === "development" || canEnableDebugFromInitData(launchParams.tgWebAppData, startParam))
    isDebugEnabled = debug

    setDebug(debug)
    initSDK()
    isInitialized = true

    if (options.eruda ?? debug) {
      initEruda()
    }

    if (launchParams.tgWebAppPlatform === "macos") {
      patchMacOSClientQuirks()
    }

    backButton.mount.ifAvailable()
    initData.restore()

    if (themeParams.mount.isAvailable()) {
      themeParams.mount()
      themeParams.bindCssVars.ifAvailable()
    }

    if (miniApp.mount.isAvailable()) {
      miniApp.mount()
    }

    if (viewport.mount.isAvailable()) {
      await viewport.mount()
      viewport.bindCssVars.ifAvailable()
      viewport.expand.ifAvailable()
    }

    try {
      postEvent("web_app_setup_swipe_behavior", { allow_vertical_swipe: false })
    } catch {
      // Some clients do not support this method yet.
    }

    return { isTelegram: true, isMocked, debugEnabled: debug }
  } finally {
    isInitializing = false
  }
}

function safeRetrieveLaunchParams() {
  try {
    return retrieveLaunchParams()
  } catch {
    return undefined
  }
}

function waitForInitialization(): Promise<TelegramInitResult> {
  return new Promise((resolve) => {
    const check = () => {
      if (!isInitializing) {
        resolve({ isTelegram: isInitialized, isMocked, debugEnabled: isDebugEnabled })
        return
      }
      window.setTimeout(check, 10)
    }
    check()
  })
}

function patchMacOSClientQuirks(): void {
  let firstThemeSent = false

  mockTelegramEnv({
    onEvent(event, next) {
      if (event.name === "web_app_request_theme") {
        let nextThemeParams: ThemeParams = {}
        if (firstThemeSent) {
          nextThemeParams = themeParams.state()
        } else {
          firstThemeSent = true
          nextThemeParams = safeRetrieveLaunchParams()?.tgWebAppThemeParams || {}
        }
        return emitEvent("theme_changed", { theme_params: nextThemeParams })
      }

      if (event.name === "web_app_request_safe_area") {
        return emitEvent("safe_area_changed", {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        })
      }

      next()
    },
  })
}
