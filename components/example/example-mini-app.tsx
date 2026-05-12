"use client"

import { Home, ListChecks, UserRound } from "lucide-react"
import { BottomNavigation, type NavigationTab } from "@/components/ui/bottom-navigation"
import { ErrorScreen } from "@/components/ui/error-screen"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { HomeScreen } from "@/components/example/home-screen"
import { ItemDetailScreen } from "@/components/example/item-detail-screen"
import { ItemsScreen } from "@/components/example/items-screen"
import { ProfileScreen } from "@/components/example/profile-screen"
import { NavigationProvider, useNavigation, type NavigationConfig } from "@/providers/navigation-provider"
import { useTelegram } from "@/providers/telegram-provider"
import type { ExampleScreen } from "@/types/example"

const navigationConfig: NavigationConfig<ExampleScreen> = {
  initialScreen: "home",
  tabScreens: ["home", "items", "profile"],
  backButtonScreens: ["item-detail"],
  screenToComponent: {
    home: () => <HomeScreen />,
    items: () => <ItemsScreen />,
    profile: () => <ProfileScreen />,
    "item-detail": () => <ItemDetailScreen />,
  },
}

export function ExampleMiniApp() {
  const telegram = useTelegram()

  if (!telegram.isReady) {
    return <LoadingScreen />
  }

  if (telegram.error) {
    return <ErrorScreen error={telegram.error} onRetry={() => window.location.reload()} />
  }

  return (
    <NavigationProvider config={navigationConfig}>
      <ExampleShell />
    </NavigationProvider>
  )
}

function ExampleShell() {
  const navigation = useNavigation<ExampleScreen>()
  const activeTab = getActiveTab(navigation.currentScreen)
  const tabs: NavigationTab[] = [
    { id: "home", label: "Home", icon: Home, isActive: activeTab === "home" },
    { id: "items", label: "Items", icon: ListChecks, isActive: activeTab === "items" },
    { id: "profile", label: "Profile", icon: UserRound, isActive: activeTab === "profile" },
  ]

  return (
    <main className="miniapp-shell flex flex-col">
      <section className="flex-1">
        {navigation.renderScreen()}
      </section>
      {navigation.isTabScreen && (
        <BottomNavigation
          tabs={tabs}
          onTabChange={(tabId) => navigation.restartFrom(tabId as ExampleScreen)}
        />
      )}
    </main>
  )
}

function getActiveTab(screen: ExampleScreen): ExampleScreen {
  if (screen === "item-detail") {
    return "items"
  }
  return screen
}
