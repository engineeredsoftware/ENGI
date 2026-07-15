# /tps Naming Conventions

- All third‑party UI pages live under `/tps/[service]/...`.
- Prefer explicit service names (e.g., `supabase`, `github`, `twilio`, `wallet`).
- Child paths describe the surface (`callback`, `app-install`, `sms/[runId]`, `wallet/[flow]`).
- Keep Bitcode product pages under `/packs`, retained execution bridges under `/executions`, and admitted Evidence Document surfaces under Bitcode-owned routes — do not mix them with third-party service overlays.

Examples
- `/tps/supabase/callback` – Auth OTP/OAuth callback overlay
- `/tps/wallet/authorize` – Bitcode Bitcoin wallet OAuth authorization page for Supabase custom auth
- `/tps/wallet/connect` – Wallet connection or settlement overlay
- `/tps/github/callback` – GitHub App user-authorization callback handler
- `/tps/github/app-install` – GitHub App installation/setup handler
- `/tps/twilio/sms/[runId]` – SMS run viewer

Bitcoin wallet authentication
- Supabase uses `custom:bitcode-bitcoin` for V28 wallet-backed connect.
- `/tps/wallet/authorize` captures the browser wallet proof, returns an authorization code to Supabase, and never treats `window.ethereum` as a Bitcoin signer.
- The OAuth token and userinfo routes expose wallet identity metadata to Supabase; server logs are emitted only when `BITCODE_QA_VERBOSE=true` or `NEXT_PUBLIC_BITCODE_QA_VERBOSE=true`.
- Public Supabase callbacks must point to a reachable Bitcode origin. A localhost-only dev server can stage wallet proofs locally, but cloud Supabase cannot exchange OAuth codes against localhost token/userinfo endpoints.
- Leather is supported by the documented `window.LeatherProvider.request` methods: `getAddresses`, `open`, `signMessage`, `signPsbt`, and `sendTransfer`. The authorization page uses `getAddresses` plus `signMessage`; `signPsbt` and `sendTransfer` are reserved for product BTC/fee flows and must remain user-approved wallet actions.

GitHub installation
- `/tps/github/app-install` is the GitHub App setup URL.
- `/tps/github/callback` is the user authorization callback.
- Both preserve `installation_id`, `setup_action`, `state`, `target_id`, and `target_type` so Connects can show staged or persisted installation state.

Transition policy
- Retained callback pages (`/login/callback`, `/github/callback`, `/sms/view/[runId]`) permanently redirect (308) to the new `/tps/...` routes.
- Retained GitHub setup pages (`/github/setup`) permanently redirect (308) to `/tps/github/app-install` and preserve `installation_id`, `setup_action`, `state`, `target_id`, and `target_type`.
