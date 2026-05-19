"use client"

import { UserAvatar } from "@/components/ui/user-avatar"
import { useTelegram } from "@/providers/telegram-provider"

export function ProfileScreen() {
  const { user, initDataRaw, initData, parsedStartParam } = useTelegram()

  return (
    <div className="space-y-5 p-5 pb-24">
      <header className="space-y-2 pt-3">
        <h1 className="text-2xl font-semibold tracking-normal tg-text">Profile</h1>
        <p className="text-sm leading-6 tg-subtitle-text">
          User data is convenient for UI, but the backend must validate raw init data before trusting identity.
        </p>
      </header>

      <section className="tg-card p-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate font-semibold tg-text">{user?.first_name || "Unknown user"}</p>
            <p className="truncate text-sm tg-hint-text">{user?.username ? `@${user.username}` : "No username"}</p>
          </div>
        </div>
      </section>

      <section className="tg-card p-4">
        <h2 className="font-semibold tg-text">Parsed start parameter</h2>
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap wrap-break-word rounded-md p-3 text-xs tg-bg tg-subtitle-text">
          {JSON.stringify(parsedStartParam, null, 2)}
        </pre>
      </section>

      <section className="tg-card p-4">
        <h2 className="font-semibold tg-text">WebAppInitData fields</h2>
        <dl className="mt-3 grid gap-2 text-sm">
          <Field label="query_id" value={initData?.query_id} />
          <Field label="receiver" value={initData?.receiver?.id ? String(initData.receiver.id) : undefined} />
          <Field label="chat" value={initData?.chat?.id ? `${initData.chat.title} (${initData.chat.id})` : undefined} />
          <Field label="chat_type" value={initData?.chat_type} />
          <Field label="chat_instance" value={initData?.chat_instance} />
          <Field label="start_param" value={initData?.start_param} />
          <Field label="can_send_after" value={initData?.can_send_after === undefined ? undefined : String(initData.can_send_after)} />
        </dl>
      </section>

      <section className="tg-card p-4">
        <h2 className="font-semibold tg-text">Raw init data</h2>
        <p className="mt-3 wrap-break-word text-xs leading-5 tg-subtitle-text">
          {initDataRaw || "Unavailable outside Telegram or development mock mode."}
        </p>
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="tg-hint-text">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium tg-text">{value || "None"}</dd>
    </div>
  )
}
