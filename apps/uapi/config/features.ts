// Helper to resolve boolean feature flag values with sensible defaults.
// Environment variables take precedence when explicitly set to "true" or "false".
// When the variable is undefined we fall back to the provided default.
// Robust boolean env flag resolver.
// We tolerate common copy-paste artefacts or trailing control characters
// (e.g. "false\u001bE") by trimming & checking the prefix only.
// Next.js replaces `process.env.XYZ` occurrences with the string literal at
// build-time.  But dynamic look-ups (`process.env[key]`) are NOT replaced and
// therefore only work if the entire `process.env` object still carries our
// variables at runtime.  When the build target is the browser that object is
// *stripped to the minimum* set of keys the compiler could statically detect.
// If we use purely dynamic access many of our flags disappear and the code
// falls back to the default (usually `true`), which is exactly the bug we’re
// chasing.
//
// To guarantee the env values survive the compile we snapshot them via *static
// member access* once here and then rely on the local `env` object for all
// subsequent look-ups.  This keeps tree-shaking effective while making the
// access safe.

/* eslint-disable @typescript-eslint/naming-convention */
const env = {
  NEXT_PUBLIC_CONVERSATIONS_WIDGET: process.env.NEXT_PUBLIC_CONVERSATIONS_WIDGET,
  NEXT_PUBLIC_SIDEBAR_LEFT: process.env.NEXT_PUBLIC_SIDEBAR_LEFT,
  // If NEXT_PUBLIC_SIDEBAR_UPGRADES is defined, use it alongside the single
  // left-sidebar flag so shipped deploy environments keep the same sidebar posture.
  NEXT_PUBLIC_SIDEBAR_UPGRADES: process.env.NEXT_PUBLIC_SIDEBAR_UPGRADES,
  NEXT_PUBLIC_NOTIFICATIONS_WIDGET: process.env.NEXT_PUBLIC_NOTIFICATIONS_WIDGET,
  NEXT_PUBLIC_CONVERSATION_SECTION: process.env.NEXT_PUBLIC_CONVERSATION_SECTION,
  NEXT_PUBLIC_TESTIMONIALS_SECTION: process.env.NEXT_PUBLIC_TESTIMONIALS_SECTION,
  NEXT_PUBLIC_LIGHTPAPER_BANNER: process.env.NEXT_PUBLIC_LIGHTPAPER_BANNER,
  NEXT_PUBLIC_SOFT_LAUNCH: process.env.NEXT_PUBLIC_SOFT_LAUNCH,
  NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE,
  NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT: process.env.NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT,
  NEXT_PUBLIC_DISABLE_AUXILLARIES: process.env.NEXT_PUBLIC_DISABLE_AUXILLARIES,
  NEXT_PUBLIC_DISABLE_EXCHANGE_LINK: process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_LINK,
  NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE: process.env.NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE,
  NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE: process.env.NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE,
  NEXT_PUBLIC_DISABLE_TERMINAL_LINK: process.env.NEXT_PUBLIC_DISABLE_TERMINAL_LINK,
  NEXT_PUBLIC_TERMINAL_DEBUG_WIDGET: process.env.NEXT_PUBLIC_TERMINAL_DEBUG_WIDGET,
  NEXT_PUBLIC_INVISIBLE_INTERFACES_GROUP: process.env.NEXT_PUBLIC_INVISIBLE_INTERFACES_GROUP,
  NEXT_PUBLIC_NAV_BAR: process.env.NEXT_PUBLIC_NAV_BAR,
  NEXT_PUBLIC_MCP_UPGRADES: process.env.NEXT_PUBLIC_MCP_UPGRADES,
  NEXT_PUBLIC_LIVE_DAY_BTD_ACQUIRE: process.env.NEXT_PUBLIC_LIVE_DAY_BTD_ACQUIRE,
  NEXT_PUBLIC_BITCODE_ENV: process.env.NEXT_PUBLIC_BITCODE_ENV,
  ENHANCE_WITH_DIGEST: process.env.ENHANCE_WITH_DIGEST,
  NEXT_PUBLIC_FOOTER_MUSIC_PLAYER: process.env.NEXT_PUBLIC_FOOTER_MUSIC_PLAYER,
}
/* eslint-enable @typescript-eslint/naming-convention */

const envFlag = (key: keyof typeof env, fallback: boolean = false): boolean => {
  const raw = env[key]
  if (raw === undefined) return fallback
  const val = raw.trim().toLowerCase()
  if (val.startsWith('true')) return true
  if (val.startsWith('false')) return false
  return fallback
}

const isQaOpenEnvironment =
  process.env.NODE_ENV !== 'production' ||
  env.NEXT_PUBLIC_BITCODE_ENV?.trim().toLowerCase() === 'testnet'
const disableConversationsRoute = envFlag('NEXT_PUBLIC_DISABLE_CONVERSATIONS_ROUTE')
const conversationsWidget = !disableConversationsRoute && envFlag('NEXT_PUBLIC_CONVERSATIONS_WIDGET', true)

export const FEATURE_FLAGS = {
  MAINTENANCE_MODE: envFlag('NEXT_PUBLIC_MAINTENANCE_MODE'),

  // ——————————————————————————————————————————————————————————
  // Core widgets and UI chrome
  // Always enabled by default in local/dev unless explicitly disabled via env.
  CONVERSATIONS_WIDGET: conversationsWidget,

  // Single left sidebar flag replacing the older split sidebar controls.
  SIDEBAR_LEFT:
    envFlag('NEXT_PUBLIC_SIDEBAR_LEFT', true) || envFlag('NEXT_PUBLIC_SIDEBAR_UPGRADES', true) || envFlag('NEXT_PUBLIC_MCP_UPGRADES'),

  // ----------------------------------------------------------------
  // Top navigation bar. Previously always rendered; we introduce a flag so
  // performance drills can disable it without code changes. Enabled by
  // default to preserve current behaviour.
  NAV_BAR: envFlag('NEXT_PUBLIC_NAV_BAR', true),

  SIDEBAR_UPGRADES: undefined as unknown as boolean,
  SIDEBAR_CHATS: undefined as unknown as boolean,
  SIDEBAR_FEEDBACKS: undefined as unknown as boolean,
  RIGHT_RUNS_UPGRADES: undefined as unknown as boolean,

  // Marketing – Conversations experience section on the marketing homepage. Disabled
  // by default because it can be heavy; enable explicitly when required.
  CONVERSATION_SECTION: envFlag('NEXT_PUBLIC_CONVERSATION_SECTION'),

  // Marketing – Testimonials carousel on the landing page. Enabled by default
  // but can be hidden via NEXT_PUBLIC_TESTIMONIALS_SECTION=false without a full
  // code deploy.
  TESTIMONIALS_SECTION: envFlag('NEXT_PUBLIC_TESTIMONIALS_SECTION', true),

  // Notifications widget is enabled by default.
  NOTIFICATIONS_WIDGET: envFlag('NEXT_PUBLIC_NOTIFICATIONS_WIDGET', true),
  NOTIFICATIONS: envFlag('NEXT_PUBLIC_NOTIFICATIONS_WIDGET', true),
  HIDE_BTD_TRACKER: false,
  // Misc controls retain their old default "off" behaviour.
  MCP_UPGRADES: envFlag('NEXT_PUBLIC_MCP_UPGRADES'),
  SOFT_LAUNCH: envFlag('NEXT_PUBLIC_SOFT_LAUNCH'),
  LIVE_DAY_BTD_ACQUIRE: envFlag('NEXT_PUBLIC_LIVE_DAY_BTD_ACQUIRE'),
  // Disable all public “use / sign-in / sign-up” entry points. We use direct
  // static access so Next.js’ DefinePlugin inlines the env string at build
  // time which ensures the value is available in the client bundle (dynamic
  // `process.env[key]` look-ups are tree-shaken away for public env vars).
  DISABLE_USING: process.env.NEXT_PUBLIC_DISABLE_USING === 'true',
  DISABLE_CREATE_ACCOUNT: envFlag('NEXT_PUBLIC_DISABLE_CREATE_ACCOUNT', !isQaOpenEnvironment),
  DISABLE_AUXILLARIES: envFlag('NEXT_PUBLIC_DISABLE_AUXILLARIES', !isQaOpenEnvironment),
  DISABLE_EXCHANGE_LINK: envFlag('NEXT_PUBLIC_DISABLE_EXCHANGE_LINK', !isQaOpenEnvironment),
  DISABLE_EXCHANGE_ROUTE: envFlag('NEXT_PUBLIC_DISABLE_EXCHANGE_ROUTE', envFlag('NEXT_PUBLIC_DISABLE_EXCHANGE_LINK', !isQaOpenEnvironment)),
  DISABLE_CONVERSATIONS_ROUTE: disableConversationsRoute,
  DISABLE_TERMINAL_LINK: envFlag('NEXT_PUBLIC_DISABLE_TERMINAL_LINK', false),
  TERMINAL_DEBUG_WIDGET: envFlag('NEXT_PUBLIC_TERMINAL_DEBUG_WIDGET', process.env.NODE_ENV !== 'production'),

  // ----------------------------------------------------------------
  // Marketing banner at the top of the landing / marketplace page
  // showing the lightpaper / launch blog post announcement.
  // Disabled by default so it can be selectively rolled out. Enable via
  // NEXT_PUBLIC_LIGHTPAPER_BANNER=true at deploy-time.
  LIGHTPAPER_BANNER: envFlag('NEXT_PUBLIC_LIGHTPAPER_BANNER'),

  // ----------------------------------------------------------------
  // Marketing – Invisible Interfaces (Marketplace + BTD share metrics) group.
  // Disabled by default until the section is ready for public launch.
  INVISIBLE_INTERFACES_GROUP: envFlag('NEXT_PUBLIC_INVISIBLE_INTERFACES_GROUP'),

  // ------------------------------------------------------------
  // Backend – Definition of Read / Intent of Improvement (Definition of Read/IoI)
  // enhancement route. When true (default) the API will attempt to
  // generate a repository digest and include it in the prompt sent to
  // the LLM. Set `ENHANCE_WITH_DIGEST=false` to skip digest generation
  // which can be slow or unnecessary in certain environments (e.g.
  // local dev, testing).
  ENHANCE_WITH_DIGEST: envFlag('ENHANCE_WITH_DIGEST', true),

  // ------------------------------------------------------------
  // Marketing – Small audio player in the site footer. Disabled by default
  // until we intentionally enable it (e.g. for special occasions).
  FOOTER_MUSIC_PLAYER: envFlag('NEXT_PUBLIC_FOOTER_MUSIC_PLAYER'),
}

// ---------------------------------------------------------------------------
// Debug helper – during development expose the resolved flags on `window` so a
// quick check in the browser console (`window.__BITCODE_FLAGS`) clarifies what the
// build actually picked up from the environment.  Removed automatically by
// most JS minifiers in production because it is dead-code for SSR.
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore – we intentionally attach a global for debugging.
  window.__BITCODE_FLAGS = FEATURE_FLAGS;
}
