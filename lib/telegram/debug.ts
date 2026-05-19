import type { InitDataType as InitData } from "@tma.js/sdk-react"

const DEFAULT_DEBUG_USER_IDS = [137847053]

export function getDebugUserIds(): number[] {
  const raw = process.env.NEXT_PUBLIC_TMA_DEBUG_USER_IDS
  if (!raw) {
    return DEFAULT_DEBUG_USER_IDS
  }

  return raw
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter(Number.isFinite)
}

export function isDebugStartParam(startParam: string | undefined): boolean {
  if (!startParam) {
    return false
  }

  const normalized = startParam.toLowerCase()
  return normalized.endsWith("debug") || normalized.includes("debug=true")
}

export function canEnableDebugFromInitData(initData: InitData | undefined, startParam: string | undefined): boolean {
  const userId = initData?.user?.id
  if (!userId || !isDebugStartParam(startParam)) {
    return false
  }

  return getDebugUserIds().includes(userId)
}
