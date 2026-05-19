import { emitEvent, isTMA, mockTelegramEnv } from "@tma.js/bridge"
import { mockTheme } from "@/lib/telegram/themes"

const HARDCODED_MOCK_USER = JSON.stringify({
  id: 123456789,
  first_name: "Hardcoded",
  last_name: "User",
  username: "hardcoded_user",
  photo_url: "https://i.pravatar.cc/300?u=telegram-miniapp-hardcoded-user",
})

export async function mockEnv(forceDevelopment = false): Promise<boolean> {
  if (process.env.NODE_ENV !== "development" && !forceDevelopment) {
    return false
  }

  const isTelegram = await isTMA("complete", { timeout: 100 }).catch(() => false)
  if (isTelegram) {
    return false
  }

  const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const
  const mockUser = process.env.NEXT_PUBLIC_TMA_MOCK_USER || HARDCODED_MOCK_USER

  const queryStartParam = new URLSearchParams(window.location.search).get("tgWebAppStartParam")
    || new URLSearchParams(window.location.search).get("startapp")
  const startParam = queryStartParam || process.env.NEXT_PUBLIC_TMA_MOCK_START_PARAM || ""
  const initData = new URLSearchParams([
    ["auth_date", `${Math.floor(Date.now() / 1000)}`],
    ["hash", "mock-hash"],
    ["signature", "mock-signature"],
    ["start_param", startParam],
  ])

  if (mockUser) {
    initData.set("user", mockUser)
  }

  mockTelegramEnv({
    onEvent(event) {
      if (event.name === "web_app_request_viewport") {
        return emitEvent("viewport_changed", {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        })
      }

      if (event.name === "web_app_request_content_safe_area") {
        return emitEvent("content_safe_area_changed", noInsets)
      }

      if (event.name === "web_app_request_safe_area") {
        return emitEvent("safe_area_changed", noInsets)
      }
    },
    launchParams: new URLSearchParams([
      ["tgWebAppThemeParams", JSON.stringify(mockTheme)],
      ["tgWebAppStartParam", startParam],
      ["tgWebAppData", initData.toString()],
      ["tgWebAppVersion", "8.4"],
      ["tgWebAppPlatform", "tdesktop"],
    ]),
  })

  console.info("Telegram environment was mocked for local development.")
  return true
}
