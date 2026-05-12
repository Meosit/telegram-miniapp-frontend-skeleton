"use client"

import type { LucideIcon } from "lucide-react"
import { hapticFeedback } from "@/lib/telegram/methods"

export interface NavigationTab {
  id: string
  label: string
  icon: LucideIcon
  isActive?: boolean
}

interface BottomNavigationProps {
  tabs: NavigationTab[]
  onTabChange: (tabId: string) => void
}

export function BottomNavigation({ tabs, onTabChange }: BottomNavigationProps) {
  function handleTabClick(tabId: string) {
    hapticFeedback.impactOccurred("light")
    onTabChange(tabId)
  }

  return (
    <nav className="sticky bottom-0 border-t border-tg-section-separator tg-section-bg">
      <div className="grid grid-cols-3 px-4 pb-7 pt-3">
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} onClick={() => handleTabClick(tab.id)} />
        ))}
      </div>
    </nav>
  )
}

function TabButton({ tab, onClick }: { tab: NavigationTab; onClick: () => void }) {
  const Icon = tab.icon

  return (
    <button
      className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md tg-scale-on-press ${
        tab.isActive ? "tg-accent-text" : "tg-subtitle-text"
      }`}
      onClick={onClick}
      aria-current={tab.isActive ? "page" : undefined}
    >
      <Icon size={24} />
      <span className="text-xs font-medium leading-none">{tab.label}</span>
    </button>
  )
}
