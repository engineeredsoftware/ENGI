# Bitcode V48 QA Ledger

## Status

- Version: `V48`
- Active canon during QA: `V47`
- Posture: interactive local experiential QA of the first live commercial (testnet) experience; app runs locally (`pnpm -C uapi dev:remote`) against the staging Supabase project; wallet network testnet4
- Source-safety posture: source-safe evidence only; no secrets, protected source, provider payloads, wallet material, service-role keys, database credentials, or raw private prompts are serialized here.

## Local-development auth environment (decided 2026-07-05)

A DEDICATED Supabase project for local development, replacing the shared
staging project for local QA. Topology law: `localhost:3000` for as much as
possible; `testnet.bitcode.exchange` only for functionality Supabase's cloud
must reach server-to-server.

- **Auth URL configuration (new project):** Site URL `http://localhost:3000`;
  Redirect URLs (exact, query-free per the allow-list law):
  `http://localhost:3000/tps/supabase/callback` (+ `:3001` variant if used).
- **Custom provider `custom:bitcode-bitcoin` (manual configuration):**
  - Authorization URL: `http://localhost:3000/tps/wallet/authorize` —
    BROWSER hop, so localhost works and the wallet-proof page runs local code
    with local wallets.
  - Token URL: `https://testnet.bitcode.exchange/api/wallet/oauth/token` —
    called SERVER-side by Supabase cloud; must be publicly reachable.
  - Userinfo URL: `https://testnet.bitcode.exchange/api/wallet/oauth/userinfo`
    — same server-side constraint.
  - JWKS URI: `https://testnet.bitcode.exchange/.well-known/jwks.json`.
  - Client ID `bitcode-bitcoin-wallet`; Allow users without email: on.
- **Shared-secret law:** the authorization code is a stateless HMAC token, so
  ONE `BITCODE_BITCOIN_OAUTH_CLIENT_SECRET` value must be shared by (a) the
  provider Client Secret in the new Supabase project, (b) the
  `testnet.bitcode.exchange` deployment env, and (c) local `.env.local` —
  a locally minted code must verify at the testnet token endpoint.
- **testnet host requirement:** `testnet.bitcode.exchange`'s env must accept
  the new project's callback as a redirect target
  (`NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_URL` pointing at the new project, or
  the project origin listed in `BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_ORIGINS`)
  — `isAllowedBitcoinWalletOAuthRedirectUri` reads those.
- **Local `.env.local` switch:** `NEXT_PUBLIC_SUPABASE_URL` + anon key → the
  new project; `BITCODE_BITCOIN_OAUTH_CLIENT_SECRET` → the shared value.
- **Browser prerequisite (root-caused 2026-07-05):** Chrome's "Pop-ups and
  redirects" must be allowed for the app origin — "Don't allow" silently
  cancels the programmatic `signInWithOAuth` navigation (URL built, request
  never leaves the page; the panel's 8s watchdog + manual-continuation link
  surface exactly this).

### Concrete setup — project `mwugicjpxmrtctvjghjg` (created 2026-07-05)

Project URL `https://mwugicjpxmrtctvjghjg.supabase.co`; GoTrue callback
`https://mwugicjpxmrtctvjghjg.supabase.co/auth/v1/callback`. Data API enabled.

**Dashboard checklist (new project):**
1. Apply the repo schema: run `supabase/migrations/*` against the new project
   (9 files, `001_v26_production.sql` onward), then the `v48_qa_*` scripts
   work as on staging.
2. Auth → URL Configuration: Site URL `http://localhost:3000`; Redirect URLs
   (exact, query-free): `http://localhost:3000/tps/supabase/callback`,
   `http://localhost:3001/tps/supabase/callback`,
   `https://testnet.bitcode.exchange/tps/supabase/callback`.
3. Auth → Custom provider (`custom:bitcode-bitcoin`, manual configuration):
   - Display name: Bitcode Bitcoin Wallet
   - Authorization URL: `http://localhost:3000/tps/wallet/authorize`
     (browser hop — flip to `https://testnet.bitcode.exchange/tps/wallet/authorize`
     when QAing the hosted surface; the setting is project-global)
   - Token URL: `https://testnet.bitcode.exchange/api/wallet/oauth/token`
   - Userinfo URL: `https://testnet.bitcode.exchange/api/wallet/oauth/userinfo`
   - JWKS URI: leave empty — the app serves no `/.well-known/jwks.json`
     (oauth2 type; no id_token is issued, GoTrue uses the userinfo endpoint)
   - Client ID `bitcode-bitcoin-wallet`; Client Secret = the shared HMAC
     secret; Scopes `profile, wallet:bitcoin`; Allow users without email ON.
4. Storage → Files: create bucket `asset-pack-artifacts` (PRIVATE) — the raw
   AssetPack artifact store; see the artifact-storage contract below.
5. Database SSL enforcement: fine off for dev; enable before any production
   promotion of this project's pattern.

**Vercel env (testnet.bitcode.exchange environment):**
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_URL` = `https://mwugicjpxmrtctvjghjg.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_ANON_KEY` /
  `SUPABASE_PUBLISHABLE_KEY` = new project anon/publishable key
- `SUPABASE_SERVICE_ROLE_KEY` (+ `SUPABASE_SECRET_KEY` where read) = new
  project service-role/secret key
- `SUPABASE_JWT_SECRET` = new project JWT secret
- `BITCODE_BITCOIN_OAUTH_CLIENT_SECRET` = the shared HMAC secret (same value
  as the dashboard provider Client Secret and local `.env.local`)
- `BITCODE_BITCOIN_OAUTH_SUPABASE_CALLBACK_URL` =
  `https://mwugicjpxmrtctvjghjg.supabase.co/auth/v1/callback`
- `NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK` = `testnet4`
- carry over the non-Supabase vars (GitHub app, provider keys) from staging.
  No `BITCODE_BITCOIN_OAUTH_ALLOWED_REDIRECT_ORIGINS` needed — the redirect
  allow-check derives from `SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_URL`.

**Local `.env.local`:** prepared commented block sits under the Supabase
section (six values flip to the new project + callback URL); uncomment and
paste keys, restart dev.

**Code edits:** none required for the auth flow — the wallet authorize page,
authorization-code mint, token, and userinfo endpoints are host-agnostic
(env-driven). JWKS is intentionally unset (no such route exists).

### Raw AssetPack artifact storage (decided 2026-07-05)

Raw AssetPack artifacts are ALWAYS `.patch` files (an AssetPack is a measured
patch) and are stored in Supabase Storage FILE buckets, not in database rows:

- Bucket `asset-pack-artifacts`, PRIVATE. Object path law:
  `<user_id>/<run_id>/<option_id>.patch` — owner id first segment so RLS
  stays trivial.
- RLS: owner-only insert/select via
  `(storage.foldername(name))[1] = auth.uid()::text` AND
  `storage.extension(name) = 'patch'`; buyers get time-limited signed URLs
  minted server-side (service role) only after settlement — the source-safety
  law (withheld until BTC finality + BTD rights transfer) is enforced by the
  bucket being private, never by obscurity.
- Bucket-level upload restrictions: allowed content type `text/x-patch` /
  `text/plain`; conservative max object size.
- Implementation lands with the upload/delivery work in Gates 4-5 (the read
  Finish→upload step and /packs deliveries write to and read from this
  bucket).

Subsequent-gate note: depository VECTORS (search embeddings) move to Supabase
**Vector buckets** (S3-backed similarity indexes) in a later V48 gate — the
current pgvector/document-root posture stays until that gate opens.

## Testnet BTC resources

- Faucet (testnet4): https://coinfaucet.eu/en/btc-testnet4/
- Faucet/exchange (testnet coins): https://altquick.com/exchange/
- Explorer (testnet4): https://mempool.space/testnet4 — tx view at `…/testnet4/tx/<txid>`, address view at `…/testnet4/address/<address>`
- The in-app "BTC in wallet" card reads the bound address via `/api/wallet/btc-balance` (mempool.space, testnet4-first with testnet3 fallback for the ambiguous `testnet` binding label).

## QA scripts (committed at `supabase/queries/v48_qa_*.sql`)

Run in the Supabase SQL editor; all auto-target the most recent `custom:bitcode-bitcoin` user (purge-proof, no UUID editing). Run-after map:

| Script | Run after |
|---|---|
| `v48_qa_01_auth_user_identity` | wallet sign-up / sign-in |
| `v48_qa_02_profile_wallet_binding` | first sessioned page load (bridge mount) or any wallet persist |
| `v48_qa_03_user_connections_token_safe` | wallet binding write or GitHub install callback |
| `v48_qa_04_repository_inventory` | Externals pane load post-GitHub-connect (repo sync) |
| `v48_qa_05_track1_readiness_rollup` | anytime — one-row Track 1 summary |
| `v48_qa_06_deposit_activity` | each /deposits action (connect, synthesize, approve, deposit) |
| `v48_qa_07_depository_admission_evidence` | deposit approval (Depository admission roots/index state) |
| `v48_qa_08_recent_errors` | whenever a flow misbehaves or qa06 shows has_error |

Track 3-4 scripts (BTD ledger, settlement, pack journaling) get added when those tracks open; the `v28_qa_terminal_*` set remains the historical reference.

## QA Tracks

1. Identity, authentication, sign up/in, Auxillaries (GitHub, wallet connections)
2. Depositing (connect knowledge, request AssetPack syntheses, review, deposit)
3. Reading (connect knowledge, request Read, review Need, review Fits, buy Fits)
4. Ledgerized journaling (replayability, auditability, `/packs` UX/UI, Auxillaries history)

## Findings

### F1 — doc-code build broken on clean checkout (pre-existing)

- Severity: low (no runtime consumers; only the `uapi dev` script's prebuild chain invokes it)
- Observed: `pnpm -w --filter @bitcode/doc-code build` fails with TS6059/TS6307 rootDir violations — the package extends the root tsconfig whose `paths` map `@bitcode/*` to package source trees, so `tsc -b` pulls `agent-generics/src` into the program.
- Disposition: candidate for repair or retirement in a V48 gate; `dev:remote` unaffected.

### F2 — Triplicated Supabase browser clients (GoTrueClient warning)

- Severity: medium (Supabase: "may produce undefined behavior when used concurrently under the same storage key" — credible source of auth/session flakiness)
- Observed on first page load (`/`): three `GoTrueClient` constructions —
  1. `packages/supabase/src/index.ts:87` module-level client, reaching the browser bundle via `packages/btd` → `packages/api/src/routes/auxillaries-contract.ts` → `auxillary-pane-meta.ts` → `hooks/useUserData.ts` → `WalletSessionPersistenceBridge`.
  2. `packages/artifacts/src/artifacts.ts:29` module-level client, via `packages/logger` → `packages/orm` models → `useUserData` (note: ORM in the client bundle at all is a packaging smell).
  3. `uapi` `AuthProvider` → `createBrowserClient` (the legitimate one).
- Disposition: V48 fix candidate — single browser client (or lazy/server-only module-level clients) and pruning server-only packages from the client graph.

### F3 — Wallet-extension console noise on page load (benign, external)

- Observed: `contentscript.js`/`inpage.js` MaxListenersExceededWarning, ObjectMultiplex orphaned-stream warnings, `Unable to set StacksProvider` — emitted by browser wallet extensions (provider injection collisions), not by the app.
- Disposition: no action; QA hygiene note — run with a single wallet extension enabled to keep sats-connect provider selection deterministic.

### F4 — Legacy email/phone authentication residue contradicts wallet-first identity

- Severity: medium (user-facing identity confusion; canonical law is "a Bitcoin wallet is the minimum identity/authentication path for staging; email remains optional notification and recovery contact after wallet identity exists")
- Canonical path (calibrated): nav "Connect Wallet" guest CTA (gated by `DISABLE_CREATE_ACCOUNT`, default-open in dev/QA) → Auxillaries SignUpWindow → Wallet pane → sats-connect signature (testnet4) → `signInWithOAuth({ provider: 'custom:bitcode-bitcoin' })` → Supabase session → `/tps/supabase/callback`.
- Residue inventory (eradication candidates for a V48 gate):
  1. `uapi/app/login/` route family (page, head, magic-link `actions.ts`, `callback/LoginCallbackClient.tsx`) — live legacy email-first sign-in surface at `/login`.
  2. `AuxillariesLoginPane.tsx:76` mounts legacy email-OTP `LoginForm` inside the canonical wallet-first pane.
  3. `components/base/bitcode/auth/PhoneSSO.tsx` — phone-OTP sign-in, routes to `/login`.
  4. `AuxillariesProfilePane.tsx:283-289` — `signInWithOtp` used for the optional-email flow; needs disambiguation from authentication semantics.
  5. `SocialAccountLinker.tsx` — generic `signInWithOAuth`; keep only if scoped to account linking, not session minting.
  6. Root cause: `/login` was never classified by the V47 Gate 2 feature-excess audit (absent from `.bitcode/v47-feature-excess-alignment-audit.json`), so it escaped the launch freeze.
- Production note: deployed launch requires `NEXT_PUBLIC_BITCODE_ENV=testnet` (or explicit flag) or `DISABLE_CREATE_ACCOUNT` defaults ON and the Connect Wallet CTA is disabled.

### F5 — Query string on `redirect_to` defeats GoTrue allow-list matching; auth code strands on the Site URL origin; no session is ever minted (FIXED in code)

- Severity: high (track-1 blocker; also breaks production sign-in from `www.bitcode.exchange`, not just localhost)
- Observed (two attempts): Connect Wallet → Leather signature OK → Supabase created the auth user (`custom:bitcode-bitcoin`, sub `bitcoin:testnet:tb1p6x7…`) → both callbacks landed on `bitcode.exchange` instead of localhost; `auth.users.last_sign_in_at: null` both times; `user_profiles` trigger-created with all-null binding fields; localhost showed sessionless "connected" chrome.
- Root cause (proven by curl probes against staging GoTrue, no wallet needed — `/auth/v1/authorize` to capture flow `state`, then `/auth/v1/callback?code=garbage&state=…` to reveal the stored redirect):
  - `http://localhost:3000/tps/supabase/callback` (exact allow-list entry) → honored.
  - The same URL with `?next=%2Fauxillaries%2Fwallet` (what the app actually sent) → rejected → Site URL fallback (`https://bitcode.exchange`).
  - `https://www.bitcode.exchange/tps/supabase/callback?next=…` → also rejected → apex fallback (production sign-in equally broken).
  - The dashboard glob `http://localhost:3000/**` matches nothing (bare root rejected too); the Site-URL hostname (apex) is exempt from matching entirely, which is why only apex "worked".
  - GoTrue allow-list matching is exact-string against entries; any query string defeats the match. The first-attempt diagnosis (missing allow-list entry) was wrong — the entries were present and correct.
- Failure chain after fallback: auth code lands on apex root → `uapi/app/page.tsx:40` forwards stray `?code` to `/tps/supabase/callback` → `exchangeCodeForSession` fails because the PKCE `code_verifier` lives in the initiating origin's storage → `LoginCallbackClient.tsx` emits `/?loginError=server_error&loginErrorDescription=…code verifier should be non-empty`. All observed symptoms reproduce from this one defect.
- Fix (code, implemented): `uapi/lib/supabase-auth-redirect.ts` — `redirect_to` is now always the query-free `${origin}/tps/supabase/callback`; the post-auth destination travels via origin-local storage and is consumed once by `LoginCallbackClient` (explicit `?next=` still wins for back-compat). Call sites converted: `AuxillariesWalletConnectionPanel`, `SocialAccountLinker`, `SocialLoginButton`. Regression-pinned by `uapi/tests/supabaseAuthRedirect.test.ts`.
- Dashboard: no change required — exact entries for localhost and www callbacks already exist and exact matching now applies; glob entries can stay but are ineffective.
- Code-hardening candidates (still open): (a) the app renders "connected" wallet chrome from client-side wallet-session persistence even when `hasUser: false` — sessionless state should not look signed-in; (b) `loginError`/`loginErrorDescription` query params surfaced only as raw URL params — no visible error UI; (c) callback flow should fail loudly when the PKCE verifier is absent.
- Retest (local, 2026-06-12): VERIFIED — session minted (`auth.users.last_sign_in_at` set ~3s after creation, user `267ccb92…`), callback returned to `localhost:3000`, signed-in nav chrome with Sign out renders. Post-auth landing initially hit `/terminal` because `buildAuxillariesRoutePath` targets the legacy overlay root (see F8); destination now pinned to `/packs`.
- Note on the production `/tps/wallet/authorize` hop: expected and correct even for localhost sessions. The custom provider's authorize/token endpoints are registered once per Supabase project (project-level config, one URL), so every client transits the registered production origin. The hop is PKCE-safe: the verifier never leaves the initiating origin; the provider page only ferries `code`+`state` back to GoTrue, which then redirects to the initiating origin's callback. A localhost authorize URL would require a separate Supabase project (or local GoTrue) — unnecessary.
- Residual (FIXED in code — F5a): `user_profiles` binding fields remained all-null after sign-in; Wallet Auxillary showed "No Bitcoin wallet connected"/"Binding repairable" and Profile readiness Blocked.
  - Trace: the canonical binding write is `POST /api/wallet/authenticate` → `settings.walletBinding` (hydrated into the virtual `wallet_*` fields by `hydrateBitcodeProfile`; the raw columns staying null is expected). That route was never called in the canonical sign-up: it 401s without a session, the wallet signature happens on the prod `/tps/wallet/authorize` page (not the initiating origin), so `WalletSessionPersistenceBridge` finds no locally staged proof to replay after the session lands. GoTrue also drops the provider's custom `bitcoin_*` userinfo claims from `identity_data` (only `sub`/`name`/`preferred_username` survive), so the rich proof material is not recoverable client-side.
  - Fix: `/api/wallet/authenticate` gains an `source: 'oauth-identity'` mode that derives the binding server-side from the session's GoTrue-verified `custom:bitcode-bitcoin` identity (address+network parsed from the identity `sub`, provider from the userinfo label, no client-trusted wallet fields), writes `settings.walletBinding` (`proofKind: 'provider_session'`, status `pending`) + `user_connections` (`auth_source: 'bitcoin_wallet_oauth_identity'`), sets `username` (clears the blocking `profile.identity_missing`), and no-ops idempotently when the binding already matches. `WalletSessionPersistenceBridge` triggers it whenever a wallet-backed session exists with nothing replayable staged locally, then mirrors the result into the local wallet identity so the Wallet Auxillary shows the connection. Tests: `tests/api/walletAuthenticateRoute.test.ts`, `tests/walletSessionPersistenceBridge.test.tsx`.
  - Retest: refresh localhost while signed in → bridge fires on mount → QA script 03 should show `username` + `settings.bitcodeProfile.walletBinding` populated (raw `wallet_*` columns stay null by design), Wallet Auxillary shows the bound address, Profile readiness no longer lists "Display identity is missing" / "Wallet binding is missing".

### F6 — Auxillaries readiness blockers render authentication-shaped errors in a sessionless state

- Severity: medium (misleading; says "Profile row is missing" / "Wallet binding is missing" when the actual condition is "not signed in")
- Cause: `packages/api/src/routes/auxillaries-contract.ts:765` emits `profile.missing` whenever the contract receives no profile; an unauthenticated request gets no profile via RLS, so all blockers fire. The readiness contract should distinguish "no session" from "session with incomplete profile" and lead with the wallet sign-in action.

### F7 — React hydration errors (#418/#423) on production landing (www.bitcode.exchange)

- Severity: low/medium (prod console errors on first paint; minified — needs dev reproduction to attribute; suspects: client-only state rendered during SSR in nav/landing chrome)

### F8 — Legacy `/terminal` route still live; auxillaries plumbing routes to it

- Severity: medium (legacy surface reachable post-launch; post-auth callback landed there until pinned to `/packs`)
- Observed: first successful wallet sign-in landed on `/terminal` — `buildAuxillariesRoutePath` builds `/terminal?auxillary-open-to=…` via `AUXILLARY_OVERLAY_ROUTE_ROOT = '/terminal'` (`uapi/app/auxillaries/components/auxillary-pane-meta.ts:18`), and the legacy terminal page still renders.
- Canon: `/terminal` functionality was split into `/packs`, `/reads`, and `/deposits`. A V48 gate should (a) verify each terminal capability was properly ported to the three routes, (b) retarget or remove `AUXILLARY_OVERLAY_ROUTE_ROOT` and remaining `/terminal` links, and (c) remove the unused terminal page/code (relates to F4 — another surface the V47 feature-excess audit never classified).
- Interim fix: wallet sign-in post-auth destination pinned to `/packs` in `AuxillariesWalletConnectionPanel`; GitHub connect redirect retargeted to `/packs?auxillary-open-to=externals` in `tps/github/_callback-handler.ts`; all seven `auxillaries-contract.ts` repair/recovery routes retargeted from `/terminal?auxillary-open-to=…` to `/packs?auxillary-open-to=…` after "Add Email" landed on the legacy terminal page with no email experience (the `AuxillariesProvider` reads the open-to param on any route, so panes open over `/packs`; the v40 browser-proof checker pins only `bitcode-browser-proof.ts` route states, untouched). Remaining `/terminal` consumers (orbitals links, browser-proof paths, `AUXILLARY_OVERLAY_ROUTE_ROOT`/`buildAuxillariesRoutePath` itself) stay for the F8 gate.

### F9 — Organization Authority permanently Denied for solo operators; no bootstrap path exists

- Severity: medium now (misleading pane UX), high later (blocker the moment enforcement lands)
- Observed: fresh wallet-identity account shows Organization Authority **Denied** for `pay_btc_fee via terminal` (organization `n/a`, explicit grants `none`) despite wallet binding `bound`.
- Law trace (`packages/btd/src/authority.ts` `buildBtdOrganizationPolicyAuthority`): `pay_btc_fee` requires organizationId + normalized role + explicit `settlement:pay_btc_fee` grant + policy id/hash. Denial reasons fired: `organization_missing`, `role_missing` (profile role `user` normalizes to null — only viewer/member/admin/owner/lead/dev count), `explicit_permission_grant_required`, `policy_missing`. The decision is correct fail-closed law.
- Gap: no writer exists anywhere in the product for `organization_id`, `organization_permission_grants`, organization-grade roles, or `organization_policy_confirmed` — the only organizationId sources are GitHub-org repos or Profile companyName, and neither supplies role/grants. Every solo operator therefore reads Denied permanently.
- Enforcement status: display-only today — `buildBtdOrganizationPolicyAuthority` feeds only the Auxillaries pane, and `postBtdOrganizationInterfaceAuthority` (`/api/btd/organization-interface-authority`) has no callers; the V47 ip-exchange e2e proof ran deposit→read→settle without org config. Tracks 2–3 QA are not blocked.
- V48 gate decision needed (spec law, not a hotfix): either (a) personal-organization bootstrap at wallet sign-up (organization = operator, role `owner`, default grants including `settlement:pay_btc_fee`, policy confirmed) so solo commerce is allowed-by-law, or (b) the pane renders "no organization configured" as a neutral state instead of Denied until organization features ship — paired with deciding where enforcement actually attaches before mainnet.

### F11 — GitHub App webhook URL points at a route with no POST handler (deliveries 404)

- Severity: medium (all GitHub webhook deliveries lost; `POST /api/webhook` drives asset-pack pipeline automation from GitHub events)
- Observed: the App registration's Webhook URL is `https://bitcode.exchange/github`, but the only routes there are GET-only 308 shims (`/github/callback`, `/github/setup`); the live receiver is `POST /api/webhook` (signature-verified via `GITHUB_WEBHOOK_SECRET`). GitHub does not follow redirects on webhook POSTs, so a shim cannot fix this.
- Fix (dashboard): Webhook URL → `https://bitcode.exchange/api/webhook`; verify via App Advanced → Recent Deliveries (history should show the 404s; redeliver one to confirm 2xx).

### F10 — GitHub App sessionless install staging is a dead end (cookie has no consumer)

- Severity: medium (drops real installations whenever the post-install redirect lands on an origin without a session — e.g. the registered Setup URL origin differs from where the user signed in)
- Trace: `uapi/app/tps/github/_callback-handler.ts` — with a session, the installation persists to `user_connections` correctly; without one, it writes a `bitcode_github_installation_pending` cookie (15 min) and redirects with `vcsConnection=installation_staged`, but no code anywhere reads that cookie. Staged installations are silently dropped.
- Structural note: GitHub Apps have a single registered Setup URL (no per-request redirect override), so the post-install origin is fixed at registration — same origin-hop class as F5. The grace path was clearly designed for this and needs completing: on next authenticated load, claim the pending cookie (verify the installation's account/visibility) and persist the connection; or replace the cookie with a server-side staged row keyed to the installation id.
- Local QA workaround: the App has "Request user authorization (OAuth) during installation" enabled, which disables the Setup URL — GitHub instead redirects post-install to the FIRST registered Callback URL with `code` + `installation_id`. The handler dispatches on `installation_id` before the OAuth-code branch, so the install leg needs only `GITHUB_APP_ID` + `GITHUB_PRIVATE_KEY` (present locally). For QA: add `http://localhost:3000/tps/github/callback` as the first Callback URL and enable "Redirect on update"; reorder back after.
- Adjacent residue (F4-class): a legacy OAuth App registration still points at `https://engi.software/api/auth/github/callback` (pre-Bitcode domain). Not part of the App install flow; check whether its client id backs `SUPABASE_AUTH_GITHUB_CLIENT_ID` or `GITHUB_CLIENT_ID`, then retire or rotate.
- Env preparation (2026-06-12): local `GITHUB_APP_ID`/`GITHUB_PRIVATE_KEY` were template placeholders (`YOUR_GITHUB_APP_ID`; JWT signing failed with `DECODER routines::unsupported`); the install callback otherwise reached localhost and dispatched correctly. Fix: real App ID + base64-encoded PEM (the JWT helper accepts base64/`\n`-escaped/quoted PEMs). Also verify the prod deployment env carries real values — placeholders there break the prod install path identically. Re-running the flow after an env fix does not need a fresh install: the installation branch ignores the single-use `code`, so re-visiting the callback URL with `installation_id` suffices.
- Related: post-connect redirect builds `/terminal?auxillary-open-to=externals` — another F8 legacy-route consumer.

### F12 — Deposit AssetPack option "synthesis" is deterministic blueprints; the measurement pipeline never runs

- Severity: high (Track 2 core; the commercial deposit experience is not real)
- Observed: options appeared instantly after connect+notes; every execution row has `total_tokens: null`, `duration_ms: null`, `created_at == completed_at`; the three option titles are fixed archetypes.
- Trace: `/deposits` option synthesis runs `deposit-route-model.ts` → `buildDepositAssetPackOptions` (`packages/pipelines/asset-pack/src/deposit-asset-pack-options.ts`) — three hardcoded `OPTION_BLUEPRINTS` with constant `measurementBias` (0.72/0.66/0.61) and FNV-hash pseudo-roots; the file still carries `approvedOptionsAdmittedBy: 'future-gate7-deposit-option-review'` scaffolding markers from an earlier version. `BITCODE_ASSET_PACK_REAL_INFERENCE` reaches only the pipeline-harness QA routes (`/api/pipeline-harness/asset-pack`), never the `/deposits` flow — the env flags change nothing for depositing. Admission/rejection rows are journal writes over the blueprints; the qa7 sha256 roots are the composer execution's deterministic evidence.
- Gate 2 core work: wire `/deposits` option synthesis to the real asset-pack measurement pipeline under the bounded real-inference profile, producing measured options (real measurement vectors, token/cost/duration accounting, depositor-notes-conditioned synthesis) with the blueprint path retained only as an explicit mock/bring-up mode.
- IMPLEMENTED (first increment, 2026-06-12): the **AssetPacksSynthesis** pipeline core (`packages/pipelines/asset-pack/src/asset-packs-synthesis.ts`) — Bitcode's single synthesis/measurement pipeline, lens-parameterized (deposit | read) per the accepted V48 architecture law (steering prompts + measurement catalogs carry the variance; one run creates multiple packs). The deposit lens adapter (`deposit-option-real-synthesis.ts`) translates candidates into the promoted V43/V47 option law (same schema/roots/review boundaries, so policy + admission consume them unchanged). `POST /api/deposit/synthesize-options` builds an exclusion-filtered source inventory from the connected GitHub source (session + repo-ownership checked, server-derived token), runs bounded structured inference fail-closed (`real_inference_required` without the flags), persists the execution with REAL `total_tokens`/`duration_ms`, and the `/deposits` UI now requests synthesis from it (async with status; blueprint path unreachable from the surface). Gate 2 charter elevation: consolidate remaining pipelines onto AssetPacksSynthesis, clean all legacy terminal code, correct pipeline-execution actualities (data, Vercel sandbox actually running pipelines) — reading lens migration lands with Track 3.

### F13 — Deposit option decision semantics: approve is irreversibly final with no confirmation; reject should be archive

- Severity: medium (spec intent for the V48 family + UX gate work)
- Law intent (Garrett, 2026-06-12): approve = permanent Depository admission — correct that it is final, wrong that one click does it with no explicit confirmation boundary; toggling an admission back is NOT correct. Reject is semantically "archive": re-depositable at any time, with the caveat that measurements go stale over time — re-deposit triggers resynthesis/remeasurement.
- Work: explicit confirm step (or staged "ready to admit" state) before admission; rename/restyle reject to archive; archived options carry measurement-staleness posture and a resynthesize action.
- IMPLEMENTED (2026-06-12): approval is a one-time armed-confirmation flow ("Approve for Depository" → "Confirm permanent deposit"); an admitted option locks permanently ("Admitted to Depository — permanent", no further decisions accepted by the handler). Reject renders and records as **Archive**: re-depositable anytime, visible in the depositor's packs (personal scope), with the staleness/resynthesis note; the `'rejected-by-depositor'` contract value is unchanged so admission law and the V47 checker pins hold.

### F14 — No protected-IP exclusion instructions for deposit synthesis

- Severity: medium-high (source-safety law surface)
- Gap: the deposit composer accepts depositor notes but offers no way to declare which IP in the connected source must be protected and excluded from AssetPack knowledge synthesis. The synthesis pipeline (once real, F12) must accept and honor exclusion instructions as a fail-closed boundary (excluded paths/concepts never enter measurement, prompts, or option summaries).
- IMPLEMENTED (2026-06-12): "Protected IP exclusions" field on `/deposits`; exclusions are honored fail-closed at both ends of AssetPacksSynthesis — excluded paths removed from the source inventory before any prompt is built, and candidates whose covered paths violate exclusions (or cite paths outside the real inventory) dropped after inference. Exclusion roots + withheld-path counts surface in the synthesis exclusion posture and the executions row.

### F16 — Depository state persists into a git-tracked repo file, not the database

- Severity: high (Gate 2 charter: pipeline-execution actualities — data)
- Observed: the live deposit QA session wrote ~1,200 lines of runtime depository state (assets, options, roots for the "Some Python" deposit) into `packages/protocol/data/state.json`, a tracked file that historically changes only at canonical promotions. Runtime commerce state does not belong in git: it cannot serve concurrent users, deployments reset it, and QA sessions dirty the working tree (one such mutation was accidentally committed in `569c6e19` and reverted immediately after).
- Gate 2 work: move depository/ledger runtime state to the database (executions/ledger tables + object storage roots already exist for this), keeping `state.json` as promotion-managed demonstration canon only.

### F15 — Packs master-detail rows are not selectable; type taxonomy unclear

- Severity: medium (Track 4 UX, surfaced during Track 2)
- Observed: pack activity rows render but cannot be selected to open their detail view (the master-detail contract's most critical interaction). The TYPE column shows generic "Executions" for everything; the conceptual taxonomy should read as: Deposit Request ("Some Python" — parity with Read Request) → synthesized AssetPack options → per-option decisions (admitted/archived).
- Work: row selection opens the per-activity detail page (clean full readback); type column gains the deposit-request/option/decision taxonomy.
- PARTIAL (2026-06-12) — scope taxonomy implemented: execution activity now derives scope by specification (admitted Depository AssetPacks and settled/read APs = `network`, globally visible; deposit requests, syntheses, review decisions including archived options, connected sources = `personal`) instead of hardcoding everything `network`; `/api/packs/activity` merges a global Depository feed (admitted APs across all accounts, source-safe projections, dedupe against own rows); `/packs` gains a Visibility scope filter (All / Network — deposited and read AssetPacks / Mine — archived options, sources, requests). Remaining: live-verify row→detail selection (the detailId mechanism exists and is test-covered — widen the click target if the live miss reproduces) and the clearer type-column taxonomy.

- Environment note (by design, not a finding): `www.bitcode.exchange` and localhost both point at the staging-testnet Supabase project — the testnet launch IS the production deployment. QA users/data therefore land in live data; keep QA to dedicated testnet wallets.

### F17 — Synthesized AssetPack option cards overflow into the right panel; per-option action buttons overlap

- Severity: low (Gate 3 deposit review UX)
- Observed (2026-06-26): on `/deposits`, synthesized AssetPack option cards overflow their column rightward into the 380px telemetry/activity panel, visually x-overlapping the per-option action buttons (Select for deposit / Archive / Resynthesize) with the right column.
- Cause: the option `<article>` (a grid item in the `xl:grid-cols-3` options grid) lacked `min-w-0`, and the `font-mono` covered-source-paths list lacked `break-all`, so a card with long unbreakable mono content refused to shrink below its content's min-content width and overflowed the `minmax(0,1.45fr)` left column.
- Repair (2026-06-26, `DepositPageClient.tsx`): `min-w-0` on the option card + `break-all` on the covered-paths list (the Option-roots `<dd>` already wrapped). The card now shrinks to its grid column and long paths/roots wrap rather than forcing overflow.

### F18 — Synthesis run telemetry leaks the raw model response and x-overflows the page (one accordion row per content line)

- Severity: high (source-safety law) + low (layout). Telemetry must never expose raw prompts/responses (`rawProviderResponseVisible=false`).
- Observed (2026-06-26): during `/deposits` "Synthesize options", the Synthesis run telemetry accordion rendered the raw model output line-by-line — ` ```json `, `{`, `"analysis": "…"`, `"steps": [`, `"1. ANCHOR IDENTITY: …"` each became their own row — and the long unwrapped `"analysis"`/step lines x-overflowed the entire page (page shifted right, panel toggle clipped). The raw content was the setup-plan agent's plan prose (a provider response).
- Cause (root, source-safety): the formal Thricified substeps store LLM content under `llm/input|prompt|output|parsedOutput`, but `AgentLLMsRegistry`/`PipelineLLMRegistry` (direct `getLLM` calls, used by the setup-plan agent) store the raw prompt under `llm/messages` and the raw response under **`llm/response`** (`output.content`). The universal streaming filter `sourceSafeStreamEvent` withheld only the substep key names, so `llm/response` (a raw string) passed through as a `status`-event `message` and reached `execution_events` unredacted.
- Cause (display): `buildTerminalRunActivityFromEvents` joins event messages with `\n` and `PipelineExecutionLog` splits `output` on `\n` (one row per line), so the multi-line leak fragmented into many rows; the compact/desktop title spans lacked `min-w-0`, so a long line's min-content width escaped the `overflow-auto` log container and widened the page.
- Repair (2026-06-26):
  - `pipeline-stream-integration.ts` — `sourceSafeStreamEvent` now withholds by **metadata allowlist**: every `llm` store is content-withheld except a fixed source-safe set (`startTime/endTime/duration/usage/status/provider/model/configKey/stopReason/error`). Robust to content-key drift between the two LLM-call paths; `llm/response` + `llm/messages` are now withheld (message → `[content withheld — source-safe]`, `data` → structural summary). Regression test added.
  - `terminal-run-activity.ts` — every event line is collapsed to a single bounded line (`toSafeSingleLine`, 280 chars) so one event = exactly one row and the `outputDetails` key lookup stays intact (defense-in-depth).
  - `pipeline-execution-log.tsx` + `DepositPageClient.tsx` — `min-w-0` on the compact/desktop title spans and on the telemetry panel section/wrapper (+ `overflow-hidden` on the panel) so a long line truncates within its row instead of x-overflowing the page.
- Related observation (not yet filed): the deposit run executes `ReadFitsFindingSynthesisSetupPlanAgent` planning a "Read-Need" — a read-lens setup agent running under the deposit lens. Telemetry is now source-safe regardless, but the deposit setup-plan agent identity should be confirmed/queued as a separate correctness finding.

### F19 — Rich telemetry fragments the hierarchy across rows; lock it to LLM calls + Tool uses only

- Severity: medium (telemetry correctness + pipeline↔UI contract stability).
- Observed (2026-06-26): after F18 the raw-content rows were gone, but the Synthesis run telemetry still rendered intermediate store values as standalone rows — `try`, `setup-plan`, `thricified-generation`, a cwd path, a bare agent name — and the hierarchy was split across rows (Phase on one, Step+Generation on another, Agent on a third) instead of consolidated onto one rich log line.
- Contract (decided 2026-06-26): the rich telemetry renders EXACTLY two formal log-line kinds, nothing else — (a) **LLM calls**, which carry the full hierarchy Phase→Agent→Step→Failsafe→Thricified + source-safe content + provider/model/usage; (b) **Tool uses**, which carry Phase→Agent→Step + tool name/arguments (no Failsafe/Thricified). Every other store event (step/agent/phase name stores, prompt-side llm keys, `llm/response` registry copies, paths, generation markers, tool sub-keys) is intermediate context that advances the rolling hierarchy but never becomes a row.
- Cause: `ExecutionStreamAdapter.onStore` emits one event per `execution.store(...)`, and `buildTerminalRunActivityFromEvents` turned any event with a non-empty message into a row. The canonical LLM-call event (`llm/output`, type `generation`) already carries the full hierarchy in its value, but tool stores use the singular `tool` namespace with no hierarchy (and `inferEventType` only recognized plural `tools`), so tool calls were mis-typed and hierarchy-less.
- Repair (2026-06-26, `terminal-run-activity.ts` + `pipeline-execution-log.tsx`):
  - The activity builder maintains a rolling `{phase, agent, step, failsafe, generation}` context updated from every event, and emits a row ONLY for LLM calls (`generation` / `llm:output`), Tool uses (`tool|tools:result|error`), and terminal/high-level signals (`completion`/`error`/no-namespace status). LLM rows stamp their own 5-field hierarchy; tool rows stamp Phase/Agent/Step from the rolling context + the tool name/args accumulated per tool-execution node.
  - Distinct calls that share withheld text are kept distinct via a unique null-separated row key (`TELEMETRY_ROW_KEY_SEP`); the renderer displays only the text before the separator, looks up details by the full key, and bypasses message de-dup for uniquely-keyed rows.
  - `usePipelineExecution.ts` (the second half — fragments persisted live) — the live SSE tail re-parsed each frame through `parseStreamChunk`, which flattened the structured onStore event into a namespace-less `{type:'status', status:{message}}` shape; the activity-builder classifier keys off `namespace` to suppress fragments, so namespace-stripped live events leaked every store as a row (the history path, which relays raw `event_data`, was already correct). The tail now relays raw `event_data` verbatim — identical in shape to history — so the contract holds during streaming, not just on reload.
- Verified: uapi tsc 0; F19 activity-builder contract test + a `usePipelineExecution` test asserting the live tail preserves `namespace`/`key`/`executionState` + 10-suite telemetry/terminal/deposit regression batch — all green.

### F20 — Deposit synthesis runs the READ-lens agents (mode never reaches the phases)

- Severity: high (the deposit pipeline isn't actually depositing). Surfaced as "Read" verbiage in a deposit run, but the cause is that the read agents execute.
- Observed (2026-06-26): a `/deposits` run ("SynthesizeAssetPacks (deposit mode)") rendered read-lens agents in telemetry — `ReadFitsFindingSynthesisReadComprehensionAgent` with a `read-comprehension` step, `ReadFitsFindingSynthesisAssetPackSynthesisAgent` with a `synthesis` step — and ended with "Pipeline yielded no admissible options; falling back to bounded deposit synthesis." The agent pills are each agent's real `config.name`, so the read agents were genuinely running.
- Cause: `factorySDIVFExecutorPipeline` composes the phases with `sequential`, which runs preprocess and every phase on ISOLATED sibling child executions (`execution.child('seq-N')`). `factoryPreprocess` stored the resolved mode on its own child (`seq-0`); the phases run on `seq-1`/`seq-2` and resolve the mode with `synthesizeAssetPacksModeFromExecution`, which only walks ANCESTORS — never sideways to `seq-0`. So every phase resolved `null → 'read'`, took the read branch, and resolved the init-registered read agents. The agents registry is already shared (the read implementation agent is registered by the phase and resolves), so the only gap was the mode.
- Repair (2026-06-26, `index.ts`): the `factorySynthesizeAssetPacksPipeline` wrapper now resolves the mode and stores it on the shared outer execution (the parent of all `seq-N` phase children) before running the SDIVF executor, so every phase resolves it via the upward walk. Once the phases see `deposit`, their mode-conditional registrations (setup comprehension override, deposit Discovery agents, deposit Implementation/Validation) take effect on the shared registry and the deposit-lens agents run — which also makes the telemetry verbiage deposit-correct at the root. Read mode is unchanged (default was already read). Regression test added (sibling isolation reproduced; shared-parent storage resolves). Needs a live deposit run to confirm end-to-end.

### F21 — Telemetry pill icons + reduce rows to the ultimate LLM-call layer

- Severity: low (telemetry consistency).
- Observed (2026-06-26): the Agent pill had no icon; Step/Failsafe/Thricified pills frequently had no icon (the icon maps were keyed by labels that don't match the real values — `Try`, `read-comprehension`, `synthesis`, `structured_output`). Informational rows ("AssetPacksSynthesis started", "Building source inventory", "Inventory ready…", "Running SynthesizeAssetPacks…", "Pipeline yielded no admissible options…") still rendered alongside the LLM-call rows.
- Contract: pills map by fixed role — Phase (grey, phase icon) top-left, Agent (blue, agent icon) top-2nd; Step / Failsafe / Thricified bottom 1-2-3 (each with its icon). The rich log renders ONLY the ultimate LLM-call layer + Tool uses; nothing else is a row.
- Repair (2026-06-26):
  - `PathPill.tsx` — every pill type renders a guaranteed icon: a per-type default (Agent = person, Tool = sliders) refined by a substring match on the normalized label, so PTRR steps / Thricified generations / failsafe stages / custom step names always resolve an icon. Colors and the compact top/bottom pill order already matched the role contract.
  - `terminal-run-activity.ts` — the formal-log-line classifier now returns only `llm` and `tool`; informational status / completion / error rows are dropped from the accordion (run completion is shown by the processing indicator, errors by the log's error banner). The dead `normalizeEventMessage` helper is removed.
- Verified: uapi tsc 0; terminalTransactionActivity (tightened) + 7-suite telemetry batch green.

### F22 — Setup-plan agent is read fits-finding work; punt it under the deposit lens + give the log rows breathing room

- Severity: low (deposit correctness + telemetry polish).
- Observed (2026-06-26, after F20): with the deposit agents now running, the only remaining read-named row was `ReadFitsFindingSynthesisSetupPlanAgent` — a name that merges phase (Setup) + step (Plan) and, worse, plans "Finding Fits from an accepted Read-Need," which is read work that is irrelevant to a deposit. Separately, the overhanging pills crowded the adjacent log rows.
- Decision: the Setup-plan agent is read-lens work for the subsequent (read) gate — its fits-finding planning belongs in the read-lens **Discovery** phase, not Setup. Under the deposit lens it is irrelevant and is punted.
- Repair (2026-06-26):
  - `phases/setup.ts` — the deposit branch now re-registers `setup:ReadFitsFindingSynthesisSetupPlanAgent` with a passthrough (no LLM call, no telemetry row), so the deposit Setup runs clone → comprehend Obfuscations → init with no read fits-finding plan. Read keeps the agent unchanged. (F28 later punts the read danger-wall too, so the deposit Setup is clone → comprehend Obfuscations → init.)
  - `pipeline-execution-log.tsx` — compact log rows go `mb-3 → mb-6` so the top/bottom overhanging pills clear the adjacent rows.
- Gate-4 (read lens) directive: move the read setup-plan (fits-finding planning) into the read-lens Discovery phase, with a deposit-free agent name; do not reintroduce a deposit setup-plan.
- Verified: asset-pack tsc 0 + setup-agents suite green; uapi tsc 0 + telemetry render tests green.

### F23 — Telemetry log doesn't auto-follow; pin to bottom unless the user has scrolled away

- Severity: low (telemetry UX).
- Observed (2026-06-26): the synthesis log tracked `userHasScrolled` but never scrolled, so new streamed rows didn't pin to the bottom — the user couldn't watch passively.
- Behavior: the log rests at the bottom as new rows stream in (passive watch); when the user scrolls away from the bottom (e.g. to read an earlier line or an open accordion) the follow pauses and never yanks them back; returning to the bottom resumes it.
- Repair (2026-06-26, `pipeline-execution-log.tsx`): a follow effect scrolls the internal scroll container to the latest line on new rows when `!userHasScrolled` (rAF-deferred). `handleScroll` now uses a modest near-bottom band (48px) — momentum/rounding still counts as following; a deliberate scroll up sets `userHasScrolled` and pauses the follow until the user returns to the bottom.
- Verified: uapi tsc 0 + telemetry render tests green.

### F24 — Neediness v0: deposit-side preview of read Need-fit (depository search during depositing)

- Motivation (Garrett, 2026-06-26): depository search during depositing estimates the *potential* fit value of the packs being synthesized — which packs are worth making correspond to what is likely to be read. Surface it to the depositor as a per-pack "neediness" preview (and a new AP measurement).
- Model: `neediness` ∈ [0,1] = a deposit-lens PREVIEW measurement (separate from the absolute composite) of the pack's future read Need-fit / earning potential. `neediness = clamp01(demand × (0.5 + 0.5·(1 − saturation)))` — demand gates, scarcity boosts.
- v0 signals (no new infra; LLM-grounded): the deposit `discovery:depository-search` agent emits `underservedTopics` (supply-scarcity hint) alongside its demand guidance; the deposit Implementation synthesis agent emits a per-pack `needinessSignal {demand, saturation, rationale}` grounded in that guidance; `computeNeediness` derives the scalar deterministically in `validateDepositSynthesisOptions`.
- Flow: synthesis agent → `implementation:options` (carry `needinessSignal`) → route `validateDepositSynthesisOptions` (attaches `neediness`) → `buildRealDepositAssetPackOptionSynthesis` (projects `neediness` + `needinessRoot` onto the deposit option) → `/deposits` option card previews it (amber tile: volume %, demand/saturation, rationale).
- Source-safety: derived scalars + topic-level rationale only (no raw source). v1 seam (spec): replace `saturation` with a real embedding-vector probe of the pack against the Depository supply index, and `demand` with a search against an accrued Read-Need / demand corpus; realized read `need-fit` + BTD later calibrate it.
- Implemented over two commits (spec + lib core; then agents + projection + UI). Verified: asset-pack tsc 0 + full suite (214) green incl. a new neediness test; uapi tsc 0 + deposit UI/model tests green; spec checker green.
- Neediness **v1 is deferred to Gate 7** (Garrett, 2026-06-26): the real embedding-vector supply-index probe + Read-Need/demand-corpus search + realized-need-fit/BTD calibration.

### F25 — Deposit synthesis stalls indefinitely; bound the pipeline LLM call + (throughput) deposit runs full PTRR

- Severity: high (interactive deposit usability).
- Observed (2026-06-26, run `0f9d2421-de2b-48c3-aa08-5ad6c27e000c`): a deposit run (deposit agents correctly running, post-F20) stuck for many minutes on a single generation — the `DepositDepositorySearchAgent` Plan → PrepareContext → StructuredOutput row — with no progress.
- Cause (acute): the pipeline LLM wrappers (`AgentLLMsRegistry` / `PipelineLLMRegistry`) `await llm(input)` with NO timeout; the provider SDK sets no short bound, so a hung/very-slow generation stalls the entire INLINE synthesis. The `/deposits` synthesize-options route runs the pipeline inline under `maxDuration = 300s`, so a stall just freezes the UI on the last telemetry row.
- Cause (throughput, related): the deposit agents (`deposit-codebase-comprehension`, `deposit-depository-search`, `deposit-inherent-regurgitation`, `deposit-input-comprehension`, `deposit-asset-pack-synthesis`) call `factoryAgentWithPTRR` directly and ALWAYS run the full PTRR × Failsafe × Thricified fan-out — they do NOT gate on the bounded profile (unlike the read agents' `shouldUseDiscoveryPtrr` deterministic/bounded fast-path). So even with `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded` the deposit pipeline issues dozens of LLM calls and can exceed the 300s inline budget.
- Repair (2026-06-26, acute): `AgentLLMsRegistry` + `PipelineLLMRegistry` now wrap the base LLM call in a timeout (`BITCODE_LLM_CALL_TIMEOUT_MS`, default 90s; 0 disables). On timeout the call rejects and the existing failsafe/PTRR retry handles it — a clean failure surfaced to the UI, never an indefinite hang.
- Resolution (Garrett, 2026-06-26): both — remove inference profiles entirely (always-full hierarchy + real generation; F26-A) AND run the synthesis decoupled via the pipeline harness (F26-B). Spec: F26 (`BITCODE_SPEC_V48_NOTES.md`).

### F26 — Non-configurable inference + decoupled harness execution for SynthesizeAssetPacks

- Design (committed spec, F26): inference is non-configurable (no profiles/`shouldUsePtrr`/bounded/deterministic in-agent branches — always the full Pipeline→Phase→Agent→Step→Failsafe→Thricified→Generation hierarchy, always real inference; test determinism via boundary LLM mocks). And SynthesizeAssetPacks runs via the pipeline HARNESS, decoupled from the dispatching request: the route validates + dispatches, the harness runs to completion while telemetry streams, the client reads the persisted synthesis on the completion event. Hosts: local in-process (dev) + Vercel Sandbox (prod).
- **F26-B (done — local decoupling)**: `synthesize-options/route.ts` now dispatches the run as a background task (`void runSynthesis()`) and returns `{ runId, status: 'dispatched' }` immediately; the synthesis (+ reviewProjections + inference) is persisted to the execution row `output` BEFORE the completion event. `DepositPageClient` no longer reads the synthesis from the response — a completion effect, on `isStreamingComplete`, fetches `/api/executions/history/{runId}` and renders the options (a streamed error fails the run). Verified: uapi tsc 0; depositPageClient test reworked to drive the dispatched→completion→history flow (+ deposit/telemetry batch green). The Vercel Sandbox host (prod durability) is the existing `pipeline-hosts` host — not wired in this commit (needs a cloud run to verify). Pre-existing: `tests/api/depositSynthesizeOptionsRoute.test.ts` fails to LOAD (its `@bitcode/pipelines-generics` mock omits `createPhaseRunner`, which the route now pulls in via the full pipeline) AND its assertions assume the inline contract; both need addressing when the load is fixed.
- **F26-A (done)**: `runtime-inference-policy` gutted to only `isAssetPackRealInferenceEnabled` (the master switch — kept; not a profile); `bounded-structured-inference` deleted; the 8 read-lens consumers (setup-plan, read-comprehension, read synthesis, danger-wall, deliver, validation ×3, discovery ×5, read-need) de-gated to ALWAYS run their formal PTRR core (deterministic + bounded branches removed). Boundary LLM-mock test infra built (`src/__tests__/support/generic-llms-mock.ts` — `jest.mock('@bitcode/generic-llms')` seam) and the read-agent tests reworked to assert via the mock. **Latent bug fixed along the way**: the PTRR wrappers read `result.summary`/`.options`/`.finalApproval`/`.issues` directly, but `factoryAgentWithPTRR` returns an envelope `{context, output, finalOutput}` — so real inference output was silently dropped (masked by the deterministic defaults). The read/validation wrappers now unwrap `finalOutput ?? output ?? raw`. Verified: asset-pack tsc 0 + full suite 210/210; uapi tsc 0. (Dead `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE`/`*_USE_PTRR` env STRING references remain in `uapi` harness/route files — no-ops, no imports of the removed fns; flagged for a follow-up scrub.)
### F27 — Deposit agents drop their real PTRR output to the fallback defaults (envelope not unwrapped)

- Severity: high (deposit-critical — the likely reason deposit synthesis "yielded no admissible options" even after F20 made the deposit agents run).
- Cause: `factoryAgentWithPTRR` returns an envelope `{ context, output, finalOutput }`, but the six deposit agents read the typed fields straight off it — `deposit-input-comprehension` (`result.comprehension`), `deposit-codebase-comprehension` (`.comprehension`), `deposit-depository-search` (`.guidance`), `deposit-inherent-regurgitation` (`.regurgitation`), `deposit-asset-pack-synthesis` (`.options`), `deposit-validation` (`agentOutput.issues`). Each was therefore `undefined`, so every agent silently fell back to its `?? {default}` / empty-options branch — the real inference output never reached the synthesis (and Implementation's empty `options` triggered the route's bounded fallback). Same class as the F26-A read-agent bug, in the deposit lens.
- Repair (2026-06-26): unwrap `(raw)?.finalOutput ?? (raw)?.output ?? raw` in all six deposit agents before reading the typed output. asset-pack tsc 0 + full suite 210/210 (deposit agents aren't test-exercised — the pipeline short-circuits in tests — so this is verified by compile + the read-agent pattern; needs a live deposit run to confirm options now materialize).

### F28 — Deposit Setup runs (and is blocked/hung by) the read danger-wall; punt it under the deposit lens

- Severity: high (deposit-blocking — the deposit cannot produce options).
- Observed (2026-06-30, run `3e82ddd1-bf24-41cb-9a9a-58e9f6a35335`): a deposit run got through clone → `DepositInputComprehensionAgent` (obfuscation comprehension) and then stalled in Setup on `bitcode-read-risk-admission` — its **Plan** step alone ran 132s, its **Try** step dispatched a generation that never returned, and the run sat in `status:running` with no further telemetry.
- Cause: `phases/setup.ts` runs `setup:asset-pack-danger-wall-agent` (= `bitcodeReadRiskAdmissionAgent`) unconditionally. That agent is the Bitcode **read** risk-admission — its whole contract is read-framed (`readSafeToMeasure` / `assetPackSafeToSynthesize` / `deliveryMechanismSafeToAttempt`, proof- and delivery-boundary gates) and it expects a Read to admit. On a deposit it has `read: ''`, flails, and every `structured_output` returns `safe:false / maxSeverity:high`. Two failures stack: (1) **would block anyway** — `dangerWallWithShortCircuit` treats `maxSeverity==='high'` as `isBlocked` → `SHORT_CIRCUIT` (`refundType:'full'`), so the deposit is aborted with zero options even if the LLM returned; (2) **the locus of the hang** — the full PTRR × two failsafes (`prepare_concise_context` + `chunk_then_sum`) × reason/judge/structured_output fan-out, with `structured_output` echoing the whole accumulated state until it hits `max_tokens` (37s/call). It is the sibling of the F22 Setup-plan leak, one agent over.
- Repair (2026-06-30, `phases/setup.ts`): the deposit branch now re-registers `setup:asset-pack-danger-wall-agent` with the same no-LLM passthrough as the Setup-plan punt. The deposit Setup is now clone → comprehend Obfuscations → init — no read danger-wall row, no short-circuit. Read keeps the danger-wall unchanged. The depositor's source-safety is already enforced by the streaming source-safe filter + the obfuscation comprehension; a deposit-lens admission is a later-gate `…ForDepositor`/`…ForReader` split. Spec: `BITCODE_SPEC_V48_NOTES.md` Setup-phase note. Verified: asset-pack tsc 0; setup-agents + deposit-asset-pack-options + deposit-asset-pack-option-admission suites green (10/10).
- Liveness aside: F25's per-call timeout (`BITCODE_LLM_CALL_TIMEOUT_MS`, default 90000ms) should have bounded the hung Try generation but did not — the run stayed frozen ~8 min past the last event. The punt removes this locus for deposits, but the operator should confirm `BITCODE_LLM_CALL_TIMEOUT_MS` is not `0` in the run env; if it is non-zero and a generation still hangs unbounded, the in-box harness LLM path bypassing the F25 wrapper is a follow-up (read lens + remaining deposit agents still depend on that bound).

### F29 — First live run of the redesigned Failsafes (3703f48f, 2026-07-03): machinery works; PCC selection shorthand was silently dropped (FIXED)

- Observed working end-to-end on the first post-wave run: the keys-only execution-state
  tree streamed (values never present); the PCC selection Thinkings ran (reason/judge/
  structured_output, ~14s/14s/2s, small selection output); CS measured the composed
  request (6,582 chars vs the 600k budget → correctly non-triggering, single task
  generation); cross-phase `deposit:*`/`pipeline:*` stores landed on the ROOT node;
  the per-run sidecar dir `~/.bitcode/logs/executions/<runId>/` materialized; and the
  Implementation plan step converged in ONE stitch cycle whose repair request carried
  the literal schema-validation error (vs the pre-fix five-cycles-to-death).
- Defect: the selection model chose exactly the right context (deposit obfuscations/
  inventory/protectedIpExclusions/demandContext + mode) but emitted `deposit#obfuscations`
  shorthand (`<namespace>#<key>`), while the resolver demanded the canonical
  `<execution-path>#<namespace>:<key>` — all five selected keys missed, `selectedContext`
  came back empty (fail-soft), and every downstream generation ran without its selected
  context for the whole run.
- Repair (2026-07-03): strict resolution stays first; on a miss the resolver reinterprets
  the string as `<namespace>:<key>` and resolves it depth-first from the root
  (`packages/execution-generics/src/state-keys.ts`; regression-pinned against the five
  live-run misses). Follow-up candidates: canonical-path examples in the PCC selection
  prompt part; `context:selectedKeys` non-empty as a QA acceptance row (added to §2).

## Track 1 — Identity / Authentication / Auxillaries — COMPLETE 2026-06-12 (email deferred by decision; F2/F9 and legacy eradication queued for gates)

- [x] Sign up / sign in via Connect Wallet (nav CTA → SignUpWindow → wallet signature on testnet4 → `custom:bitcode-bitcoin` session → `/tps/supabase/callback`) — verified 2026-06-12 after F5 fix; lands on `/packs`. Re-verified from fully nuked state (purged user + cleared site data): created 19:29:21 → session 19:29:25 → binding auto-written 19:29:29 by the bridge on `/packs` mount with no Auxillaries visit; UI consistent across nav, Wallet, and Profile panes.
- [x] Wallet binding persisted after sign-in — verified 2026-06-12: identity-derived bind populated `username` (`wallet_tb1p6x70u8ag`) and the full `walletBinding` (address, provider `leather`, network `testnet`, status `pending`, `proofKind: provider_session`, `boundAt` stamped on bridge mount). `payment_address`/`addressType` stay null in identity-derived binds (GoTrue drops the custom claims); they backfill via the in-panel signature flow, which settlement-adjacent actions require anyway.
- [x] Session persists across refresh — verified 2026-06-12 across many refreshes, dev-server restarts, and pane navigation in one session with no re-auth; F2 (triplicated GoTrueClient) produced no observable flakiness but stays open as a packaging fix.
- [~] Profile pane readback (optional email binding) — deferred by decision 2026-06-12: wallet (plus GitHub) is the root of identity; email is optional contact only and not required for Track 1 closure. The "Add Email" repair CTA routing was fixed regardless (contract repair routes → `/packs`). The `signInWithOtp` contact-binding semantics check moves to the F4 legacy-auth eradication gate, where the email path gets disambiguated from authentication wholesale.
- [x] Externals: GitHub App connect + repository inventory — verified 2026-06-12: installation `139922918` (`engineeredsoftware`, repository_selection `all`), provider readiness "succeeded" with source-safe token posture, 46 repositories synced into `vcs_repositories` with full metadata. Post-connect redirect retargeted from the legacy `/terminal` overlay to `/packs?auxillary-open-to=externals`. Connected Scope pill list was hard-capped at 8 (`repositories.slice(0, 8)`) — now renders all in a scrollable wrap.
- QA evidence hygiene note: ad-hoc `user_connections` dumps that select `connection_data` wholesale expose the GitHub installation `access_token` (short-lived, 1h expiry — the one pasted on 2026-06-12 expired 21:08Z; no rotation needed). Use `v48_qa_03_user_connections_token_safe.sql` instead; never paste raw `connection_data`.
- [x] Wallet pane: fauceted testnet4 balance visible — verified 2026-06-12: "BTC in wallet" shows 0.00763373 BTC live from mempool.space testnet4 (faucet tx `fff98a94…ec6d` paid the payment address `tb1q8whq…s7d8t2`, 263,373 sats + follow-up). The identity-derived bind initially showed 0 because it carried only the taproot auth address; Reconnect Leather (signed-in panel flow) backfilled `paymentAddress`/`addressType` and upgraded proofKind to `bitcoin_message_signature` — the F5a payment-address residual repair path is verified. Binding status stays `pending` by design until signature verification ships. Nav chip wiring to the live source is a follow-up.
- [x] Organization/team + treasury panes render — verified 2026-06-12: Organization Authority and treasury/wallet-posture surfaces render without errors; the Denied content posture is the parked F9 decision, not a render defect.

## Track 2 — Depositing (Gate 2, opened 2026-06-12 on `v48/gate-2-depositing-interactive-qa`)

- Environment: add to `uapi/.env.local` and restart `dev:remote` — `BITCODE_ASSET_PACK_REAL_INFERENCE=true` and `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE=bounded` (provider keys already present; without the flags, synthesis runs deterministic bring-up branches, and the pipeline harness preflight rejects Read/Fit QA). `BITCODE_ENABLE_PIPELINE_HARNESS_API` is unnecessary locally (the harness route is open on non-production deployments).

- [ ] Connect repository on /deposits
- [ ] Synthesize AssetPack options (real inference if enabled)
- [ ] Source-safe measurement review renders
- [ ] Approve → Depository admission readback
- [ ] /packs?type=depository-assetpack shows the admission

### Gate 3 depositing — QA finalization runbook (2026-06-29)

Manual end-to-end verification of the Gate-3 depositing parity matrix
(`BITCODE_SPEC_V48_NOTES.md` → "Gate-3 depositing PARITY MATRIX"). Copy the named log
lines / UI values into §6 for the QA record.

**0. Preconditions**
- Branch `v48/gate-3-synthesis-pipeline-correctness`; `uapi/.env.local` then restart `dev:remote`:
  - `BITCODE_ASSET_PACK_REAL_INFERENCE=true` — the ONLY required flag. Do NOT set
    `BITCODE_ASSET_PACK_REAL_INFERENCE_PROFILE` (profiles removed, F26-A; it is a no-op).
  - Anthropic key present (default `claude-haiku-4-5` since 2026-07-03; `BITCODE_LLM_MODEL` overrides).
  - `BITCODE_PIPELINE_HOST` unset (defaults to `inline`) — the dev Node server IS the
    inline host, so it must have `git` on PATH + a writable temp dir.
- Supabase LOCAL (decided 2026-07-03): `uapi/.env.local` points at the local stack
  (`127.0.0.1:54321`, `supabase start`/Docker running); `dev:remote` serves against it directly.
  A connected GitHub repo (`vcs_repositories` row + an active `user_connections` github row).
  Pick a small/medium real TS or Python repo (meaningful sizes).
- Restart `dev:remote` AFTER pulling the 2026-07-02/03 correctness wave (stitch self-repair,
  store topology, PCC keys-selection, Thinkings rename, haiku default) — a server predating
  it runs stale code.

**1. Run (manual)** — `/deposits` → select repo + revision → optionally add obfuscations
+ protected-IP exclusions (e.g. `secret/`) + demand context → Synthesize options → watch
the streaming accordion log.

**2. Acceptance criteria + log copy points** (line = accordion / `execution_events`; UI = the option card)

| # | What | COPY | PASS |
|---|---|---|---|
| Host | `Provisioning {repo}@{ref} on the inline host…` then `Checkout ready: N files (M withheld by K protected-IP exclusions; full source measured, S prompt excerpts).` | the "Checkout ready" line | N = the repo's REAL tracked-file count (full repo, not ≤400/≤10); "full source measured"; M = exclusion-withheld files. FAIL if N≤10 or "samples"/API language → stopgap still active |
| Pipeline | `Running SynthesizeAssetPacks (deposit mode): Setup → Discovery → Implementation → Validation → Finish…` | the Phase pills from telemetry | all five phases present; Validation never skipped |
| Absolutes | Validation telemetry shows `AssetPackMeasureAbsolutesAgent:deposit`; card measurements tile: `Functions: <N> functions · <v>% / weight 0.18`, `Types`, `File span`, `Correctness · <v>% / weight 0.28`, `Semantic volume` | the tile values + `output.depositOptionSynthesis.options[i].measurements` | size measures carry `magnitude`(int)+`unit`+`category:'absolute'`; magnitudes are plausible real counts; weights sum to 1. FAIL if `source-coverage`/`demand-alignment`/`reuse-likelihood` appear → placeholders still in use |
| Card payload | option card emerald panel "If deposited, Bitcode receives": patchSummary + "Synthesized contents · N file(s)" (op-colored create/modify/delete) + "Provenant source · N files available to Bitcode" | `…options[i].contents` (patchSummary, fileChanges, provenantSourcePaths, provenantSourceCount) + screenshot | BOTH the synthesized contents AND the provenant source files shown prominently; fileChanges are path+op only (no raw code) |
| Neediness | amber tile `Neediness · est. read demand <v>% · demand <d>% · saturation <s>%` + rationale | `…options[i].neediness` | present on deposit options; `volume = clamp01(demand×(0.5+0.5(1−saturation)))`; rationale source-safe |
| Completion | `Validated candidates fail-closed: A admissible, D dropped.` then `Synthesized X measured AssetPack options (T tokens, Ds s).` | the `executions` row (id=runId): `context` (pipelineCore=`AssetPacksSynthesis`, synthesisMode, optionCount, excludedPathCount, inventoryPathCount) + `output` | status=`completed`; optionCount ≥ 1; options carry absolutes + contents + neediness. The options MUST materialize from the route's completion read (`GET /api/executions/history/<runId>` → `.output.depositOptionSynthesis.options`) — zero options with a completed pipeline = the store-topology regression (fixed 2026-07-03, test-pinned) |
| Sidecar | `~/.bitcode/logs/executions/<runId>/` exists (the REAL run id, not `run`), files named `NNNNN-phase-agent-step-failsafe-generation.{request\|response\|error}.json` | `ls` the dir | per-run dir present; any failure writes `.error.json` with the literal request on disk |
| PCC selection | telemetry shows the `prepare_concise_context` selection generations then `context:selectedKeys` non-empty; `context:missingKeys` absent or small | the `context` namespace events | selected keys resolve (lenient resolver, 2026-07-03); an all-missing selection = the shorthand-resolution regression |
| Failsafe badges | failsafe pills read `handle large inputs` / `handle large outputs`; real failsafe work badges as `· chunk N` / `· sum` / `· stitch ×N` | screenshot of a badged row (if any triggered) | stitch ×N converges in ≤2 (self-repair carries the schema error); no `exceeded maximum stitch attempts` failure |

**3. Source-safety (the telemetry contract — all must hold)**
- Accordion log + `execution_events` + the `executions` row `output`: NO raw source lines,
  NO raw prompts, NO raw provider responses, NO secrets.
- Telemetry rows are ONLY LLM-call (`generation`) + Tool-use, each with the full
  Phase→Agent→Step→Failsafe→Thricified pills; no ```` ```json ````/`{`-fragment rows.
- In the persisted synthesis: every `options[i].visibility.*` flag is `false`
  (rawSourceTextVisible, rawPromptVisible, rawProviderResponseVisible, …).
- Grep the `output` JSON for `PRIVATE_SOURCE_DO_NOT_SERIALIZE`, `BEGIN_PRIVATE_KEY`, and
  any verbatim ≥40-char source line from the repo → must be ABSENT.
  (`assertDepositAssetPackOptionSynthesisSourceSafe` runs server-side; this is the manual cross-check.)

**4. Automated baseline** (run before + after the manual pass; expect all green)
```
pnpm -C packages/agent-generics exec jest
pnpm -C packages/pipelines/asset-pack exec jest --config jest.config.cjs    # 45 suites / 227
pnpm -C packages/pipeline-hosts exec jest --config jest.config.cjs          # 6 suites / 34
cd uapi && pnpm exec jest depositSourceProvisioning depositSynthesizeOptionsRoute depositPageClient   # 3 / 14
```

**5. #25 SandboxHost in-box dispatch (deployment-conditional)**
- Local default is inline. To exercise the sandbox path: `BITCODE_PIPELINE_HOST=sandbox`
  + `BITCODE_SANDBOX_PROVIDER=vercel` + the sandbox infra (`@vercel/sandbox`, `VERCEL_OIDC_TOKEN`
  or `VERCEL_TOKEN`/`VERCEL_TEAM_ID`/`VERCEL_PROJECT_ID`, git in the box image).
- Log: `Dispatching deposit synthesis to the sandbox host (in-box) for {repo}@{ref}…` then
  `sandbox: sandbox-create-started` / `sandbox-created` / `command-started` / … / `sandbox-stopped`.
- PASS: the box clones + runs the deposit SDIVF in-box; `evidence.depositOptions` returns;
  the SAME deposit option synthesis persists as an inline run of the same repo/revision
  (modulo run-to-run LLM variance). If the sandbox infra isn't deployed, mark N/A — this is
  the single deployment-pending item.

**6. QA record** (fill per run)

| Criterion | Log/UI copied | Pass/Fail | Run id / notes |
|---|---|---|---|
| Host — full checkout | | | |
| Pipeline — 5 phases, Validation present | | | |
| Absolutes — real sizes (magnitude+unit+category) | | | |
| Card — contents + provenant source | | | |
| Neediness | | | |
| Completion — persisted synthesis | | | |
| Source-safety — no leak | | | |
| Automated baseline green | | | |
| #25 sandbox in-box (or N/A) | | | |

**Pulling a run's persisted output** (for the COPY targets) — Supabase SQL editor:
```sql
select status, context, jsonb_pretty(output->'depositOptionSynthesis') as synthesis
from executions where id = '<runId>';
-- per-option absolutes / contents / neediness only:
select jsonb_pretty(output->'depositOptionSynthesis'->'options') from executions where id = '<runId>';
```
or the history API the client uses (authenticated session):
`GET /api/executions/history/<runId>` → `.output.depositOptionSynthesis`; e.g.
`… | jq '.output.depositOptionSynthesis.options[] | {title, measurements, contents, neediness}'`
(source-safe fields only). The `runId` is in the `Synthesized X measured AssetPack options…`
completion event and the `/deposits` URL after dispatch.

## Track 3 — Reading

- [ ] Read request on /reads
- [ ] Need synthesis + review
- [ ] Finding Fits + fit measurement review + BTC-testnet quote
- [ ] Settle (testnet) → observation → finality → BTD rights readback
- [ ] Repository PR delivery readback

## Track 4 — Ledgerized Journaling

- [ ] /packs master-detail: states, proof roots, repair surface
- [ ] Replay/audit: journaled rows match actions taken
- [ ] Auxillaries personal history readback
