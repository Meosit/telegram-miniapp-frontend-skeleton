"use client"

import { ChevronRight } from "lucide-react"
import { mockItems } from "@/components/example/mock-data"
import { useNavigation } from "@/providers/navigation-provider"
import type { ExampleItem, ExampleScreen } from "@/types/example"

export function ItemsScreen() {
  const navigation = useNavigation<ExampleScreen>()

  return (
    <div className="space-y-5 p-5 pb-24">
      <header className="space-y-2 pt-3">
        <h1 className="text-2xl font-semibold tracking-normal tg-text">Items</h1>
        <p className="text-sm leading-6 tg-subtitle-text">
          This tab contains mock rows that push a detail screen onto the navigation stack.
        </p>
      </header>

      <div className="tg-list">
        {mockItems.map((item, index) => (
          <ItemRow
            key={item.id}
            item={item}
            isLast={index === mockItems.length - 1}
            onClick={() => navigation.navigateTo("item-detail", { itemId: item.id })}
          />
        ))}
      </div>
    </div>
  )
}

function ItemRow({ item, isLast, onClick }: { item: ExampleItem; isLast: boolean; onClick: () => void }) {
  return (
    <button className="block w-full px-4 text-left tg-scale-on-press" onClick={onClick}>
      <div className={`flex min-h-20 items-center gap-3 py-3 ${isLast ? "" : "tg-list-divider"}`}>
        <div className="tg-icon-tile">
          {item.title.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium tg-text">{item.title}</p>
            <span className="rounded px-1.5 py-0.5 text-xs tg-accent-badge">
              {item.status}
            </span>
          </div>
          <p className="mt-1 truncate text-sm tg-subtitle-text">{item.description}</p>
        </div>
        <ChevronRight size={18} className="shrink-0 tg-hint-text" />
      </div>
    </button>
  )
}
