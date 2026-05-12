export type ExampleScreen = "home" | "items" | "profile" | "item-detail"

export interface ExampleItem {
  id: string
  title: string
  description: string
  status: "Active" | "Queued" | "Done"
}
