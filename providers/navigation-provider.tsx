"use client"

import { createContext, type ReactElement, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { miniAppBackButton, hapticFeedback } from "@/lib/telegram/methods"
import { TelegramInitDataError } from "@/lib/telegram/validation"

export interface NavigationItem<TScreen extends string> {
  screen: TScreen
  params?: Record<string, unknown>
}

export interface NavigationConfig<TScreen extends string> {
  initialScreen: TScreen
  tabScreens: TScreen[]
  backButtonScreens?: TScreen[]
  screenToComponent: Record<TScreen, () => ReactElement | null>
}

interface NavigationContextValue<TScreen extends string> {
  currentScreen: TScreen
  currentParams?: Record<string, unknown>
  previousScreen?: NavigationItem<TScreen>
  canGoBack: boolean
  isTabScreen: boolean
  navigateTo: (screen: TScreen, params?: Record<string, unknown>) => void
  goBack: (options?: { haptic?: "light" | "medium" | "none" }) => void
  replaceScreen: (screen: TScreen, params?: Record<string, unknown>) => void
  restartFrom: (screen: TScreen, params?: Record<string, unknown>) => void
  renderScreen: () => ReactNode
}

const NavigationContext = createContext<NavigationContextValue<string> | undefined>(undefined)

interface NavigationProviderProps<TScreen extends string> {
  children: ReactNode
  config: NavigationConfig<TScreen>
}

export function NavigationProvider<TScreen extends string>({
  children,
  config,
}: NavigationProviderProps<TScreen>) {
  const [stack, setStack] = useState<NavigationItem<TScreen>[]>([{ screen: config.initialScreen }])
  const currentItem = stack[stack.length - 1]
  const previousItem = stack.length > 1 ? stack[stack.length - 2] : undefined
  const canGoBack = stack.length > 1
  const isTabScreen = config.tabScreens.includes(currentItem.screen)
  const shouldShowBackButton = config.backButtonScreens?.includes(currentItem.screen) ?? canGoBack

  const navigateTo = useCallback((screen: TScreen, params?: Record<string, unknown>) => {
    setStack((previous) => [...previous, { screen, params }])
    hapticFeedback.impactOccurred("light")
  }, [])

  const goBack = useCallback((options?: { haptic?: "light" | "medium" | "none" }) => {
    setStack((previous) => {
      if (previous.length < 2) {
        return previous
      }
      return previous.slice(0, -1)
    })

    const haptic = options?.haptic ?? "light"
    if (haptic !== "none") {
      hapticFeedback.impactOccurred(haptic)
    }
  }, [])

  const replaceScreen = useCallback((screen: TScreen, params?: Record<string, unknown>) => {
    setStack((previous) => {
      const next = [...previous]
      next[next.length - 1] = { screen, params }
      return next
    })
    hapticFeedback.impactOccurred("light")
  }, [])

  const restartFrom = useCallback((screen: TScreen, params?: Record<string, unknown>) => {
    setStack([{ screen, params }])
    hapticFeedback.selectionChanged()
  }, [])

  useEffect(() => {
    if (!shouldShowBackButton || !canGoBack) {
      miniAppBackButton.hide()
      return
    }

    if (!miniAppBackButton.isSupported()) {
      return
    }

    miniAppBackButton.show()
    const cleanup = miniAppBackButton.onClick(() => goBack())

    return () => {
      cleanup?.()
      miniAppBackButton.hide()
    }
  }, [canGoBack, currentItem.screen, goBack, shouldShowBackButton])

  const renderScreen = useCallback(() => {
    return stack.map((item, index) => {
      const Component = config.screenToComponent[item.screen]
      if (!Component) {
        throw new TelegramInitDataError(`No component registered for screen: ${item.screen}`)
      }

      const isActive = index === stack.length - 1
      return (
        <div key={`${item.screen}-${index}`} style={{ display: isActive ? "contents" : "none" }}>
          {Component()}
        </div>
      )
    })
  }, [config.screenToComponent, stack])

  const value = useMemo<NavigationContextValue<TScreen>>(() => ({
    currentScreen: currentItem.screen,
    currentParams: currentItem.params,
    previousScreen: previousItem,
    canGoBack,
    isTabScreen,
    navigateTo,
    goBack,
    replaceScreen,
    restartFrom,
    renderScreen,
  }), [
    canGoBack,
    currentItem.params,
    currentItem.screen,
    goBack,
    isTabScreen,
    navigateTo,
    previousItem,
    renderScreen,
    replaceScreen,
    restartFrom,
  ])

  return (
    <NavigationContext.Provider value={value as unknown as NavigationContextValue<string>}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation<TScreen extends string = string>(): NavigationContextValue<TScreen> {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new TelegramInitDataError("useNavigation must be used within NavigationProvider.")
  }
  return context as unknown as NavigationContextValue<TScreen>
}
