# Security Guidelines (V26)

This document captures the minimum, critical controls required to begin safe GA‑1 production rollout. It focuses on practical, high‑impact items already present in the codebase and tightens usage expectations.

## Secrets and Environment

- Use environment variables for all credentials. Never commit secrets to the repo.
- Required (non‑exhaustive):
 - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 - GitHub App: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`
 - Email/Sentry/Analytics providers as applicable
- Source `.env` / `.env.local` before CLI actions (e.g., migrations). Avoid per‑dir duplication.
- Rotate keys regularly; for GitHub App private keys, maintain a rotation calendar and revoke old keys.

## Database (Supabase/PostgREST)

- Row Level Security (RLS) is enabled in GA‑1 migrations for user‑scoped tables.
- Use service‑role key only on backend/route handlers (never on client).
- Admin client is lazily initialized to prevent import‑time crashes and to fail fast if env is missing.
- Do not bypass RLS with anon keys; always scope by user auth in routes.

## Token Handling (GitHub)

- Never log full tokens. Only log non‑sensitive prefixes/suffixes as necessary for debugging.
- Installation tokens must be refreshed before expiry; cache belongs in memory with per‑installation scoping.
- Short‑lived JWTs: Generate GitHub App JWTs on demand, never persist to disk.
 - Webhooks: Verify `x-hub-signature-256` with `GITHUB_WEBHOOK_SECRET` (constant‑time compare) before processing.
 - Scope: Use installation tokens strictly for repository‑scoped actions; avoid user tokens for automation.

## Streaming (SSE)

- Always guard writable streams; close once, tolerate double‑close.
- Never stream secrets. Event payloads must be user‑scoped, sanitized and minimal.
- Use explicit event types (`status`, `phase`, `agent`, `error`, `completion`), and persist structured events to DB with `event_type`, `event_data`.

## File Operations and Execution Safety

- All editing operations are transactional and recorded via the file operation log; do not execute arbitrary shell beyond vetted commands (e.g., `git`) required for cloning.
- Treat file paths from user input defensively; normalize and restrict to the repo working directory.
- Avoid executing untrusted code or running user‑supplied binaries.

## Tools and Providers Gating

- Gate MCP/tool wrappers behind explicit env flags to avoid bundling unnecessary providers in prod (e.g., `BITCODE_ENABLE_MCP_AWS`, `BITCODE_ENABLE_MCP_VERCEL`).
- Avoid importing MCP servers into pipeline routes. Use wrappers only.

## Logging

- Log with structured payloads; redact tokens and PII.
- Use correlation IDs across request/stream boundaries.
- Error logs must not include secrets; prefer error codes + minimal messages.
 - Rate‑limit logs: enable per‑route/per‑IP counters for anomaly detection (e.g., rapid retries, brute force).

## Client ↔ Server Contracts

- Validate route inputs (Read text, repo identifiers, attachments) and reject malformed payloads with 4xx.
- Stream only those fields required by the UI; rely on typed contracts and avoid accidental over‑sharing.
 - CSRF: Protect state‑changing endpoints; for first‑party SPA, enforce same‑origin and anti‑CSRF token on non‑SSE POSTs.
 - CORS: Restrict `Access‑Control‑Allow‑Origin` to trusted origins only; do not use `*` on credentialed requests.

## Frontend Security

- Keep CSP restrictive (no inline scripts if feasible) and prefer hashed/nonce patterns for any exception.
- Sanitize any HTML rendered from external inputs; avoid `dangerouslySetInnerHTML`.
- Do not expose admin endpoints or credentials to the browser.

## Dependencies and Supply Chain

- Pin dependency versions via lockfiles; update regularly.
- Use `npm audit`/equivalent in CI; triage and patch high severity issues.
- Avoid abandoned packages for security‑sensitive areas.

## Incident Response (Minimum)

- Capture critical errors centrally (Sentry or similar). Include correlation ID, route, user id.
- On suspected compromise: rotate keys, revoke tokens, and invalidate sessions immediately.
- Maintain a brief runbook: how to disable streaming, rotate GitHub App private key, revoke installation tokens, lock DB service key.

## Data Retention

- Minimize persisted event data; store structured `event_type` + minimal `event_data` only.
- Remove attachments/artifacts when no longer needed; avoid retaining user uploads unnecessarily.

## Access Control

- Verify user auth on every route (no exceptions).
- Enforce user ownership in all DB queries (via RLS and explicit `user_id` filters).
- Admin operations are restricted to service‑role contexts; never expose admin clients to the browser.

---

This file is intentionally concise and non‑marketing. It enumerates the essential controls already wired into GA‑1 and the operational expectations for safe production rollout. Expand incrementally with concrete, implemented controls rather than abstract policy.
