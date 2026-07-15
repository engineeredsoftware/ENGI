# Security

**Status:** non-canonical operational guide for the living monorepo.  
**Product law:** `.specifications/BITCODE_SPEC.txt` and the active / draft-target
`BITCODE_SPEC_V*` family. If this file conflicts with the SPEC, the **SPEC wins**.

This document states **minimum, high-impact controls** for safe commercial work
on the V48 website (staging-testnet posture). Prefer concrete, implemented
controls over abstract policy. Expand only when a control is real in source,
migrations, middleware, or runbooks.

Related orientation (also non-canonical):

| Doc | Use for |
| --- | --- |
| [`.docs/DEPLOYMENT.md`](DEPLOYMENT.md) | Env vars, OAuth callbacks, deploy checklist |
| [`.docs/SUPABASE.md`](SUPABASE.md) | Public vs service-role clients, auth routes |
| [`.docs/VERCEL.md`](VERCEL.md) | Preview / sandbox pipeline host law |
| [`.docs/ETHEREUM.md`](ETHEREUM.md) | BTD registry chain vs Bitcoin fee rail (do not confuse) |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) §4–§8 | Env modes, source-safety, CI |
| [`packages/security/README.md`](../packages/security/README.md) | `@bitcode/security-*` package map |

---

## 1. Commercial posture (truth)

| Topic | Current truth |
| --- | --- |
| Product surfaces | `apps/uapi` routes (`/deposits`, `/reads`, `/packs`, `/docs`, Auxillaries); product MCP tools in `apps/mcp` |
| Settlement money | **BTC-testnet** (`NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK=testnet4` by default). Value-bearing **mainnet is blocked** until future canon admits it (`packages/btd` migration / fee gates). |
| Sellable unit | **AssetPack** = synthesized patch + measurements + metadata — never raw unpaid source as the product unit |
| Source-safety | First-class: no protected/raw source, unpaid pack source, raw prompts/provider responses, credentials, wallet private material, or private settlement payloads on product surfaces or proof artifacts |
| Pipeline host | **Serverless (Vercel) always sandbox** (`VERCEL=1` / Preview / Production). Local machine may use LocalHost; explicit `BITCODE_PIPELINE_HOST=local` is ignored on serverless |
| Proof / QA artifacts | `.proofs/*` and PROVEN outputs are **source-safe metadata only** — never real secrets |

---

## 2. Hard “never” list

1. **Never commit secrets** — service-role keys, GitHub App private keys, OAuth client secrets, wallet material, provider API keys, webhook secrets.
2. **Never put service-role (or admin) keys in `NEXT_PUBLIC_*` or browser bundles.**
3. **Never product-expose protected or unpaid source**, raw LLM prompts/responses, or private settlement payloads.
4. **Never serialize real secrets into** `.proofs/` proofs, gate reports, or marketing/docs fixtures.
5. **Never enable value-bearing mainnet** until canon + BTD gates admit it.
6. **Never treat `window.ethereum` as a Bitcoin wallet** (see `.docs/ETHEREUM.md`).
7. **Never log full tokens, private keys, or full webhook secrets** — prefixes for debug only if unavoidable.

---

## 3. Secrets and environment

### Homes

| File | Role |
| --- | --- |
| `apps/uapi/.env.example` | Documented template (**committed**, placeholders only) |
| `apps/uapi/.env.local` | Operator secrets (**never commit**) |
| Root `.env.local` | Host/staging scripts only when needed; prefer uapi-local for the app |
| Vercel project env | Preview / Production secrets; OIDC for sandbox create |

Copy once:

```bash
cp apps/uapi/.env.example apps/uapi/.env.local
```

### Core groups (non-exhaustive)

Names and split must match `.env.example` / `.docs/DEPLOYMENT.md` — not older V26 aliases.

| Group | Examples | Rule |
| --- | --- | --- |
| **Supabase (public)** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe only |
| **Supabase (server)** | `SUPABASE_SERVICE_ROLE_KEY` (and accepted admin aliases per SUPABASE.md) | **Server only** |
| **Wallet auth** | `BITCODE_BITCOIN_OAUTH_*`, `NEXT_PUBLIC_BITCODE_BITCOIN_NETWORK` | Custom provider `custom:bitcode-bitcoin`; testnet4 default |
| **GitHub App** | `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`, **`GITHUB_PRIVATE_KEY`**, `GITHUB_WEBHOOK_SECRET` | One shared app across local/preview/staging/prod. Private key = **PEM contents / escaped PEM / base64 PEM** — **not** a local `.pem` path |
| **LLM** | `ANTHROPIC_API_KEY` / `XAI_API_KEY` / `OPENAI_API_KEY`, optional `BITCODE_LLM_*` | Server-side only |
| **Pipeline host** | `BITCODE_PIPELINE_HOST`, `BITCODE_PIPELINE_SANDBOX_IMAGE`, host runtime limits | Sandbox forced on Vercel |
| **Real inference** | `BITCODE_ASSET_PACK_REAL_INFERENCE*` | Off by default in examples |

**Rotation:** rotate service-role keys, GitHub App private keys, webhook secrets, and OAuth client secrets on a calendar; revoke previous GitHub App keys after deploy. On suspected compromise, rotate **all** of the above and invalidate sessions immediately.

---

## 4. Identity, access control, and ownership

- Authenticate users on privileged routes and API handlers (`packages/auth`, Supabase session). Public marketing `/docs` and marketing pages may be anonymous; **state-changing and data-bearing product APIs are not.**
- Prefer **user-scoped** queries: explicit `user_id` (or equivalent ownership) **and** RLS — not “trust the client filter alone.”
- Service-role / admin clients are for **server** work that must bypass RLS (admin repairs, privileged joins). Document why; never import admin clients into client components.
- Organization / treasury authority is product-gated (solo operator vs org — see SPEC and QA ledgers). Do not invent bootstrap paths that the SPEC denies.

---

## 5. Database (Supabase / Postgres)

- User-scoped tables use **Row Level Security** in maintained migrations under `supabase/migrations/`. New tables: ship with RLS + policies in the same change set.
- **Anon / user JWT clients** must not be used as a way to “just make the write work” when RLS fails — fix policies or use an audited server path.
- Admin client construction must **fail closed** when admin credentials are missing or are not a service-role credential (see pipeline readback / ORM helpers).
- Data-health and schema checks: `supabase/DATA_HEALTH.md`, `packages/orm` data-health suites (`schema`, `ci`, `qa`, …).

---

## 6. GitHub App and VCS tokens

Implemented primarily under `packages/generic-vcs/github`, `packages/vcs-generics`, and API adapters.

| Control | Expectation |
| --- | --- |
| App JWT | Generate **on demand** from `GITHUB_PRIVATE_KEY`; do not persist JWTs to disk |
| Installation tokens | Short-lived; refresh before expiry; **in-memory**, per-installation cache only |
| Webhooks | Verify `x-hub-signature-256` with `GITHUB_WEBHOOK_SECRET` using **constant-time** compare before side effects |
| Scope | Installation tokens for **repository-scoped** automation; do not use broad user PATs for pipeline clone/provision |
| Logging | Never log full tokens or private keys; JWT helper rejects file-path private keys |

Misconfigured App credentials must surface as configuration errors (see V48 Gate 3 finding F34-class handling) — not silent no-ops that look like empty repos.

---

## 7. Pipeline hosts and execution isolation

Deposit/read synthesis runs on a **pipeline host**, not in the Next request thread for long work.

| Host | When | Security intent |
| --- | --- | --- |
| **Sandbox** (Vercel Sandbox + Pipeliner image) | All serverless (Preview/Production); optional local | Isolate clone/synthesis; force sandbox when `VERCEL=1` |
| **LocalHost** | Developer machines only | Fast iteration; still no secret logging |

Rules:

- Do not weaken host selection to run privileged work on the edge function filesystem.
- Treat clone/work directories as **ephemeral**. Normalize paths; do not follow user-controlled paths outside the host working directory.
- Prefer vetted commands (`git`, host plan runners) over arbitrary shell. **Do not** execute untrusted user binaries from deposit sources.
- Sandbox image pin: `BITCODE_PIPELINE_SANDBOX_IMAGE` / containers under `containers/images/pipeliner/`.

Detail: `.docs/VERCEL.md`, `packages/pipeline-hosts`, `apps/uapi/lib/deposit-source-provisioning.ts`.

---

## 8. Source-safety (product invariant)

Source-safety is **not** optional polish; it is commercial law (SPEC + CONTRIBUTING §8.4).

**Never product-expose:**

- protected / raw source  
- unpaid AssetPack source  
- raw prompts / raw provider responses  
- credentials, wallet private material, private settlement payloads  

**Do:**

- Stream and persist telemetry through **`sourceSafeStreamEvent`** (and related filters in `packages/pipelines-generics` / execution streaming adapters).
- Show **source-safe** descriptors, measurements, proof roots, and allowlisted preview fields only.
- Prefer **Unestimatable** over invented demand or revenue numbers.
- Keep deposit synthesis (SDIVF), option review, and read preview paths on source-safe contracts (`packages/asset-packs-pipelines`, measurement packages).

Proof generators and gate scripts must remain source-safe: no secret values, no raw repo bodies in `.proofs/*`.

---

## 9. Streaming, pipelines, and persistence

- Guard writable streams; **close once**, tolerate double-close.
- Never stream secrets. Event payloads must be **user-scoped**, sanitized, and minimal.
- Prefer explicit event types and structured persistence (`event_type` + minimal `event_data`) — content-bearing stores emit **stubs**, not full protected bodies.
- Correlation IDs should cross request ↔ stream ↔ pipeline run boundaries for incident reconstruction.

---

## 10. HTTP edge: headers, CORS, CSRF, rate limits

`apps/uapi` middleware stack (order matters — see `apps/uapi/middleware/index.ts`):

telemetry → **security-headers** → **cors** → **rate-limit** → authentication → …

| Layer | Package / home | Expectation |
| --- | --- | --- |
| Security headers / CSP | `apps/uapi/middleware/security-headers.ts`, `@bitcode/security-headers` | Restrictive CSP; `X-Frame-Options: DENY`; `nosniff`; HSTS in production; no-store on sensitive paths |
| CORS | `apps/uapi/middleware/cors.ts` | Allow-list origins (`ALLOWED_ORIGINS` + known first-party). **No `*`** on credentialed requests |
| CSRF | `@bitcode/security-headers` | Protect state-changing first-party POSTs; same-origin expectations for SPA |
| Rate limit | `apps/uapi/middleware/rate-limit.ts`, `@bitcode/security-rate-limiting` | Per-route / per-identity limits for abuse and brute force |
| Validation | `@bitcode/security-validation`, route Zod schemas | Reject malformed bodies with **4xx**; do not process then fail open |

Frontend:

- Avoid `dangerouslySetInnerHTML` for untrusted content; sanitize if HTML is unavoidable.
- Do not ship admin APIs or credentials to the browser.
- Secure form helpers: `@bitcode/security-client`.

---

## 11. MCP product surface

`apps/mcp` exposes **product** tools (measure, synthesize deposit/read packs, packs, auxiliary profile/wallet/interfaces/externals) — not an open multi-provider kitchen sink.

| Control | Expectation |
| --- | --- |
| Auth | Authenticate MCP requests; bind tools to a user/org context |
| Rate limits | Per-user / org / tool-class limiters (`apps/mcp` rate-limit middleware) |
| Inputs | Schema-validate tool args; fail closed |
| Side effects | Same source-safety and service-role rules as uapi — MCP is not a backdoor around RLS |
| Secrets | Provider credentials stay server-side; never echo into tool results |

Do not reintroduce “enable every cloud MCP” flags as a substitute for product-scoped tools.

---

## 12. BTD, fees, and wallet material

- **BTC** is settlement money (testnet in V48 deployment). **BTD** is non-fungible share / read-right language on the ledger — not a prepaid fiat product.
- Wallet OAuth and authorize/callback flows live under `apps/uapi/app/tps/*` and `packages/auth` — treat codes and tokens like session secrets.
- Fee / settlement readiness must respect **blocked mainnet** and source-safe receipts (`packages/btd`).
- Ethereum / registry notes are **not** the Bitcoin fee rail (`.docs/ETHEREUM.md`).

---

## 13. Logging, audit, and monitoring

| Concern | Expectation |
| --- | --- |
| Structure | Structured logs; prefer error **codes** + minimal messages |
| Redaction | Tokens, PII, private keys, full webhook bodies redacted |
| Audit | `@bitcode/security-audit` for security-relevant events |
| Monitoring | `@bitcode/security-monitoring` thresholds where wired |
| Central errors | Sentry (or equivalent) with correlation id, route, user id — **not** full request bodies with secrets |

Rate-limit and auth failures should be countable for anomaly detection without logging secrets.

---

## 14. Dependencies and supply chain

- Pin versions via **pnpm-lock.yaml**; commit lockfile changes with intent.
- Prefer maintained packages for crypto, auth, and HTTP security.
- Run vulnerability triage in CI where enabled; patch high/critical before relying on a path in production.
- Heavy security scanners (advanced CodeQL, etc.) may be **opt-in** via repo variables — do not assume they replace the controls above.

---

## 15. Incident response (minimum)

1. **Contain** — disable compromised integrations (GitHub App, OAuth client, LLM keys); freeze streaming/synthesis if needed.
2. **Rotate** — Supabase service-role, GitHub App private key + webhook secret, OAuth secrets, provider API keys; revoke installation tokens.
3. **Invalidate** — sessions / refresh tokens for affected users.
4. **Assess** — logs with correlation IDs; pipeline run ids; which hosts (local vs sandbox) ran.
5. **Record** — source-safe incident note (no secret material); follow SPEC/QA ledger if a gate finding is required.

Keep runbooks short and real: how to rotate `GITHUB_PRIVATE_KEY`, revoke installations, rotate service-role, and force-fail open synthesis if the host is unhealthy.

---

## 16. Data retention

- Prefer structured `event_type` + minimal `event_data` over bulk content dumps.
- Drop attachments / clone artifacts when the host run ends; do not retain user uploads “just in case.”
- Depository / search projections must remain **source-safe** (metadata and measurements, not protected bodies).

---

## 17. Implementation map (where code lives)

| Area | Primary homes |
| --- | --- |
| Security utilities | `packages/security/*` (`encryption`, `credentials`, `headers`, `rate-limiting`, `audit`, `validation`, `monitoring`, `error-handling`, `client`, `twilio`) |
| uapi edge middleware | `apps/uapi/middleware/` |
| Supabase clients | `packages/supabase`, `packages/orm` |
| Auth / wallet | `packages/auth` |
| GitHub App / webhooks | `packages/generic-vcs/github`, `packages/vcs-generics` |
| Source-safe streaming | `packages/pipelines-generics` (`sourceSafeStreamEvent`), execution stream adapters |
| Deposit / read synthesis safety | `packages/asset-packs-pipelines`, measurement packages, `packages/pipeline-hosts` |
| BTD / fee / mainnet block | `packages/btd` |
| MCP auth + rate limits | `apps/mcp/src/auth`, `apps/mcp/src/middleware` |
| Env templates | `apps/uapi/.env.example`, root `.env.example` |

---

## 18. How to change this document

- Keep it **concise and non-marketing**.
- Add a control only when it is **implemented or an explicit operational expectation** backed by code/migration/runbook.
- When structure or env names move, update this file in the **same** change set as FAMILIARIZATION / DEPLOYMENT if those trees teach the same fact.
- Do not version-brand sections after superseded commercial eras (GA‑1, V26-only claims) unless documenting historical behavior that still exists as code.
