"use client"

import { UserRound } from "lucide-react"
import type { InitDataType as InitData } from "@tma.js/sdk-react"

interface UserAvatarProps {
  user?: InitData["user"]
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-9 w-9 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-lg",
}

const iconSizes = {
  sm: 18,
  md: 24,
  lg: 30,
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const initials = getInitials(user)

  if (user?.photo_url) {
    return (
      <img
        src={user.photo_url}
        alt={user.first_name ? `${user.first_name} avatar` : "Telegram user avatar"}
        className={`${sizeClasses[size]} shrink-0 rounded-full object-cover`}
      />
    )
  }

  return (
    <div className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full tg-button`}>
      {initials ? (
        <span className="font-semibold tg-button-text">{initials}</span>
      ) : (
        <UserRound size={iconSizes[size]} className="tg-button-text" />
      )}
    </div>
  )
}

function getInitials(user: InitData["user"] | undefined): string {
  if (!user) {
    return ""
  }

  const first = user.first_name?.trim().slice(0, 1) || ""
  const last = user.last_name?.trim().slice(0, 1) || ""
  return `${first}${last}`.toUpperCase()
}
