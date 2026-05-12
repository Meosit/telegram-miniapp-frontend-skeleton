import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Telegram Mini App Skeleton",
  description: "A generic Telegram Mini App frontend starter",
}

export const viewport: Viewport = {
  userScalable: false,
  maximumScale: 1,
  width: "device-width",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} tg-bg tg-text`}>
        {children}
      </body>
    </html>
  )
}
