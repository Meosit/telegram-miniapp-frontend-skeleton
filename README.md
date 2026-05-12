# Telegram Mini App Frontend Skeleton

A standalone Next.js starter for Telegram Mini Apps. It focuses on app initialization, Telegram launch data, method wrappers, haptics, theme variables, local mocking, static packaging, and a small example UI with tabs, list rows, detail navigation, and native back-button handling.

This folder is intentionally generic. It does not include project API contracts, business logic, login flows, or backend routes.

## Run And Build

```bash
cd frontend-skeleton
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

The app uses `output: "export"` in `next.config.mjs`, so `pnpm build` writes a static app to `out/`. Deploy `out/` to any static host that can serve the files over HTTPS. Telegram Mini Apps must be served from HTTPS in production.

## App Structure

- `providers/telegram-provider.tsx` initializes the Telegram SDK and exposes `useTelegram()`.
- `instrumentation-client.ts` starts SDK initialization as early as possible in the browser.
- `lib/telegram/init.ts` mounts SDK components: Mini App, viewport, back button, theme CSS variables, viewport CSS variables, and swipe behavior.
- `lib/telegram/debug.ts` enables debug mode from start params for allowlisted Telegram user ids.
- `lib/telegram/launch-mode.ts` classifies common Telegram launch/init modes from `WebAppInitData`.
- `lib/telegram/mock-env.ts` creates a local development Telegram environment when the app is opened in a normal browser.
- `lib/telegram/methods.ts` wraps Telegram methods with availability checks and browser fallbacks where reasonable.
- `lib/telegram/validation.ts` contains frontend guards and helpers for passing raw init data to your backend.
- `providers/navigation-provider.tsx` is a generic stack navigator with Telegram back-button integration.
- `components/ui/error-boundary.tsx` catches unhandled React render errors and renders a fallback.
- `components/ui/loading-screen.tsx` and `components/ui/error-screen.tsx` provide reusable initialization states.
- `components/ui/user-avatar.tsx` renders Telegram profile photos with initials/icon fallback.
- `components/ui/confirmation-modal.tsx` provides a reusable confirmation dialog for explicit user decisions.
- `components/example` shows a small app with `Home`, `Items`, and `Profile` tabs. The `Items` tab opens a detail screen from mock list data.

## Telegram Launch Data

Telegram starts a Mini App with launch parameters and `WebAppInitData`. The important fields for most apps are:

- `initDataRaw`: the original query string from Telegram. Send this exact string to your backend for validation.
- `initData`: SDK-parsed data for convenient UI use. It may include `user`, `chat`, `auth_date`, and `start_param`.
- `startParam`: a project-defined string passed from a Mini App link, bot button, or inline launch.
- `platform`: Telegram client platform, such as `ios`, `android`, `tdesktop`, or `macos`.
- theme params: client colors that are bound to CSS variables like `--tg-theme-button-color`.
- `initMode`: a skeleton-level classification derived from the available init fields.

`parseStartParam()` is intentionally project-neutral. It treats the start parameter as empty, JSON, query params, or a plain string. Replace or extend it when your project defines its own deep-link format.

`WebAppInitData` can differ by launch source:

- `query_id`: available when the app session can answer through `answerWebAppQuery`.
- `user`: the current Telegram user, when provided.
- `receiver`: chat partner for private attachment-menu launches.
- `chat`: group, supergroup, or channel data for attachment-menu launches.
- `chat_type` and `chat_instance`: direct-link context fields.
- `start_param`: link payload from `startapp` or `startattach`; it is also mirrored as `tgWebAppStartParam` so the frontend can choose the initial interface early.
- `can_send_after`: seconds to wait before answering a web app query.
- `auth_date`, `hash`, and `signature`: validation material for the backend.

The skeleton exposes `initMode` from `useTelegram()`. Current modes are `browser`, `empty-init-data`, `direct-link`, `attachment-menu`, `attachment-menu-link`, `inline`, `keyboard-button`, and `unknown-telegram`. Treat this as a routing hint, not an authentication result.

## Debug Mode

Debug mode is enabled when either:

- `NODE_ENV === "development"`, or
- the Telegram `start_param`/`tgWebAppStartParam` ends with `debug` or includes `debug=true`, and the Telegram user id is allowlisted.

```bash
NEXT_PUBLIC_TMA_DEBUG_USER_IDS=137847053
```

For example, a launch payload like `demo-debug` enables Eruda and SDK debug logs only for those users. Keep this list narrow because `NEXT_PUBLIC_*` values are visible in the client bundle.

## Initialization Order

`instrumentation-client.ts` is intentionally present and should not be removed. Next.js runs it once in the browser before the React tree hydrates. This gives the Telegram SDK a chance to initialize, restore init data, mount Mini App/viewport/back-button components, bind theme CSS variables, and request viewport or safe-area data early enough for real Telegram clients.

`TelegramProvider` also calls `initTelegram()`. The initializer is idempotent and guarded against concurrent calls, so the provider becomes the state bridge for React while `instrumentation-client.ts` handles early client bootstrap. This two-step pattern is useful in actual Telegram environments where waiting until a provider effect can be too late for first paint, theme variables, or viewport sizing.

The example app uses `useTelegram().isReady` and `useTelegram().error` to render the shared loading and error screens before showing the tab layout. Keep that gate near your app shell so product screens can assume Telegram initialization has either completed or failed explicitly.

`app/page.tsx` also wraps the app with `ErrorBoundary`, which catches render-time React exceptions and displays `ErrorScreen`. It does not catch errors in event handlers, timers, or async requests; handle those with local `try/catch`, notification helpers, or your request layer.

## Backend Validation Contract

The frontend must not cryptographically validate Telegram init data because the bot token must never be shipped to the browser.

Recommended request flow:

1. Read `initDataRaw` from `useTelegram()`.
2. Require it before protected calls with `requireInitDataRaw(initDataRaw)`.
3. Send the exact raw string to your backend, for example with `createTelegramAuthHeaders(initDataRaw)`.
4. On the backend, validate the signature/hash with your bot token, reject stale `auth_date`, then trust the parsed user id only after validation.

Example frontend request:

```ts
const initDataRaw = requireInitDataRaw(telegram.initDataRaw)

await fetch(`${apiBaseUrl}/protected-method`, {
  method: "POST",
  headers: createTelegramJsonHeaders(initDataRaw),
  body: JSON.stringify(payload),
})
```

`initData.user` is useful for rendering names and avatars immediately. Treat it as untrusted until your backend validates `initDataRaw`.

## Local Mocking

Copy `.env.development.example` to `.env.development` and adjust:

```bash
NEXT_PUBLIC_TMA_MOCK_START_PARAM=demo
NEXT_PUBLIC_TMA_MOCK_USER={"id":123456789,"first_name":"Demo","last_name":"User","username":"demo_user"}
```

When `pnpm dev` runs outside Telegram, `mockEnv()` creates local launch params, viewport events, safe-area events, theme params, and mock init data. This is only for development. Production builds do not rely on browser-only mock data.

If `.env.development` is missing, the local browser mock uses a deliberately named hardcoded fallback user:

```json
{"id":123456789,"first_name":"Hardcoded","last_name":"User","username":"hardcoded_user","photo_url":"https://i.pravatar.cc/300?u=telegram-miniapp-hardcoded-user"}
```

Set `NEXT_PUBLIC_TMA_MOCK_USER` to override it with a project-specific local user.

If you need backend validation during local development, capture a real `initDataRaw` from Telegram and pass it exactly as Telegram sent it. Do not re-sort, re-encode, or reconstruct it before validation.

## Telegram Methods And Feedback

Use wrappers from `lib/telegram/methods.ts` instead of calling SDK methods directly in app code:

- `hapticFeedback.impactOccurred()`
- `hapticFeedback.notificationOccurred()`
- `miniAppBackButton.show()`, `hide()`, and `onClick()`
- `shareURL()`
- `shareMessage()`
- `openInvoice()`
- `openExternalLink()`
- `safePostEvent()`

Every Telegram method is guarded with `isAvailable()` or `isSupported()` where the SDK exposes it. This matters because Telegram clients differ by platform and version. The visible back button in the detail screen remains available even when Telegram's native back button is unsupported.

## Theme, Viewport, And Safe Areas

The SDK binds Telegram theme and viewport values to CSS variables during initialization. Use the provided utility classes from `app/globals.css`:

- `tg-bg`
- `tg-section-bg`
- `tg-text`
- `tg-accent-text`
- `tg-subtitle-text`
- `tg-hint-text`
- `tg-button`
- `tg-card`
- `tg-list`
- `tg-list-divider`
- `tg-icon-tile`
- `tg-accent-badge`, `tg-success-badge`, `tg-hint-badge`, `tg-destructive-badge`
- `border-tg-bg`, `border-tg-section`, `border-tg-section-separator`, `border-tg-button`, `border-tg-text`

The root layout disables user scaling to match typical Mini App behavior. Adjust this if your product needs browser-like accessibility scaling.

## Replacing The Example

Keep the Telegram provider and method wrappers, then replace `components/example` with your product screens. The navigation provider is generic:

```ts
type Screen = "home" | "settings" | "detail"

const config = {
  initialScreen: "home",
  tabScreens: ["home", "settings"],
  backButtonScreens: ["detail"],
  screenToComponent: {
    home: () => <Home />,
    settings: () => <Settings />,
    detail: () => <Detail />,
  },
}
```

Call `navigateTo("detail", params)` to push a screen, `goBack()` to pop it, and `restartFrom("home")` to switch root tabs.
