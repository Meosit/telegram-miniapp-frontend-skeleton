// Next.js loads this file once in the browser before the app hydrates.
// Keep Telegram SDK bootstrap here so real Telegram clients can respond to
// early viewport/theme/init-data requests before React providers mount.

import { initTelegram } from "@/lib/telegram/init"

void initTelegram()
