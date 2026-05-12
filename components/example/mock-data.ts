import type { ExampleItem } from "@/types/example"

export const mockItems: ExampleItem[] = [
  {
    id: "alpha",
    title: "Alpha checklist",
    description: "A mock item used to demonstrate list-to-detail navigation.",
    status: "Active",
  },
  {
    id: "bravo",
    title: "Bravo report",
    description: "Shows how route params can be carried on the navigation stack.",
    status: "Queued",
  },
  {
    id: "charlie",
    title: "Charlie summary",
    description: "A completed item with the same reusable row component.",
    status: "Done",
  },
]
